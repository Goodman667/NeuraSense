"""
Unified Chat API - 统一对话接口
POST /api/v1/chat

整合所有模块的核心 API 端点：
1. PHQ-9 隐形评估 (Module 4)
2. Neo4j 知识图谱推理 (Module 5)
3. Avatar 指令生成 (Module 6)

使用 asyncio.gather 并行执行 LLM 调用和图谱查询，减少用户等待时间。
"""

from dataclasses import dataclass
from typing import Optional
import asyncio

from pydantic import BaseModel, Field


# =====================================================
# REQUEST/RESPONSE MODELS
# =====================================================

class BioSignals(BaseModel):
    """生物信号数据（前端 5 秒聚合后发送）"""
    avg_blink_rate: float = Field(default=15.0, description="平均眨眼频率 (BPM)")
    voice_jitter: float = Field(default=0.0, description="语音抖动百分比 (0-100)")
    fatigue_index: float = Field(default=0.0, description="疲劳指数/PERCLOS (0-100)")
    shimmer: Optional[float] = Field(default=None, description="语音振幅抖动 (0-100)")
    avg_ear: Optional[float] = Field(default=None, description="平均眼睛张开度 (0-1)")


class ConversationMessage(BaseModel):
    """对话消息"""
    role: str = Field(..., description="消息角色: user 或 assistant")
    content: str = Field(..., description="消息内容")


class UnifiedChatRequest(BaseModel):
    """统一对话请求"""
    user_id: str = Field(..., description="用户唯一标识")
    message: str = Field(..., description="用户消息文本")
    conversation_history: Optional[list[ConversationMessage]] = Field(default=None, description="对话历史")
    bio_signals: Optional[BioSignals] = Field(default=None, description="生物信号数据")
    session_id: Optional[str] = Field(default=None, description="会话 ID")


class AvatarCommand(BaseModel):
    """Avatar 控制指令"""
    emotion: str = Field(default="calm", description="目标情绪状态")
    breathing_bpm: int = Field(default=12, description="目标呼吸频率")
    enable_entrainment: bool = Field(default=False, description="是否启用呼吸夹带")
    mirror_fatigue: bool = Field(default=False, description="是否镜像用户疲劳")


class UnifiedChatResponse(BaseModel):
    """统一对话响应"""
    reply_text: str = Field(..., description="AI 回复文本")
    avatar_command: AvatarCommand = Field(default_factory=AvatarCommand, description="Avatar 控制指令")
    diagnosis_context: Optional[str] = Field(default=None, description="诊断上下文（调试用）")
    phq9_score: Optional[int] = Field(default=None, description="当前 PHQ-9 累积分数")
    risk_flag: bool = Field(default=False, description="危机标记")


# =====================================================
# CHAT SERVICE
# =====================================================

