/**
 * Premium Psychological Counseling Chat Interface
 *
 * Features:
 * - Modern glassmorphism UI with gradient accents
 * - Voice input via Web Speech API
 * - Non-blocking TTS (can send messages while bot is speaking)
 * - Typing indicators
 * - Message timestamps
 * - Emotion indicators
 * - Structured exercise integration (CBT Thought Record, Behavior Activation)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../../config/api';

// ==================== Types ====================

interface ExerciseAction {
    type: 'OPEN_EXERCISE';
    exercise: 'THOUGHT_RECORD' | 'BEHAVIOR_ACTIVATION';
    context?: { trigger_thought?: string; trigger_context?: string };
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
    emotion?: string;
    isSpeaking?: boolean;
    action?: ExerciseAction;
}

interface PsyChatProps {
    onSendMessage: (message: string) => Promise<{
        reply_text: string;
        risk_flag?: boolean;
        avatar_command?: {
            emotion?: string;
            enable_entrainment?: boolean;
        };
        action?: ExerciseAction;
    }>;
    onSpeak?: (text: string, emotion?: string) => void;
    onStopSpeaking?: () => void;
    isSpeaking?: boolean;
    onBack?: () => void;
    authToken?: string | null;
    userId?: string;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Format time
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};


// ==================== Exercise Components ====================

/** ThoughtRecordExercise — 4-step CBT thought record */
const ThoughtRecordExercise = ({
    context,
    onFinish,
}: {
    context?: { trigger_thought?: string };
    onFinish: (data: Record<string, string>) => void;
}) => {
    const [step, setStep] = useState(0);
    const [values, setValues] = useState([
        context?.trigger_thought || '',
        '',
        '',
        '',
    ]);

    const steps = [
        { title: '自动化想法', prompt: '刚才脑海中浮现了什么自动化的消极想法？', placeholder: '例如：我总是做不好任何事情...' },
        { title: '证据支持', prompt: '有什么证据支持这个想法？', placeholder: '例如：上次项目确实出了一些问题...' },
        { title: '证据反驳', prompt: '有什么证据反驳这个想法？', placeholder: '例如：其实上个月的项目我做得不错，同事也夸奖过我...' },
        { title: '更平衡的想法', prompt: '综合两方面的证据，有没有更平衡的看法？', placeholder: '例如：虽然有时候会出错，但我也有做得好的时候，我在不断进步...' },
    ];

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            onFinish({
                automatic_thought: values[0],
                supporting_evidence: values[1],
                counter_evidence: values[2],
                balanced_thought: values[3],
            });
        }
    };

    return (
        <div className="py-4">
            <div className="flex justify-between mb-6">
                {steps.map((_, i) => (
                    <div key={i} className="flex items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? 'bg-purple-600 text-white' : 'bg-warm-100 text-warm-300'}`}>
                            {i + 1}
                        </span>
                        {i < 3 && <div className={`w-8 h-0.5 ${i < step ? 'bg-purple-600' : 'bg-warm-200'}`} />}
                    </div>
                ))}
            </div>
            <h4 className="font-bold text-warm-800 mb-2">{steps[step].title}</h4>
            <p className="text-warm-600 text-sm mb-3">{steps[step].prompt}</p>
            <textarea
                value={values[step]}
                onChange={(e) => {
                    const newValues = [...values];
                    newValues[step] = e.target.value;
                    setValues(newValues);
                }}
                placeholder={steps[step].placeholder}
                className="w-full p-3 border border-warm-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
            />
            <button
                onClick={handleNext}
                disabled={!values[step].trim()}
                className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium disabled:opacity-50"
            >
                {step < 3 ? '下一步' : '完成练习'}
            </button>
        </div>
    );
};


