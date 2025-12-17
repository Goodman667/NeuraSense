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
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
    emotion?: string;
    isSpeaking?: boolean;
}

interface PsyChatProps {
    onSendMessage: (message: string) => Promise<{
        reply_text: string;
        risk_flag?: boolean;
        avatar_command?: {
            emotion?: string;
            enable_entrainment?: boolean;
        };
    }>;
    onSpeak?: (text: string, emotion?: string) => void;
    onStopSpeaking?: () => void;
    isSpeaking?: boolean;
    onBack?: () => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Format time
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

export const PsyChat = ({
    onSendMessage,
    onSpeak,
    onStopSpeaking,
    isSpeaking = false,
    onBack,
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

            // Add assistant message
            const assistantMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                text: response.reply_text,
                timestamp: new Date(),
                emotion: response.avatar_command?.emotion || (response.risk_flag ? 'concerned' : 'friendly'),
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
        <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col">
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
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
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
        </div>
    );
};

export default PsyChat;