class UnifiedChatService:
    """
    统一对话服务
    
    整合隐形评估、知识图谱推理和 Avatar 指令生成
    """
    
    def __init__(self):
        # 延迟导入避免循环依赖
        from app.services.assessment import AssessmentManager
        from app.services.knowledge import ClinicalLogicEngine, SymptomRecord
        from app.services.llm import CounselorService
        
        self.counselor = CounselorService()
        self.clinical_engine = ClinicalLogicEngine()
        
        # 会话管理
        self._sessions: dict[str, AssessmentManager] = {}
    
    def _get_session(self, user_id: str, session_id: Optional[str] = None):
        """获取或创建评估会话"""
        from app.services.assessment import AssessmentManager
        
        key = session_id or user_id
        if key not in self._sessions:
            self._sessions[key] = AssessmentManager(key)
        return self._sessions[key]
    
    async def process_chat(self, request: UnifiedChatRequest) -> UnifiedChatResponse:
        """
        处理对话请求
        
        流程：
        1. 调用 Gemini LLM 生成智能回复
        2. 并行执行隐形评估 + 图谱推理（后台）
        3. 生成 Avatar 控制指令
        """
        session = self._get_session(request.user_id, request.session_id)
        
        # Step 1: 如果有生物信号，更新图谱
        if request.bio_signals:
            await self._update_bio_signals(request.user_id, request.bio_signals)
        
        # Step 2: 并行执行任务（关键：使用 LLM 生成真实回复）
        # 将 Pydantic 对象转换为字典列表
        history_dicts = None
        if request.conversation_history:
            history_dicts = [
                {"role": msg.role, "content": msg.content}
                for msg in request.conversation_history
            ]
        
        counselor_task = self.counselor.generate_response(
            user_message=request.message,
            conversation_history=history_dicts,
            emotion_context=None,
        )
        assessment_task = self._run_stealth_assessment(session, request.message)
        inference_task = self._run_graph_inference(request.user_id)
        
        # asyncio.gather 并行执行所有任务
        counselor_result, assessment_result, inference_result = await asyncio.gather(
            counselor_task,
            assessment_task,
            inference_task,
            return_exceptions=True
        )
        
        # 处理异常
        if isinstance(counselor_result, Exception):
            print(f"Counselor LLM call failed: {counselor_result}")
            counselor_result = None
        if isinstance(assessment_result, Exception):
            assessment_result = None
        if isinstance(inference_result, Exception):
            inference_result = None
        
        # Step 3: 生成最终回复（优先使用 LLM 回复）
        if counselor_result and counselor_result.message:
            reply_text = counselor_result.message
            risk_flag = counselor_result.crisis_flag
        else:
            reply_text = self._generate_fallback_reply(assessment_result, inference_result)
            risk_flag = assessment_result.risk_flag if assessment_result else False
        
        # Step 4: 生成 Avatar 指令
        avatar_command = self._generate_avatar_command(
            request.bio_signals,
            assessment_result
        )
        
        # Step 5: 生成诊断上下文（调试用）
        diagnosis_context = self._generate_diagnosis_context(
            assessment_result,
            inference_result
        )
        
        return UnifiedChatResponse(
            reply_text=reply_text,
            avatar_command=avatar_command,
            diagnosis_context=diagnosis_context,
            phq9_score=session.get_total_score() if session else None,
            risk_flag=risk_flag,
        )
    
    async def _update_bio_signals(self, user_id: str, signals: BioSignals):
        """更新生物信号到图谱"""
        try:
            # 更新 Jitter 生物标记
            if signals.voice_jitter > 0:
                await self.clinical_engine.update_biomarker(
                    user_id, "High Voice Jitter", signals.voice_jitter
                )
            
            # 更新 PERCLOS 生物标记
            if signals.fatigue_index > 50:
                await self.clinical_engine.update_biomarker(
                    user_id, "High PERCLOS", signals.fatigue_index
                )
        except Exception as e:
            print(f"Failed to update bio signals: {e}")
    
    async def _run_stealth_assessment(self, session, message: str):
        """运行隐形 PHQ-9 评估"""
        try:
            return session.process_user_input(message)
        except Exception as e:
            print(f"Stealth assessment failed: {e}")
            return None
    
    async def _run_graph_inference(self, user_id: str):
        """运行图谱推理"""
        try:
            return await self.clinical_engine.infer_potential_disorders(user_id)
        except Exception as e:
            print(f"Graph inference failed: {e}")
            return None
    
    def _generate_fallback_reply(self, assessment_result, inference_result) -> str:
        """生成最终回复"""
        if assessment_result and assessment_result.reply_to_user:
            base_reply = assessment_result.reply_to_user
        else:
            base_reply = "我在认真听你说。能告诉我更多吗？"
        
        # 如果图谱推理发现需要排除的生理疾病，添加提示
        if inference_result:
            for disorder in inference_result.inferred_disorders:
                if "Hypothyroidism" in disorder.name and disorder.risk_score > 3:
                    # 不直接提及诊断，但建议体检
                    if "体检" not in base_reply and "医生" not in base_reply:
                        base_reply += " 另外，如果这些感觉持续了一段时间，建议也可以做个常规体检。"
                    break
        
        return base_reply
    
    def _generate_avatar_command(
        self, 
        bio_signals: Optional[BioSignals],
        assessment_result
    ) -> AvatarCommand:
        """生成 Avatar 控制指令"""
        command = AvatarCommand()
        
        # 默认情绪
        emotion = "calm"
        breathing_bpm = 12
        enable_entrainment = False
        mirror_fatigue = False
        
        if bio_signals:
            # 高疲劳 -> 启用呼吸夹带干预
            if bio_signals.fatigue_index > 60:
                enable_entrainment = True
                breathing_bpm = 6  # 目标：0.1Hz 副交感激活频率
                mirror_fatigue = True
            
            # 高焦虑 (Jitter) -> 关切表情 + 呼吸干预
            if bio_signals.voice_jitter > 50:
                emotion = "concerned"
                enable_entrainment = True
                breathing_bpm = 6
            
            # 低眨眼率可能表示专注或疲劳
            if bio_signals.avg_blink_rate < 10:
                mirror_fatigue = True
        
        # 根据评估结果调整
        if assessment_result:
            if assessment_result.risk_flag:
                # 危机模式：保持平静但关切
                emotion = "concerned"
                enable_entrainment = True
                breathing_bpm = 6
        
        return AvatarCommand(
            emotion=emotion,
            breathing_bpm=breathing_bpm,
            enable_entrainment=enable_entrainment,
            mirror_fatigue=mirror_fatigue,
        )
    
    def _generate_diagnosis_context(
        self,
        assessment_result,
        inference_result
    ) -> str:
        """生成诊断上下文日志"""
        parts = []
        
        if assessment_result:
            parts.append(f"[PHQ-9] {assessment_result.thought_process[:200] if assessment_result.thought_process else 'N/A'}")
        
        if inference_result:
            parts.append(f"[Graph] {inference_result.reasoning_summary}")
        
        return " | ".join(parts) if parts else "No diagnosis context available"


# =====================================================
# SINGLETON INSTANCE
# =====================================================

_chat_service: Optional[UnifiedChatService] = None

def get_chat_service() -> UnifiedChatService:
    global _chat_service
    if _chat_service is None:
        _chat_service = UnifiedChatService()
    return _chat_service
