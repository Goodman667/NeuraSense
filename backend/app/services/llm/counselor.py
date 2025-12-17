"""
Counselor Service

LLM-based psychological counselor service that generates empathetic,
supportive responses in Chinese using Claude/Gemini/other LLMs.

Key features:
- Warm, professional tone
- Extensive use of empathetic language
- Mandatory Chinese responses
- Mental health context awareness
- Long-term memory via vector store
"""

from dataclasses import dataclass, field
from typing import Optional
from enum import Enum
import os

# 导入向量记忆服务
try:
    from ..memory.vector_store import vector_memory
    MEMORY_AVAILABLE = True
except ImportError:
    vector_memory = None
    MEMORY_AVAILABLE = False


class ResponseStyle(str, Enum):
    """回复风格"""
    EMPATHETIC = "empathetic"      # 共情为主
    SUPPORTIVE = "supportive"      # 支持鼓励
    EDUCATIONAL = "educational"    # 心理教育
    EXPLORATORY = "exploratory"    # 探索引导


@dataclass
class CounselorResponse:
    """
    心理咨询师回复
    """
    # 主要回复内容
    message: str
    
    # 后续问题（用于继续对话）
    follow_up_question: Optional[str] = None
    
    # 建议的应对策略
    coping_suggestions: list[str] = field(default_factory=list)
    
    # 相关心理学知识
    psychoeducation: Optional[str] = None
    
    # 是否需要专业转介
    needs_referral: bool = False
    
    # 危机干预标记
    crisis_flag: bool = False
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "message": self.message,
            "follow_up_question": self.follow_up_question,
            "coping_suggestions": self.coping_suggestions,
            "psychoeducation": self.psychoeducation,
            "needs_referral": self.needs_referral,
            "crisis_flag": self.crisis_flag,
        }


