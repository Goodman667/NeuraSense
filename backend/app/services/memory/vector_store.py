"""
Vector Memory Store Service

Local vector storage for conversation history and long-term memory.
Uses simple cosine similarity for retrieval without external dependencies.
"""

import json
import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass, field
import numpy as np


@dataclass
class MemoryEntry:
    """记忆条目"""
    user_id: str
    content: str
    role: str  # 'user' or 'assistant'
    timestamp: datetime
    embedding: list[float] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "content": self.content,
            "role": self.role,
            "timestamp": self.timestamp.isoformat(),
            "embedding": self.embedding,
            "metadata": self.metadata,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "MemoryEntry":
        return cls(
            user_id=data["user_id"],
            content=data["content"],
            role=data["role"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            embedding=data.get("embedding", []),
            metadata=data.get("metadata", {}),
        )


class VectorMemoryStore:
    """
    向量记忆存储服务
    
    提供基于向量相似度的对话历史检索，让AI具备长期记忆能力。
    使用本地JSON文件存储，无需外部数据库依赖。
    """
    
    STORAGE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "memory")
    EMBEDDING_DIM = 128  # 简化的嵌入维度
    
    _instance: Optional["VectorMemoryStore"] = None
    
    def __new__(cls):
        """单例模式"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self._memories: dict[str, list[MemoryEntry]] = {}
        self._ensure_storage_dir()
        self._load_all_memories()
        self._initialized = True
    
    def _ensure_storage_dir(self):
        """确保存储目录存在"""
        os.makedirs(self.STORAGE_DIR, exist_ok=True)
    
    def _get_user_file(self, user_id: str) -> str:
        """获取用户记忆文件路径"""
        safe_id = hashlib.md5(user_id.encode()).hexdigest()[:16]
        return os.path.join(self.STORAGE_DIR, f"memory_{safe_id}.json")
    
    def _load_all_memories(self):
        """加载所有用户的记忆"""
        if not os.path.exists(self.STORAGE_DIR):
            return
            
        for filename in os.listdir(self.STORAGE_DIR):
            if filename.startswith("memory_") and filename.endswith(".json"):
                filepath = os.path.join(self.STORAGE_DIR, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        user_id = data.get("user_id", "unknown")
                        entries = [MemoryEntry.from_dict(e) for e in data.get("entries", [])]
                        self._memories[user_id] = entries
                except Exception as e:
                    print(f"Failed to load memory file {filename}: {e}")
    
    def _save_user_memories(self, user_id: str):
        """保存用户记忆到文件"""
        filepath = self._get_user_file(user_id)
        entries = self._memories.get(user_id, [])
        
        data = {
            "user_id": user_id,
            "updated_at": datetime.now().isoformat(),
            "entries": [e.to_dict() for e in entries]
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def _generate_embedding(self, text: str) -> list[float]:
        """
        生成文本的简化嵌入向量
        
        使用字符级哈希生成伪嵌入，用于相似度计算。
        生产环境应替换为真实的嵌入模型 (sentence-transformers)。
        """
        # 使用文本的字符级特征生成向量
        embedding = [0.0] * self.EMBEDDING_DIM
        
        # 基于字符的哈希特征
        for i, char in enumerate(text):
            idx = ord(char) % self.EMBEDDING_DIM
            embedding[idx] += 1.0 / (1 + i * 0.1)
        
        # 添加n-gram特征
        for i in range(len(text) - 2):
            trigram = text[i:i+3]
            idx = hash(trigram) % self.EMBEDDING_DIM
            embedding[idx] += 0.5
        
        # L2归一化
        norm = np.sqrt(sum(x**2 for x in embedding))
        if norm > 0:
            embedding = [x / norm for x in embedding]
        
        return embedding
    
    def _cosine_similarity(self, vec1: list[float], vec2: list[float]) -> float:
        """计算余弦相似度"""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = np.sqrt(sum(a**2 for a in vec1))
        norm2 = np.sqrt(sum(b**2 for b in vec2))
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    async def add_memory(
        self, 
        user_id: str, 
        content: str, 
        role: str = "user",
        metadata: Optional[dict] = None
    ) -> MemoryEntry:
        """
        添加记忆条目
        
        Args:
            user_id: 用户ID
            content: 对话内容
            role: 角色 ('user' 或 'assistant')
            metadata: 额外元数据
            
        Returns:
            创建的记忆条目
        """
        if user_id not in self._memories:
            self._memories[user_id] = []
        
        embedding = self._generate_embedding(content)
        
        entry = MemoryEntry(
            user_id=user_id,
            content=content,
            role=role,
            timestamp=datetime.now(),
            embedding=embedding,
            metadata=metadata or {}
        )
        
        self._memories[user_id].append(entry)
        
        # 限制每个用户的记忆数量 (保留最近500条)
        if len(self._memories[user_id]) > 500:
            self._memories[user_id] = self._memories[user_id][-500:]
        
        # 异步保存
        self._save_user_memories(user_id)
        
        return entry
    
    async def retrieve_relevant(
        self,
        user_id: str,
        query: str,
        days: int = 3,
        top_k: int = 5
    ) -> list[MemoryEntry]:
        """
        检索相关记忆
        
        Args:
            user_id: 用户ID
            query: 查询文本
            days: 检索过去多少天的记录
            top_k: 返回最相关的条数
            
        Returns:
            相关记忆列表
        """
        if user_id not in self._memories:
            return []
        
        query_embedding = self._generate_embedding(query)
        cutoff_time = datetime.now() - timedelta(days=days)
        
        # 过滤时间范围内的记忆
        recent_memories = [
            m for m in self._memories[user_id]
            if m.timestamp >= cutoff_time
        ]
        
        if not recent_memories:
            return []
        
        # 计算相似度并排序
        scored_memories = []
        for memory in recent_memories:
            if memory.embedding:
                similarity = self._cosine_similarity(query_embedding, memory.embedding)
                scored_memories.append((similarity, memory))
        
        # 按相似度降序排序
        scored_memories.sort(key=lambda x: x[0], reverse=True)
        
        return [m for _, m in scored_memories[:top_k]]
    
    async def get_recent_context(
        self,
        user_id: str,
        limit: int = 10
    ) -> list[MemoryEntry]:
        """
        获取最近的对话上下文
        
        Args:
            user_id: 用户ID
            limit: 返回条数
            
        Returns:
            最近的记忆列表
        """
        if user_id not in self._memories:
            return []
        
        return self._memories[user_id][-limit:]
    
    def format_context_for_prompt(self, memories: list[MemoryEntry]) -> str:
        """
        格式化记忆为提示词上下文
        
        Args:
            memories: 记忆列表
            
        Returns:
            格式化后的上下文字符串
        """
        if not memories:
            return ""
        
        context_parts = []
        for m in memories:
            role_label = "用户" if m.role == "user" else "咨询师"
            time_str = m.timestamp.strftime("%Y-%m-%d %H:%M")
            context_parts.append(f"[{time_str}] {role_label}: {m.content[:200]}")
        
        return "\n".join(context_parts)
    
    async def get_user_stats(self, user_id: str) -> dict:
        """
        获取用户记忆统计
        """
        if user_id not in self._memories:
            return {"total_memories": 0, "days_active": 0}
        
        memories = self._memories[user_id]
        if not memories:
            return {"total_memories": 0, "days_active": 0}
        
        unique_days = len(set(m.timestamp.date() for m in memories))
        
        return {
            "total_memories": len(memories),
            "days_active": unique_days,
            "first_interaction": memories[0].timestamp.isoformat(),
            "last_interaction": memories[-1].timestamp.isoformat(),
        }


# 全局单例
vector_memory = VectorMemoryStore()