/** BehaviorActivationExercise — 3-step action plan */
const BehaviorActivationExercise = ({
    onFinish,
}: {
    onFinish: (data: Record<string, string>) => void;
}) => {
    const [step, setStep] = useState(0);
    const [chosenAction, setChosenAction] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    const suggestedActions = [
        '散步10分钟', '给朋友发一条消息', '整理一下桌面',
        '听一首喜欢的歌', '喝一杯温水', '做5分钟拉伸',
    ];

    const steps = [
        { title: '选择一个小行动', description: '不需要很大，哪怕是一个微小的行动也是一步前进。' },
        { title: '设置时间', description: '给自己设一个具体的时间，更容易坚持。' },
        { title: '确认计划', description: '你已经制定了行动计划。' },
    ];

    return (
        <div className="py-4">
            <div className="flex justify-between mb-6">
                {steps.map((_, i) => (
                    <div key={i} className="flex items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? 'bg-green-600 text-white' : 'bg-warm-100 text-warm-300'}`}>
                            {i + 1}
                        </span>
                        {i < 2 && <div className={`w-16 h-0.5 ${i < step ? 'bg-green-600' : 'bg-warm-200'}`} />}
                    </div>
                ))}
            </div>

            <h4 className="font-bold text-warm-800 mb-2">{steps[step].title}</h4>
            <p className="text-warm-600 text-sm mb-4">{steps[step].description}</p>

            {step === 0 && (
                <>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {suggestedActions.map((action) => (
                            <button
                                key={action}
                                onClick={() => setChosenAction(action)}
                                className={`px-3 py-2 rounded-xl text-sm border transition-all ${chosenAction === action ? 'bg-green-100 border-green-400 text-green-700' : 'bg-warm-50 border-warm-200 text-warm-600 hover:bg-warm-100'}`}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={chosenAction}
                        onChange={(e) => setChosenAction(e.target.value)}
                        placeholder="或者输入你自己的想法..."
                        className="w-full p-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        onClick={() => setStep(1)}
                        disabled={!chosenAction.trim()}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium disabled:opacity-50"
                    >
                        下一步
                    </button>
                </>
            )}

            {step === 1 && (
                <>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {['现在就做', '30分钟后', '1小时后', '今天下午', '明天上午'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setScheduledTime(t)}
                                className={`px-3 py-2 rounded-xl text-sm border transition-all ${scheduledTime === t ? 'bg-green-100 border-green-400 text-green-700' : 'bg-warm-50 border-warm-200 text-warm-600 hover:bg-warm-100'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setStep(2)}
                        disabled={!scheduledTime}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium disabled:opacity-50"
                    >
                        下一步
                    </button>
                </>
            )}

            {step === 2 && (
                <div className="text-center py-4">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                        <p className="text-green-800 font-medium">{chosenAction}</p>
                        <p className="text-green-600 text-sm mt-1">{scheduledTime}</p>
                    </div>
                    <button
                        onClick={() => onFinish({ chosen_action: chosenAction, scheduled_time: scheduledTime })}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium"
                    >
                        确认计划
                    </button>
                </div>
            )}
        </div>
    );
};


/** ExerciseModal — Glassmorphism overlay wrapper */
const ExerciseModal = ({
    exercise,
    context,
    onComplete,
    onDismiss,
}: {
    exercise: 'THOUGHT_RECORD' | 'BEHAVIOR_ACTIVATION';
    context?: { trigger_thought?: string; trigger_context?: string };
    onComplete: (exerciseData: Record<string, string>, postMood: number) => void;
    onDismiss: () => void;
}) => {
    const [phase, setPhase] = useState<'exercise' | 'feedback'>('exercise');
    const [exerciseResult, setExerciseResult] = useState<Record<string, string>>({});
    const [postMood, setPostMood] = useState(5);

    const config = exercise === 'THOUGHT_RECORD'
        ? { icon: '💭', title: 'CBT 思维记录', gradient: 'from-purple-500 to-indigo-500' }
        : { icon: '🎯', title: '行为激活计划', gradient: 'from-green-500 to-emerald-500' };

    const handleExerciseFinish = (data: Record<string, string>) => {
        setExerciseResult(data);
        setPhase('feedback');
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white relative`}>
                    <button
                        onClick={onDismiss}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                    <div className="flex items-center space-x-3">
                        <span className="text-4xl">{config.icon}</span>
                        <h3 className="font-bold text-xl">{config.title}</h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {phase === 'exercise' && exercise === 'THOUGHT_RECORD' && (
                        <ThoughtRecordExercise context={context} onFinish={handleExerciseFinish} />
                    )}
                    {phase === 'exercise' && exercise === 'BEHAVIOR_ACTIVATION' && (
                        <BehaviorActivationExercise onFinish={handleExerciseFinish} />
                    )}
                    {phase === 'feedback' && (
                        <div className="text-center py-4">
                            <span className="text-5xl mb-4 block">🎉</span>
                            <h4 className="text-xl font-bold text-warm-800 mb-2">做得很棒！</h4>
                            <p className="text-warm-600 mb-6">现在感觉怎么样？</p>
                            <div className="mb-6">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={postMood}
                                    onChange={(e) => setPostMood(Number(e.target.value))}
                                    className="w-full accent-purple-500"
                                />
                                <div className="flex justify-between text-2xl mt-2">
                                    <span>😔</span><span>😐</span><span>😊</span>
                                </div>
                                <p className="text-warm-500 mt-2">心情: {postMood}/10</p>
                            </div>
                            <button
                                onClick={() => onComplete(exerciseResult, postMood)}
                                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium"
                            >
                                完成 ✓
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


/** ExerciseSuggestionCard — Non-intrusive card below assistant message */
const ExerciseSuggestionCard = ({
    exercise,
    onAccept,
    onDismiss,
}: {
    exercise: 'THOUGHT_RECORD' | 'BEHAVIOR_ACTIVATION';
    onAccept: () => void;
    onDismiss: () => void;
}) => {
    const config = exercise === 'THOUGHT_RECORD'
        ? { icon: '💭', title: '认知重构练习', desc: '记录想法，换个角度看问题', gradient: 'from-purple-500 to-indigo-500' }
        : { icon: '🎯', title: '行为激活练习', desc: '选择一个小行动，迈出第一步', gradient: 'from-green-500 to-emerald-500' };

    return (
        <div className="mt-2 ml-8 max-w-[70%] animate-fadeIn">
            <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <p className="font-medium text-warm-800 text-sm">{config.title}</p>
                        <p className="text-warm-500 text-xs">{config.desc}</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onAccept}
                        className={`flex-1 py-2 bg-gradient-to-r ${config.gradient} text-white rounded-xl text-sm font-medium`}
                    >
                        试试看
                    </button>
                    <button
                        onClick={onDismiss}
                        className="px-3 py-2 text-warm-400 hover:text-warm-600 text-sm"
                    >
                        稍后
                    </button>
                </div>
            </div>
        </div>
    );
};


// ==================== Main PsyChat Component ====================

export const PsyChat = ({
    onSendMessage,
    onSpeak,
    onStopSpeaking,
    isSpeaking = false,
    onBack,
    authToken,
}: PsyChatProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: generateId(),
            role: 'assistant',
            text: '你好！我是小心，你的心理健康助手。今天感觉怎么样？有什么想和我聊聊的吗？',
            timestamp: new Date(),
            emotion: 'friendly',
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Exercise state
    const [activeExercise, setActiveExercise] = useState<{
        exercise: 'THOUGHT_RECORD' | 'BEHAVIOR_ACTIVATION';
        context?: { trigger_thought?: string; trigger_context?: string };
    } | null>(null);
    const [dismissedActions, setDismissedActions] = useState<Set<string>>(new Set());

    // Check for Web Speech API support
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setVoiceSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'zh-CN';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join('');
                setInputText(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Toggle voice input
    const toggleVoiceInput = useCallback(() => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            // Stop TTS if playing
            if (isSpeaking && onStopSpeaking) {
                onStopSpeaking();
            }
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening, isSpeaking, onStopSpeaking]);

    // Send message
    const handleSend = useCallback(async () => {
        const text = inputText.trim();
        if (!text || isLoading) return;

        // Stop any ongoing TTS
        if (isSpeaking && onStopSpeaking) {
            onStopSpeaking();
        }

        // Add user message
        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await onSendMessage(text);

            // Add assistant message (with optional action)
            const assistantMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                text: response.reply_text,
                timestamp: new Date(),
                emotion: response.avatar_command?.emotion || (response.risk_flag ? 'concerned' : 'friendly'),
                action: response.action || undefined,
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Start speaking (non-blocking)
            if (onSpeak) {
                onSpeak(response.reply_text, assistantMessage.emotion);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                {
                    id: generateId(),
                    role: 'assistant',
                    text: '抱歉，我现在遇到了一些问题。请稍后再试。',
                    timestamp: new Date(),
                    emotion: 'sorry',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading, isSpeaking, onSendMessage, onSpeak, onStopSpeaking]);

    // Handle exercise completion
    const handleExerciseComplete = useCallback(async (
        exerciseData: Record<string, string>,
        postMood: number,
        exerciseType: 'THOUGHT_RECORD' | 'BEHAVIOR_ACTIVATION',
    ) => {
        setActiveExercise(null);

        // Save to backend (best-effort)
        if (authToken) {
            try {
                await fetch(`${API_BASE}/exercises/records?token=${authToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        exercise_type: exerciseType,
                        exercise_data: exerciseData,
                        post_mood: postMood,
                        trigger_source: 'chat',
                    }),
                });
            } catch (e) {
                console.error('Failed to save exercise:', e);
            }
        }

        // Add completion message to chat
        const completionTexts: Record<string, string> = {
            THOUGHT_RECORD: '你刚刚完成了一个思维记录练习，做得很棒！换个角度看问题，会发现事情并不总是那么糟糕。继续保持这种觉察力。',
            BEHAVIOR_ACTIVATION: '你已经制定了一个行动计划！迈出第一步就是最大的胜利。记得按计划行动哦，完成后会感觉好很多的。',
        };

        setMessages(prev => [...prev, {
            id: generateId(),
            role: 'assistant',
            text: completionTexts[exerciseType],
            timestamp: new Date(),
            emotion: 'supportive',
        }]);
    }, [authToken]);

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Get emotion icon
    const getEmotionIcon = (emotion?: string) => {
        switch (emotion) {
            case 'friendly': return '😊';
            case 'concerned': return '😟';
            case 'supportive': return '🤗';
            case 'sad': return '😢';
            case 'sorry': return '🙏';
            default: return '💜';
        }
    };

    return (
        <div className="max-w-3xl mx-auto h-[calc(100dvh-200px)] flex flex-col">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-t-3xl p-6 shadow-xl relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-300 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                            <span className="text-3xl">🧠</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">小心 · AI心理咨询师</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-white/80 text-sm">在线 · 随时倾听</span>
                            </div>
                        </div>
                    </div>

                    {/* Status indicators */}
                    <div className="flex items-center space-x-3">
                        {isSpeaking && (
                            <button
                                onClick={onStopSpeaking}
                                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-sm flex items-center space-x-2 transition-all"
                            >
                                <span className="animate-pulse">🔊</span>
                                <span>点击停止</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-gradient-to-b from-purple-50/80 to-white backdrop-blur-sm overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                                {/* Avatar for assistant */}
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-lg">{getEmotionIcon(msg.emotion)}</span>
                                        <span className="text-xs text-warm-400">{formatTime(msg.timestamp)}</span>
                                    </div>
                                )}

                                {/* Message bubble */}
                                <div
                                    className={`px-5 py-3 rounded-2xl shadow-sm ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-md'
                                            : 'bg-white border border-purple-100 text-warm-700 rounded-bl-md'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                </div>

                                {/* Timestamp for user */}
                                {msg.role === 'user' && (
                                    <div className="text-right mt-1">
                                        <span className="text-xs text-warm-400">{formatTime(msg.timestamp)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Exercise suggestion card */}
                        {msg.role === 'assistant' && msg.action && !dismissedActions.has(msg.id) && (
                            <ExerciseSuggestionCard
                                exercise={msg.action.exercise}
                                onAccept={() => {
                                    setActiveExercise({
                                        exercise: msg.action!.exercise,
                                        context: msg.action!.context,
                                    });
                                }}
                                onDismiss={() => {
                                    setDismissedActions(prev => new Set(prev).add(msg.id));
                                }}
                            />
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                        <div className="bg-white border border-purple-100 px-5 py-3 rounded-2xl rounded-bl-md shadow-sm">
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">💭</span>
                                <div className="flex space-x-1">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-warm-500 text-sm">正在思考...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white/90 backdrop-blur-md border-t border-purple-100 p-4 rounded-b-3xl shadow-lg">
                {/* Voice input indicator */}
                {isListening && (
                    <div className="mb-3 flex items-center justify-center">
                        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-full flex items-center space-x-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-600 text-sm font-medium">正在听你说话...</span>
                        </div>
                    </div>
                )}

                <div className="flex items-end space-x-3">
                    {/* Voice input button */}
                    {voiceSupported && (
                        <button
                            onClick={toggleVoiceInput}
                            className={`p-3 rounded-xl transition-all ${isListening
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                }`}
                            title={isListening ? '停止录音' : '语音输入'}
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                            </svg>
                        </button>
                    )}

                    {/* Text input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="输入你想说的话..."
                            rows={1}
                            className="w-full px-5 py-3 pr-12 bg-gray-50 border border-purple-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all text-warm-700 placeholder-warm-400"
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                    </div>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isLoading}
                        className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>

                {/* Quick suggestions */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {['今天心情不太好', '想聊聊压力', '最近睡眠不好'].map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => setInputText(suggestion)}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full text-sm transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>

            {/* Back button */}
            {onBack && (
                <div className="text-center mt-4">
                    <button onClick={onBack} className="text-warm-500 hover:text-warm-700 transition-colors">
                        ← 返回首页
                    </button>
                </div>
            )}

            {/* Exercise Modal */}
            {activeExercise && (
                <ExerciseModal
                    exercise={activeExercise.exercise}
                    context={activeExercise.context}
                    onComplete={(data, mood) => handleExerciseComplete(data, mood, activeExercise.exercise)}
                    onDismiss={() => setActiveExercise(null)}
                />
            )}
        </div>
    );
};

export default PsyChat;