class CounselorService:
    """
    心理咨询师服务
    
    使用 LLM (Claude/Gemini) 生成温暖、专业的心理咨询回复
    """
    
    # LLM API 配置 - 使用智谱 AI API Key
    LLM_API_KEY = os.getenv("LLM_API_KEY", "b667b5eae22e4780816a8b38a1a32b0d.ZsMkH3UUfvgxyToT")
    LLM_MODEL = os.getenv("LLM_MODEL", "glm-4-flash")
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "zhipuai")
    
    # 系统提示词 - 核心配置
    SYSTEM_PROMPT = """你是一位温暖、专业的心理咨询师，名叫"小心"。你的任务是以共情、支持的方式与用户交流。

## 核心要求

1. **必须使用中文回复**，语气要温柔、亲切
2. **多使用共情语句**，让用户感到被理解和接纳，例如：
   - "我理解你的感受..."
   - "这确实不容易..."
   - "听起来你经历了很多..."
   - "谢谢你愿意与我分享..."
   - "你的感受是完全合理的..."
   - "我能感受到你的..." 

3. **避免评判**，不要使用"你应该"、"你必须"这样的强制性语言
4. **保持专业边界**，你是AI助手，不是真正的心理医生
5. **注意危机信号**，如用户提到自杀、自伤，要表达关心并建议寻求专业帮助

## 回复风格指南

### 开场回应
- 先反映用户的情绪："听起来你现在感到..."
- 表达理解和接纳

### 中间对话
- 使用开放式问题引导用户探索
- 适当分享心理学知识
- 提供具体可行的建议

### 结束语
- 总结对话要点
- 给予鼓励和支持
- 提供后续资源

## 共情表达库

### 理解感受
- "我能理解那种感觉..."
- "这种情况下有这样的感受是很正常的..."
- "很多人在类似情况下也会有相同的感受..."

### 表达支持
- "无论发生什么，你都值得被善待..."
- "愿意面对这些问题本身就需要很大的勇气..."
- "你比想象中更坚强..."

### 探索引导
- "可以告诉我更多关于...的情况吗？"
- "当你说...的时候，是什么感受呢？"
- "有没有什么事情曾经帮助你感觉好一些？"

## 危机响应

如果用户表现出以下信号，务必：
1. 表达关心："我很担心你现在的状态..."
2. 询问安全："你现在安全吗？"
3. 提供资源："全国24小时心理援助热线：400-161-9995"
4. 建议寻求帮助："建议你联系专业的危机干预服务..."

记住：你是用户安全温暖的倾听者。用你的话语传递关怀。"""

    # 共情短语库
    EMPATHY_PHRASES = [
        "我理解你的感受",
        "这确实不容易",
        "听起来你经历了很多",
        "谢谢你愿意与我分享",
        "你的感受是完全合理的",
        "我能感受到你的心情",
        "这种情况下有这些感受很正常",
        "你愿意说出来需要很大勇气",
        "我在这里倾听你",
        "无论发生什么，你都值得被关心",
    ]
    
    # 危机关键词
    CRISIS_KEYWORDS = [
        "自杀", "不想活", "结束生命", "死", "活着没意思",
        "自残", "伤害自己", "割腕", "跳楼",
        "没有希望", "绝望", "解脱",
    ]
    
    def __init__(self):
        """初始化服务"""
        self._client = None
    
    def get_system_prompt(self) -> str:
        """
        获取系统提示词
        """
        return self.SYSTEM_PROMPT
    
    def check_crisis_signals(self, text: str) -> bool:
        """
        检查危机信号
        """
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.CRISIS_KEYWORDS)
    
    async def generate_response(
        self,
        user_message: str,
        user_id: str = "anonymous",
        conversation_history: Optional[list[dict]] = None,
        emotion_context: Optional[dict] = None,
        style: ResponseStyle = ResponseStyle.EMPATHETIC,
    ) -> CounselorResponse:
        """
        生成咨询师回复
        
        Args:
            user_message: 用户消息
            conversation_history: 对话历史
            emotion_context: 情感分析结果（来自 EmotionFusionService）
            style: 回复风格
            
        Returns:
            CounselorResponse 咨询师回复
        """
        # 检查危机信号
        crisis_flag = self.check_crisis_signals(user_message)
        
        # 获取长期记忆上下文
        memory_context = ""
        if MEMORY_AVAILABLE and vector_memory:
            try:
                # 检索过去3天的相关记忆
                relevant_memories = await vector_memory.retrieve_relevant(
                    user_id=user_id,
                    query=user_message,
                    days=3,
                    top_k=5
                )
                if relevant_memories:
                    memory_context = vector_memory.format_context_for_prompt(relevant_memories)
                    memory_context = f"\n【用户历史对话记忆】\n{memory_context}\n"
            except Exception as e:
                print(f"Memory retrieval failed: {e}")
        
        # 构建上下文（包含长期记忆）
        context = self._build_context(
            user_message, 
            emotion_context,
            style
        )
        if memory_context:
            context = memory_context + context
        
        # 尝试调用 LLM API
        if self.LLM_API_KEY:
            try:
                response = await self._call_llm(
                    user_message,
                    context,
                    conversation_history,
                    crisis_flag
                )
                
                # 保存到长期记忆
                if MEMORY_AVAILABLE and vector_memory:
                    try:
                        await vector_memory.add_memory(user_id, user_message, "user")
                        await vector_memory.add_memory(user_id, response.message, "assistant")
                    except Exception as e:
                        print(f"Memory save failed: {e}")
                
                return response
            except Exception as e:
                print(f"LLM API call failed: {e}")
        
        # 使用模板生成回复（后备方案）
        return self._generate_fallback_response(
            user_message,
            emotion_context,
            crisis_flag
        )
    
    def _build_context(
        self,
        user_message: str,
        emotion_context: Optional[dict],
        style: ResponseStyle,
    ) -> str:
        """
        构建额外上下文
        """
        context_parts = []
        
        if emotion_context:
            if emotion_context.get("emotional_inconsistency"):
                context_parts.append(
                    "【注意】用户可能存在情绪不一致（微笑抑郁风险），"
                    "虽然言语积极但语音特征显示低落。请特别关注其真实感受。"
                )
            
            risk_level = emotion_context.get("risk_level")
            if risk_level in ["moderate", "high"]:
                context_parts.append(
                    f"【风险提示】检测到{risk_level}级别风险，请在回复中表达关心。"
                )
        
        if style == ResponseStyle.EDUCATIONAL:
            context_parts.append("请在回复中适当加入心理学知识科普。")
        elif style == ResponseStyle.EXPLORATORY:
            context_parts.append("请多使用开放式问题引导用户自我探索。")
        
        return "\n".join(context_parts)
    
    async def _call_llm(
        self,
        user_message: str,
        context: str,
        conversation_history: Optional[list[dict]],
        crisis_flag: bool,
    ) -> CounselorResponse:
        """
        调用智谱 AI (GLM-4) 生成回复
        """
        try:
            from zhipuai import ZhipuAI
            
            # 使用智谱 AI API Key
            api_key = self.LLM_API_KEY
            client = ZhipuAI(api_key=api_key)
            
            # 构建消息列表（包含对话历史）
            messages = [
                {
                    "role": "system",
                    "content": """你是一位温暖、专业的心理咨询师"小心"。

规则：
1. 用中文回复，语气温柔亲切，像朋友聊天
2. 多使用共情语句，如"我理解..."、"这确实不容易..."
3. 回复简短自然（2-4句话）
4. 记住用户之前说的内容，保持对话连贯性
5. 不要使用"你应该"这种说教语气
6. 如果用户提到自杀/自伤，表达关心并提供热线：400-161-9995"""
                }
            ]
            
            # 添加对话历史（保持上下文）
            if conversation_history:
                for msg in conversation_history:
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            # 添加当前用户消息
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # 调用 GLM-4 API
            response = client.chat.completions.create(
                model="glm-4-flash",
                messages=messages,
                temperature=0.8,  # 稍微提高创意性
                max_tokens=300,   # 允许更长回复
            )
            
            # 解析回复
            reply_text = response.choices[0].message.content
            
            return CounselorResponse(
                message=reply_text,
                follow_up_question=None,
                crisis_flag=crisis_flag,
                needs_referral=crisis_flag,
            )
            
        except ImportError:
            print("zhipuai not installed, using fallback")
            raise
        except Exception as e:
            print(f"Zhipu AI error: {e}")
            raise
    
    def _generate_fallback_response(
        self,
        user_message: str,
        emotion_context: Optional[dict],
        crisis_flag: bool,
    ) -> CounselorResponse:
        """
        生成后备回复（当 LLM API 不可用时）
        使用预设模板
        """
        import random
        
        # 危机响应
        if crisis_flag:
            return CounselorResponse(
                message=(
                    "我很担心你现在的状态。听到你说这些，我想让你知道，"
                    "你的感受是真实的，你值得被帮助。\n\n"
                    "如果你正在经历困难时刻，请立即联系专业帮助：\n"
                    "• 全国24小时心理援助热线：400-161-9995\n"
                    "• 北京心理危机研究与干预中心：010-82951332\n"
                    "• 生命热线：400-821-1215\n\n"
                    "你愿意告诉我，现在你安全吗？"
                ),
                crisis_flag=True,
                needs_referral=True,
            )
        
        # 根据情感上下文选择回复
        if emotion_context:
            risk_type = emotion_context.get("risk_type", "")
            
            if risk_type == "smiling_depression":
                return CounselorResponse(
                    message=(
                        f"{random.choice(self.EMPATHY_PHRASES)}。"
                        "我注意到虽然你说的内容听起来还不错，"
                        "但我感觉你可能还有一些没有说出口的感受。\n\n"
                        "有时候我们习惯性地说\"还好\"、\"没事\"，"
                        "但内心却不一定是这样的。这完全没关系，"
                        "你不需要在任何人面前假装坚强。\n\n"
                        "如果你愿意的话，可以告诉我，最近有什么事情让你感到困扰吗？"
                    ),
                    follow_up_question="最近有什么事情让你感到困扰吗？",
                    psychoeducation=(
                        "「微笑抑郁」是一种隐藏的抑郁形式，"
                        "患者会在外表保持开朗，但内心却在承受痛苦。"
                        "这并不代表不坚强，而是一种值得关注的心理状态。"
                    ),
                )
        
        # 通用共情回复
        empathy_phrase = random.choice(self.EMPATHY_PHRASES)
        
        return CounselorResponse(
            message=(
                f"{empathy_phrase}。谢谢你愿意与我分享这些。\n\n"
                "我能感受到你正在经历一些事情。"
                "无论是什么，你的感受都是真实和重要的。\n\n"
                "你愿意告诉我更多吗？我在这里倾听你。"
            ),
            follow_up_question="你愿意告诉我更多吗？",
            coping_suggestions=[
                "尝试深呼吸，让自己放松下来",
                "与信任的朋友或家人聊聊",
                "记录下你的感受，把想法写下来",
            ],
        )
    
    def get_prompt_template(self) -> dict:
        """
        获取提示词模板（用于自定义）
        """
        return {
            "system_prompt": self.SYSTEM_PROMPT,
            "empathy_phrases": self.EMPATHY_PHRASES,
            "crisis_keywords": self.CRISIS_KEYWORDS,
            "usage_instructions": """
使用说明：

1. 系统提示词 (System Prompt) 定义了 AI 的角色和行为规范
2. 共情短语库可用于模板回复或作为 LLM 的参考
3. 危机关键词用于检测需要紧急干预的情况

调用 LLM 时，将 system_prompt 作为系统消息发送，
用户消息作为用户消息发送，即可获得符合要求的回复。
"""
        }
