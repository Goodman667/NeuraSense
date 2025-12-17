import { useRef, useState, useCallback, useEffect } from 'react';
import { useAppStore } from './store';
import { useGamificationStore } from './store/useGamificationStore';
import {
    VirtualAvatar,
    type VirtualAvatarRef,
    DrawingCanvas,
    ResultModal,
    type AssessmentResult,
    OculometricMonitor,
    VoiceAnalyzerMonitor,
    EmbodiedAvatar,
    type EmbodiedAvatarRef,
    ScaleSelector,
    AuthModal,
    UserAvatar,
    type UserInfo,
    BioSignalAIPanel,
    WelcomeGreeting,
    MoodJournal,
    CrisisPanel,
    AchievementCenter,
    EMACheckIn,
    CommunityFeed,
    PsyChat,
    GuardianCard,
    InterventionModal,
    PhysiologicalInsights,
    BiofeedbackScene,

    ImmersiveCard,
    UserGuide,
} from './components';
import {
    useBioSignalAggregator,
    useOculometricSensor,
    useVoiceAnalyzer,
    useKeystrokeDynamics,
    useJITAI,
    useHealthConnect,
    useDigitalPhenotyping
} from './hooks';

// API base URL
import { API_BASE } from './config/api';

// ====== INLINE STROOP TEST VIEW ======
interface StroopTestViewProps {
    onComplete: () => void;
}

const STROOP_COLORS = [
    { name: '红色', value: '#EF4444', key: 'r' },
    { name: '蓝色', value: '#3B82F6', key: 'b' },
    { name: '绿色', value: '#22C55E', key: 'g' },
    { name: '黄色', value: '#EAB308', key: 'y' },
];

const StroopTestView = ({ onComplete }: StroopTestViewProps) => {
    const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
    const [currentTrial, setCurrentTrial] = useState({ word: '红色', color: '#3B82F6', answer: '蓝色' });
    const [trialIndex, setTrialIndex] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [total] = useState(10);
    const startTimeRef = useRef(Date.now());
    const [avgTime, setAvgTime] = useState(0);
    const times: number[] = [];

    const generateTrial = useCallback(() => {
        const wordIdx = Math.floor(Math.random() * 4);
        const colorIdx = Math.random() < 0.3 ? wordIdx : (wordIdx + 1 + Math.floor(Math.random() * 3)) % 4;
        return {
            word: STROOP_COLORS[wordIdx].name,
            color: STROOP_COLORS[colorIdx].value,
            answer: STROOP_COLORS[colorIdx].name,
        };
    }, []);

    const startGame = () => {
        setPhase('playing');
        setTrialIndex(0);
        setCorrect(0);
        setCurrentTrial(generateTrial());
        startTimeRef.current = Date.now();
    };

    const handleAnswer = (colorName: string) => {
        const responseTime = Date.now() - startTimeRef.current;
        times.push(responseTime);

        if (colorName === currentTrial.answer) {
            setCorrect(c => c + 1);
        }

        if (trialIndex + 1 >= total) {
            setAvgTime(Math.round(times.reduce((a, b) => a + b, 0) / times.length));
            setPhase('result');
        } else {
            setTrialIndex(i => i + 1);
            setCurrentTrial(generateTrial());
            startTimeRef.current = Date.now();
        }
    };

    if (phase === 'intro') {
        return (
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-6">
                    <span className="text-4xl">🎮</span>
                </div>
                <h2 className="text-2xl font-bold text-warm-800 mb-4">Stroop 色词测试</h2>
                <p className="text-warm-600 mb-6">
                    屏幕上会显示颜色名称的文字，但文字本身的颜色可能不同。<br />
                    请<span className="font-bold text-purple-600">点击文字显示的颜色</span>，而不是文字的含义！
                </p>
                <div className="bg-warm-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-warm-500 mb-2">示例：</p>
                    <p className="text-3xl font-bold" style={{ color: '#3B82F6' }}>红色</p>
                    <p className="text-sm text-warm-500 mt-2">正确答案是：<span className="text-blue-500 font-bold">蓝色</span></p>
                </div>
                <button
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                    开始测试 ({total} 题)
                </button>
            </div>
        );
    }

    if (phase === 'playing') {
        return (
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-warm-500">第 {trialIndex + 1} / {total} 题</span>
                    <div className="w-32 h-2 bg-warm-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 transition-all"
                            style={{ width: `${((trialIndex + 1) / total) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="h-32 flex items-center justify-center mb-8">
                    <span
                        className="text-5xl font-bold"
                        style={{ color: currentTrial.color }}
                    >
                        {currentTrial.word}
                    </span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {STROOP_COLORS.map(color => (
                        <button
                            key={color.name}
                            onClick={() => handleAnswer(color.name)}
                            className="py-4 rounded-xl text-white font-medium transition-all hover:scale-105 active:scale-95"
                            style={{ backgroundColor: color.value }}
                        >
                            {color.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const accuracy = Math.round((correct / total) * 100);
    const score = Math.round(accuracy * 0.6 + Math.max(0, 100 - avgTime / 10) * 0.4);

    return (
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-4xl">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-warm-800 mb-6">测试完成！</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 rounded-xl p-4">
                    <div className={`text-3xl font-bold ${score >= 70 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{score}</div>
                    <div className="text-sm text-purple-400">综合评分</div>
                </div>
                <div className="bg-pink-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-pink-500">{accuracy}%</div>
                    <div className="text-sm text-pink-400">正确率</div>
                </div>
            </div>

            <div className="bg-warm-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between mb-2">
                    <span className="text-warm-600">正确题数</span>
                    <span className="font-medium">{correct} / {total}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-warm-600">平均反应时间</span>
                    <span className="font-medium">{avgTime}ms</span>
                </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700">
                {score >= 80 ? '🎉 太棒了！您的认知灵活性非常好！'
                    : score >= 60 ? '👍 不错！继续保持练习。'
                        : '💡 建议多进行类似的认知训练游戏。'}
            </div>

            <div className="flex space-x-3">
                <button onClick={startGame} className="flex-1 py-3 border border-purple-300 text-purple-600 rounded-xl hover:bg-purple-50">
                    再玩一次
                </button>
                <button onClick={onComplete} className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600">
                    完成
                </button>
            </div>
        </div>
    );
};

// ====== INLINE KEYSTROKE ANALYSIS VIEW ======
const KeystrokeAnalysisView = () => {
    const { metrics, isActive, startTracking, stopTracking } = useKeystrokeDynamics();
    const [text, setText] = useState('');
    const [showResult, setShowResult] = useState(false);

    const handleStart = () => {
        setText('');
        setShowResult(false);
        startTracking();
    };

    const handleStop = () => {
        stopTracking();
        setShowResult(true);
    };

    const getAnxietyColor = (idx: number) => {
        if (idx < 30) return 'text-green-500';
        if (idx < 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getFocusColor = (score: number) => {
        if (score >= 70) return 'text-green-500';
        if (score >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mx-auto flex items-center justify-center mb-4">
                        <span className="text-4xl">⌨️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-warm-800">键盘动力学分析</h2>
                    <p className="text-warm-600 mt-2">
                        通过分析您的打字模式（按键间隔、按键持续时间等）来评估焦虑和专注度
                    </p>
                </div>

                {!isActive && !showResult && (
                    <div className="text-center">
                        <p className="text-warm-500 mb-6">
                            点击开始后，请在下方输入框中自由打字（可以写任何内容），系统会实时分析您的打字模式。
                        </p>
                        <button
                            onClick={handleStart}
                            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                        >
                            开始分析
                        </button>
                    </div>
                )}

                {isActive && (
                    <>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="请开始打字...可以写下您今天的心情、想法，或者随意输入一些文字。"
                            className="w-full h-40 p-4 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none resize-none text-warm-800"
                            autoFocus
                        />

                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-amber-50 rounded-xl p-4 text-center">
                                <div className={`text-2xl font-bold ${getAnxietyColor(metrics.anxietyIndex)}`}>
                                    {metrics.anxietyIndex}
                                </div>
                                <div className="text-xs text-amber-500">焦虑指数</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 text-center">
                                <div className={`text-2xl font-bold ${getFocusColor(metrics.focusScore)}`}>
                                    {metrics.focusScore}
                                </div>
                                <div className="text-xs text-green-500">专注度</div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-blue-500">
                                    {metrics.typingSpeed}
                                </div>
                                <div className="text-xs text-blue-500">字/分</div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-purple-500">
                                    {metrics.totalKeystrokes}
                                </div>
                                <div className="text-xs text-purple-500">击键数</div>
                            </div>
                        </div>

                        <div className="mt-4 text-center text-sm text-warm-400">
                            {metrics.isTyping ? '✏️ 正在打字...' : '⏸️ 等待输入...'}
                            {' | '}会话时长: {metrics.sessionDuration}秒
                        </div>

                        <button
                            onClick={handleStop}
                            disabled={metrics.totalKeystrokes < 20}
                            className={`mt-6 w-full py-3 rounded-xl font-medium transition-all ${metrics.totalKeystrokes >= 20
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-warm-200 text-warm-400 cursor-not-allowed'
                                }`}
                        >
                            {metrics.totalKeystrokes >= 20 ? '结束分析' : `请至少输入 ${20 - metrics.totalKeystrokes} 个字符`}
                        </button>
                    </>
                )}

                {showResult && (
                    <div className="text-center">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6">
                                <div className={`text-4xl font-bold ${getAnxietyColor(metrics.anxietyIndex)}`}>
                                    {metrics.anxietyIndex}
                                </div>
                                <div className="text-sm text-amber-600 mt-1">焦虑指数</div>
                                <div className="text-xs text-warm-500 mt-2">
                                    {metrics.anxietyIndex < 30 ? '状态平静' : metrics.anxietyIndex < 60 ? '略有焦虑' : '焦虑较高'}
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-xl p-6">
                                <div className={`text-4xl font-bold ${getFocusColor(metrics.focusScore)}`}>
                                    {metrics.focusScore}
                                </div>
                                <div className="text-sm text-green-600 mt-1">专注度</div>
                                <div className="text-xs text-warm-500 mt-2">
                                    {metrics.focusScore >= 70 ? '非常专注' : metrics.focusScore >= 40 ? '一般专注' : '较分散'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-warm-50 rounded-xl p-4 text-sm text-left space-y-2 mb-6">
                            <div className="flex justify-between">
                                <span className="text-warm-600">打字速度</span>
                                <span className="font-medium">{metrics.typingSpeed} 字/分钟</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-warm-600">平均按键时间</span>
                                <span className="font-medium">{metrics.avgDwellTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-warm-600">按键间隔方差</span>
                                <span className="font-medium">{metrics.flightTimeVariance}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-warm-600">错误率</span>
                                <span className="font-medium">{metrics.errorRate}%</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 mb-6">
                            {metrics.anxietyIndex < 30
                                ? '✨ 您的打字模式显示心态平稳，节奏均匀，状态良好！'
                                : metrics.anxietyIndex < 60
                                    ? '💡 检测到轻度焦虑信号，建议适当休息放松。'
                                    : '⚠️ 打字模式显示较高焦虑，建议进行放松练习或与人交流。'}
                        </div>

                        <button
                            onClick={handleStart}
                            className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all"
                        >
                            重新测试
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ====== INLINE TREND PREDICTION VIEW ======
const TrendPredictionView = () => {
    const [predictionData, setPredictionData] = useState<{
        predicted_scores: number[];
        dates: string[];
        trend_direction: string;
        risk_level: string;
        model_confidence: number;
        interpretation: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/prediction/demo`)
            .then(res => res.json())
            .then(data => {
                setPredictionData(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return '📈 改善中';
            case 'worsening': return '📉 需关注';
            default: return '➡️ 稳定';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'bg-green-100 text-green-700';
            case 'moderate': return 'bg-yellow-100 text-yellow-700';
            case 'high': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
                        <span className="text-4xl">📈</span>
                    </div>
                    <h2 className="text-2xl font-bold text-warm-800">AI 趋势预测</h2>
                    <p className="text-warm-600 mt-2">基于 RandomForest + LinearRegression 集成模型的7天心理健康走势预测</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-warm-500">模型预测中...</p>
                    </div>
                ) : predictionData ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-indigo-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-indigo-600">{getTrendIcon(predictionData.trend_direction)}</div>
                                <div className="text-sm text-indigo-400 mt-1">趋势方向</div>
                            </div>
                            <div className="bg-warm-50 rounded-xl p-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(predictionData.risk_level)}`}>
                                    {predictionData.risk_level === 'low' ? '低风险' : predictionData.risk_level === 'moderate' ? '中风险' : '高风险'}
                                </span>
                                <div className="text-sm text-warm-400 mt-1">风险等级</div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{Math.round(predictionData.model_confidence * 100)}%</div>
                                <div className="text-sm text-blue-400 mt-1">模型置信度</div>
                            </div>
                        </div>

                        {/* Prediction Chart Placeholder */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 mb-6">
                            <h4 className="font-medium text-indigo-800 mb-4">未来7天 PHQ-9 预测走势</h4>
                            <div className="flex items-end space-x-2 h-32">
                                {predictionData.predicted_scores.map((score, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-indigo-400 rounded-t-lg transition-all"
                                            style={{ height: `${(score / 27) * 100}%` }}
                                        />
                                        <div className="text-xs text-indigo-600 mt-1">{score.toFixed(1)}</div>
                                        <div className="text-xs text-indigo-400">{predictionData.dates[idx].slice(5)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Interpretation */}
                        <div className="bg-indigo-50 rounded-xl p-4">
                            <p className="text-sm text-indigo-700">
                                🤖 <strong>AI解读:</strong> {predictionData.interpretation}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-warm-500">
                        无法获取预测数据，请确保后端服务正常运行
                    </div>
                )}
            </div>
        </div>
    );
};

// ====== INLINE BREATHING BALL VIEW ======
const BreathingBallView = () => {
    const [bpm, setBpm] = useState(6);
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('rest');
    const [isActive, setIsActive] = useState(false);

    const phaseLabels = {
        inhale: { text: '吸气', color: 'text-blue-500', bg: 'bg-blue-100' },
        hold: { text: '屏息', color: 'text-purple-500', bg: 'bg-purple-100' },
        exhale: { text: '呼气', color: 'text-green-500', bg: 'bg-green-100' },
        rest: { text: '准备', color: 'text-warm-400', bg: 'bg-warm-100' },
    };

    useEffect(() => {
        if (!isActive) return;

        const cycleDuration = (60 / bpm) * 1000;
        const phases = { inhale: 0.4, hold: 0.1, exhale: 0.4, rest: 0.1 };

        const interval = setInterval(() => {
            const now = Date.now() % cycleDuration;
            const progress = now / cycleDuration;

            if (progress < phases.inhale) setPhase('inhale');
            else if (progress < phases.inhale + phases.hold) setPhase('hold');
            else if (progress < phases.inhale + phases.hold + phases.exhale) setPhase('exhale');
            else setPhase('rest');
        }, 100);

        return () => clearInterval(interval);
    }, [isActive, bpm]);

    const getScale = () => {
        if (!isActive) return 1;
        const cycleDuration = (60 / bpm) * 1000;
        const now = Date.now() % cycleDuration;
        const progress = now / cycleDuration;

        if (progress < 0.4) return 1 + 0.3 * (progress / 0.4);
        if (progress < 0.5) return 1.3;
        if (progress < 0.9) return 1.3 - 0.3 * ((progress - 0.5) / 0.4);
        return 1;
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-warm-800 mb-2">3D 呼吸球</h2>
                <p className="text-warm-600 mb-8">跟随呼吸球的节奏进行深呼吸，激活副交感神经系统</p>

                {/* Breathing Ball */}
                <div className="relative h-64 flex items-center justify-center mb-8">
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-3xl transition-transform duration-300"
                        style={{ transform: `scale(${getScale()})` }}
                    />
                    <div
                        className="w-48 h-48 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-300 relative"
                        style={{ transform: `scale(${getScale()})` }}
                    >
                        <div className="absolute inset-2 bg-gradient-to-br from-violet-400/50 to-transparent rounded-full" />
                        <span className={`text-3xl font-bold ${phaseLabels[phase].color} z-10`}>
                            {isActive ? phaseLabels[phase].text : '开始'}
                        </span>
                    </div>
                </div>

                {/* Phase Indicator */}
                <div className={`inline-block px-6 py-2 rounded-full text-lg font-medium ${phaseLabels[phase].bg} ${phaseLabels[phase].color} mb-6 transition-all`}>
                    {isActive ? phaseLabels[phase].text : '点击开始呼吸练习'}
                </div>

                {/* BPM Control */}
                <div className="mb-6">
                    <label className="text-sm text-warm-500 block mb-2">呼吸频率: {bpm} BPM</label>
                    <input
                        type="range"
                        min="4"
                        max="10"
                        value={bpm}
                        onChange={(e) => setBpm(parseInt(e.target.value))}
                        className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-warm-400 mt-1">
                        <span>慢 (放松)</span>
                        <span>快 (活力)</span>
                    </div>
                </div>

                {/* Control Button */}
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isActive
                        ? 'bg-warm-200 text-warm-600 hover:bg-warm-300'
                        : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700'
                        }`}
                >
                    {isActive ? '⏸️ 暂停' : '▶️ 开始呼吸'}
                </button>

                <p className="text-xs text-warm-400 mt-4">
                    💡 建议每次练习2-5分钟，每天1-3次效果最佳
                </p>
            </div>
        </div>
    );
};


function App() {
    const { error, setError } = useAppStore();
    const avatarRef = useRef<VirtualAvatarRef>(null);
    const embodiedAvatarRef = useRef<EmbodiedAvatarRef>(null);

    // State for views
    const [currentView, setCurrentView] = useState<'home' | 'clock' | 'chat' | 'demo' | 'scale' | 'biosignal' | 'stroop' | 'keystroke' | 'trend' | 'breathing' | 'journal' | 'community'>('home');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

    // Auth state
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

    // Mood Journal modal state
    const [showMoodJournal, setShowMoodJournal] = useState(false);

    // Achievement Center modal state
    const [showAchievementCenter, setShowAchievementCenter] = useState(false);

    // EMA Check-in modal state
    const [showEMACheckIn, setShowEMACheckIn] = useState(false);

    // Gamification state
    const { streak, todayPoints, checkStreak } = useGamificationStore();

    // Check streak on mount
    useEffect(() => {
        checkStreak();
    }, [checkStreak]);


    // Dark mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    // Apply dark mode class to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(isDarkMode));
    }, [isDarkMode]);

    // Check for existing login on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }, []);

    // Handle WeChat OAuth callback URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        // Check for WeChat login token
        const wechatToken = urlParams.get('wechat_token');
        const wechatUser = urlParams.get('wechat_user');

        if (wechatToken && wechatUser) {
            try {
                const user = JSON.parse(decodeURIComponent(wechatUser));
                localStorage.setItem('token', wechatToken);
                localStorage.setItem('user', JSON.stringify(user));
                setCurrentUser(user);

                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);

                console.log('WeChat login successful:', user);
            } catch (e) {
                console.error('Failed to parse WeChat user data:', e);
            }
        }

        // Check for WeChat binding needed
        const wechatBind = urlParams.get('wechat_bind');
        if (wechatBind) {
            try {
                const bindInfo = JSON.parse(decodeURIComponent(wechatBind));
                // Store binding info and show auth modal
                sessionStorage.setItem('wechat_bind_info', JSON.stringify(bindInfo));
                setShowAuthModal(true);

                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                console.error('Failed to parse WeChat bind data:', e);
            }
        }

        // Check for WeChat error
        const wechatError = urlParams.get('wechat_error');
        if (wechatError) {
            alert(`微信登录失败: ${wechatError}`);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Chat state
    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isChatting, setIsChatting] = useState(false);

    // Bio-signal monitoring
    const [showMonitors, setShowMonitors] = useState(false);
    const [userId] = useState(() => `user_${Date.now()}`);

    // JITAI real-time guardian
    const jitai = useJITAI(userId, true, 300000); // Check every 5 minutes

    // Immersive Mode
    const [isPlayingImmersive, setIsPlayingImmersive] = useState(false);

    // Hooks for bio-signals
    const oculometricSensor = useOculometricSensor({
        uiUpdateInterval: 100,
    });

    const voiceAnalyzer = useVoiceAnalyzer({});

    const bioAggregator = useBioSignalAggregator({
        aggregationInterval: 5000,
        autoReport: false,
    });

    // Digital Phenotyping (Wearable + Bio)
    const health = useHealthConnect();
    const phenotyping = useDigitalPhenotyping();

    // Init health connect
    useEffect(() => {
        health.connect();
    }, [health.connect]);

    // Compute phenotyping features when data updates
    useEffect(() => {
        if (health.data) {
            phenotyping.computeFeatures(
                health.data,
                bioAggregator.getLatestSignals(),
                // Mock EMA data for now (would come from journal history)
                { moodAvg: 7, stressCount: 1, activityLevel: 'moderate' }
            );
        }
    }, [health.data, bioAggregator.latestAggregation]);


    // Aggregate bio-signals when monitors are active
    useEffect(() => {
        if (showMonitors && oculometricSensor.metrics) {
            bioAggregator.addSample({
                blinkRate: oculometricSensor.metrics.blinkRate,
                fatigue: oculometricSensor.metrics.drowsinessIndex,
            });
        }
    }, [showMonitors, oculometricSensor.metrics, bioAggregator]);

    useEffect(() => {
        if (showMonitors && voiceAnalyzer.metrics) {
            bioAggregator.addSample({
                jitter: voiceAnalyzer.metrics.jitterPercent || 0,
                shimmer: voiceAnalyzer.metrics.shimmerPercent || 0,
            });
        }
    }, [showMonitors, voiceAnalyzer.metrics, bioAggregator]);

    /**
     * Make avatar speak with emotion
     */
    const handleAvatarSpeak = async (text: string, emotion: 'happy' | 'sad' | 'neutral' = 'neutral') => {
        if (avatarRef.current) {
            try {
                await avatarRef.current.speak(text, emotion);
            } catch (err) {
                console.error('Speech failed:', err);
            }
        }
    };

    /**
     * Crisis keyword detection
     */
    const CRISIS_KEYWORDS = [
        '自杀', '不想活', '死了算了', '跳楼', '割腕', '吃药自杀',
        '活着没意思', '想死', '结束生命', '没有希望', '自残', '伤害自己',
        '生不如死', '解脱', '一了百了', '遗书', '告别'
    ];

    const [showCrisisAlert, setShowCrisisAlert] = useState(false);

    const detectCrisis = useCallback((text: string): boolean => {
        return CRISIS_KEYWORDS.some(keyword => text.includes(keyword));
    }, []);

    /**
     * Send chat message with bio-signals
     */
    const handleSendMessage = useCallback(async () => {
        if (!inputMessage.trim() || isChatting) return;

        const userMessage = inputMessage.trim();

        // 危机检测
        const isCrisis = detectCrisis(userMessage);
        if (isCrisis) {
            setShowCrisisAlert(true);
        }

        setInputMessage('');
        setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsChatting(true);

        try {
            // Get aggregated bio-signals
            const bioSignals = bioAggregator.consumeAggregation();

            // Build conversation history for context (last 10 messages)
            const conversationHistory = chatMessages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.text
            }));

            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    message: userMessage,
                    conversation_history: conversationHistory,
                    bio_signals: {
                        avg_blink_rate: bioSignals.avg_blink_rate,
                        voice_jitter: bioSignals.voice_jitter,
                        fatigue_index: bioSignals.fatigue_index,
                    },
                }),
            });

            if (!response.ok) throw new Error('Chat request failed');

            const result = await response.json();

            // Add assistant message
            setChatMessages(prev => [...prev, { role: 'assistant', text: result.reply_text }]);

            // Update avatar based on command
            if (result.avatar_command) {
                if (result.avatar_command.enable_entrainment && embodiedAvatarRef.current) {
                    embodiedAvatarRef.current.startEntrainment();
                }
                if (result.avatar_command.emotion && embodiedAvatarRef.current) {
                    embodiedAvatarRef.current.setEmotion(result.avatar_command.emotion);
                }
            }

            // Speak the response
            await handleAvatarSpeak(result.reply_text, result.risk_flag ? 'sad' : 'neutral');

        } catch (err) {
            console.error('Chat failed:', err);
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                text: '抱歉，我现在无法连接到服务器。请稍后再试。'
            }]);
        } finally {
            setIsChatting(false);
        }
    }, [inputMessage, isChatting, userId, bioAggregator]);

    /**
     * Submit clock drawing for scoring
     */
    const handleSubmitDrawing = useCallback(async (imageBase64: string) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/assessments/cdt/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: imageBase64 }),
            });

            if (!response.ok) throw new Error('评分请求失败');

            const result = await response.json();
            setAssessmentResult(result);
            setShowResult(true);

            await handleAvatarSpeak(
                `评估完成了。您的得分是${result.total_score}分。` +
                result.feedback.slice(0, 2).join('，'),
                result.total_score >= 2 ? 'happy' : 'neutral'
            );

        } catch (err) {
            console.error('Scoring failed:', err);
            setError('评分失败，请检查网络连接后重试');
        } finally {
            setIsSubmitting(false);
        }
    }, [setError]);

    /**
     * Start clock drawing test
     */
    const startClockTest = () => {
        setCurrentView('clock');
        handleAvatarSpeak(
            '现在开始画钟测验。请画一个时钟，把指针设置为十一点十分的位置。',
            'neutral'
        );
    };

    /**
     * Start counseling chat
     */
    const startCounselingChat = () => {
        setCurrentView('chat');
        setChatMessages([{
            role: 'assistant',
            text: '你好！我是小心，你的心理健康助手。今天感觉怎么样？有什么想和我聊聊的吗？'
        }]);
        bioAggregator.startCollecting();
    };

    /**
     * Start demo mode (all features)
     */
    const startDemoMode = () => {
        setCurrentView('demo');
        setShowMonitors(true);
        bioAggregator.startCollecting();
    };

    /**
     * Start scale assessment (PHQ-9, etc.)
     */
    const startScaleAssessment = () => {
        setCurrentView('scale');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-warm-50 via-rose-50/30 to-primary-50/50">
            {/* Immersive Overlay */}
            {isPlayingImmersive && (
                <div className="fixed inset-0 z-[100]">
                    <BiofeedbackScene
                        hrv={health.data?.hrv || 50}
                        onExit={() => setIsPlayingImmersive(false)}
                    />
                </div>
            )}
            {/* Virtual Avatar - Fixed at bottom-right */}
            <VirtualAvatar
                ref={avatarRef}
                modelPath="/models/kei/kei_basic_free.model3.json"
                scale={0.12}
                enableEyeTracking={true}
                enableLipSync={true}
                onModelLoaded={() => console.log('✅ Live2D model loaded')}
                onModelError={(err) => console.error('❌ Failed to load model:', err)}
            />

            {/* Result Modal */}
            <ResultModal
                isOpen={showResult}
                onClose={() => { setShowResult(false); setAssessmentResult(null); }}
                result={assessmentResult}
                title="画钟测验结果"
            />

            {/* Header */}
            <header className="bg-white/70 backdrop-blur-md border-b border-warm-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-warm-800">NeuraSense</h1>
                                <p className="text-xs text-warm-500">智能心理测评平台</p>
                            </div>
                        </div>
                        <nav className="flex items-center space-x-4">
                            <button
                                className={`text-warm-600 hover:text-warm-900 transition-colors ${currentView === 'home' ? 'font-semibold' : ''}`}
                                onClick={() => setCurrentView('home')}
                            >
                                首页
                            </button>
                            <button
                                className={`text-warm-600 hover:text-warm-900 transition-colors ${currentView === 'chat' ? 'font-semibold' : ''}`}
                                onClick={startCounselingChat}
                            >
                                心理咨询
                            </button>


                            {/* 深色模式切换 */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 rounded-lg bg-warm-100 dark:bg-gray-700 hover:bg-warm-200 dark:hover:bg-gray-600 transition-all"
                                title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
                            >
                                {isDarkMode ? (
                                    <span className="text-xl">☀️</span>
                                ) : (
                                    <span className="text-xl">🌙</span>
                                )}
                            </button>

                            {/* 用户登录/头像 */}
                            {currentUser ? (
                                <div className="flex items-center space-x-2">
                                    <UserAvatar user={currentUser} />
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            setCurrentUser(null);
                                        }}
                                        className="text-sm text-warm-500 hover:text-warm-700"
                                    >
                                        退出
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="flex items-center space-x-1 px-4 py-2 bg-white border border-warm-200 rounded-lg hover:bg-warm-50 transition-all"
                                >
                                    <span>👤</span>
                                    <span className="text-sm font-medium text-warm-700">登录</span>
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    onLoginSuccess={(user) => {
                        setCurrentUser(user);
                        setShowAuthModal(false);
                    }}
                    onClose={() => setShowAuthModal(false)}
                />
            )}

            {/* Crisis Alert Modal */}
            {showCrisisAlert && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-pulse-slow">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                                <span className="text-4xl">❤️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-warm-800">我们非常关心你</h3>
                            <p className="text-warm-600 mt-2">
                                我注意到你可能正在经历一些困难的时刻。请记住，你并不孤单，有人愿意倾听和帮助你。
                            </p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <a href="tel:400-161-9995" className="flex items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-all border-2 border-red-200">
                                <span className="text-2xl mr-3">📞</span>
                                <div>
                                    <div className="font-bold text-red-700">24小时心理援助热线</div>
                                    <div className="text-red-600 text-lg">400-161-9995</div>
                                </div>
                            </a>
                            <a href="tel:010-82951332" className="flex items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all">
                                <span className="text-2xl mr-3">🏥</span>
                                <div>
                                    <div className="font-bold text-orange-700">北京心理危机干预中心</div>
                                    <div className="text-orange-600">010-82951332</div>
                                </div>
                            </a>
                            <a href="tel:12320-5" className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
                                <span className="text-2xl mr-3">💙</span>
                                <div>
                                    <div className="font-bold text-blue-700">全国心理援助热线</div>
                                    <div className="text-blue-600">12320-5</div>
                                </div>
                            </a>
                        </div>

                        <p className="text-sm text-warm-500 text-center mb-4">
                            如果你或身边的人正处于危险中，请立即拨打上方热线或前往最近的医院急诊。
                        </p>

                        <button
                            onClick={() => setShowCrisisAlert(false)}
                            className="w-full py-3 bg-warm-100 text-warm-700 rounded-xl font-medium hover:bg-warm-200 transition-all"
                        >
                            我知道了，继续对话
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center space-x-3">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                {/* Mood Journal Modal */}
                {showMoodJournal && (
                    <MoodJournal
                        onComplete={() => setShowMoodJournal(false)}
                        onClose={() => setShowMoodJournal(false)}
                    />
                )}

                {/* Achievement Center Modal */}
                {showAchievementCenter && (
                    <AchievementCenter
                        onClose={() => setShowAchievementCenter(false)}
                    />
                )}

                {/* Crisis Support Panel - Always present */}
                <CrisisPanel />

                {/* JITAI Intervention Modal */}
                {jitai.showIntervention && jitai.intervention && (
                    <InterventionModal
                        intervention={jitai.intervention}
                        onComplete={(postMood) => jitai.completeIntervention(postMood)}
                        onDismiss={() => jitai.dismissIntervention(false)}
                    />
                )}

                {/* EMA Check-in Modal */}
                {showEMACheckIn && (
                    <EMACheckIn
                        onComplete={() => setShowEMACheckIn(false)}
                        onClose={() => setShowEMACheckIn(false)}
                    />
                )}

                {/* ===== HOME VIEW ===== */}
                {currentView === 'home' && (
                    <>
                        {/* User Guide Tour */}
                        <UserGuide />

                        {/* Dashboard Header Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" data-tour="welcome">
                            <div className="lg:col-span-2">
                                <WelcomeGreeting
                                    userName={currentUser?.nickname || currentUser?.username || '朋友'}
                                    streak={streak}
                                    todayPoints={todayPoints}
                                    onStartJournal={() => setShowMoodJournal(true)}
                                    onStartBreathing={startDemoMode}
                                    onStartAssessment={startScaleAssessment}
                                />
                            </div>
                            <div>
                                <GuardianCard
                                    vulnerabilityScore={jitai.vulnerabilityScore}
                                    riskLevel={jitai.riskLevel}
                                    contributingFactors={jitai.contributingFactors}
                                    lastCheck={jitai.lastCheck}
                                    isLoading={jitai.isLoading}
                                    onCheckNow={() => jitai.checkVulnerability()}
                                />
                            </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex justify-center space-x-4 mb-10" data-tour="actions">
                            <button
                                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold text-lg hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
                                onClick={startCounselingChat}
                            >
                                💬 开始咨询
                            </button>
                            <button
                                className="px-6 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold text-lg hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
                                onClick={() => setShowMoodJournal(true)}
                            >
                                📝 今日打卡
                            </button>
                            {/* <button
                                className="px-6 py-4 bg-white text-warm-700 rounded-xl font-semibold text-lg border-2 border-warm-200 hover:border-primary-300 transition-all hover:-translate-y-1 transform"
                                onClick={startClockTest}
                            >
                                🕰️ 画钟测验
                            </button> */}
                        </div>

                        {/* Digital Phenotyping Insights */}
                        <div className="mb-12" data-tour="phenotyping">
                            <h3 className="text-xl font-bold text-warm-800 mb-4 flex items-center">
                                <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3 text-2xl">🧬</span>
                                AI 生理洞察
                            </h3>
                            <PhysiologicalInsights
                                data={phenotyping.getRadarData()}
                                isLoading={phenotyping.isProcessing}
                                onConnect={() => health.connect({ enableBluetooth: true, useSimulatedData: false })}
                            />
                        </div>

                        {/* Feature Sections */}

                        {/* 1. Immersive & Intervention */}
                        <div className="mb-12" data-tour="immersive">
                            <h3 className="text-xl font-bold text-warm-800 mb-4 flex items-center">
                                <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3 text-2xl">🧘</span>
                                沉浸式干预
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <ImmersiveCard
                                    onEnter={() => setIsPlayingImmersive(true)}
                                    recommended={phenotyping.result?.features.physiologicalStressIndex! > 0.6}
                                />

                                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-warm-200/50 hover:shadow-xl transition-all cursor-pointer group" onClick={() => setCurrentView('breathing')}>
                                    <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-3xl">🔮</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-warm-800 mb-2">3D 呼吸球</h4>
                                    <p className="text-warm-600 text-sm">WebGL 粒子球引导同步呼吸，激活副交感神经，快速缓解焦虑</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Assessment & Analysis */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-warm-800 mb-4 flex items-center">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 text-2xl">📊</span>
                                心理评估与分析
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-warm-200/50 hover:shadow-xl transition-all cursor-pointer group" onClick={startScaleAssessment}>
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-3xl">📋</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-warm-800 mb-2">心理量表评估</h4>
                                    <p className="text-warm-600 text-sm">PHQ-9 (抑郁)、GAD-7 (焦虑) 等专业量表，获取 AI 智能解读报告</p>
                                </div>

                                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-indigo-200/50 hover:shadow-xl transition-all cursor-pointer group" onClick={() => setCurrentView('biosignal')}>
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-3xl">👁️</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-warm-800 mb-2">AI 生物信号分析</h4>
                                    <p className="text-warm-600 text-sm">利用摄像头和麦克风进行眼动追踪、语音情感分析，识别潜在风险</p>
                                </div>

                                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-purple-200/50 hover:shadow-xl transition-all cursor-pointer group" onClick={() => setCurrentView('stroop')}>
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-3xl">🎮</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-warm-800 mb-2">Stroop 认知测试</h4>
                                    <p className="text-warm-600 text-sm">通过色词冲突游戏，评估注意力集中度和认知控制能力</p>
                                </div>

                                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-green-200/50 hover:shadow-xl transition-all cursor-pointer group" onClick={startClockTest}>
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-teal-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-3xl">🕰️</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-warm-800 mb-2">画钟测验 (CDT)</h4>
                                    <p className="text-warm-600 text-sm">经典的认知功能筛查工具，AI 分析绘图轨迹评估空间感知能力</p>
                                </div>

                                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-amber-200/50 hover:shadow-xl transition-all cursor-pointer group" onClick={() => setCurrentView('keystroke')}>
                                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-3xl">⌨️</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-warm-800 mb-2">键盘动力学</h4>
                                    <p className="text-warm-600 text-sm">分析打字节奏和按键压力，非侵入式地监测焦虑和疲劳状态</p>
                                </div>

                                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-cyan-200/50 hover:shadow-xl transition-all cursor-pointer group" onClick={() => setCurrentView('trend')}>
                                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-3xl">📈</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-warm-800 mb-2">AI 趋势预测</h4>
                                    <p className="text-warm-600 text-sm">基于历史数据预测未来 7 天心理健康走势，提供前瞻性干预建议</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Action Row - EMA & Achievements */}
                        <div className="flex justify-center space-x-6 mt-8 mb-12">
                            <button
                                onClick={() => setShowEMACheckIn(true)}
                                className="flex items-center space-x-2 px-6 py-3 bg-white border border-warm-200 text-warm-700 rounded-xl font-medium hover:border-cyan-400 hover:text-cyan-600 hover:shadow-md transition-all"
                            >
                                <span>🎯</span>
                                <span>心情快检 (EMA)</span>
                            </button>
                            <button
                                onClick={() => setShowAchievementCenter(true)}
                                className="flex items-center space-x-2 px-6 py-3 bg-white border border-warm-200 text-warm-700 rounded-xl font-medium hover:border-amber-400 hover:text-amber-600 hover:shadow-md transition-all"
                            >
                                <span>🏆</span>
                                <span>我的成就</span>
                            </button>
                        </div>

                        {/* Community Feed Preview */}
                        <div className="mt-8" data-tour="community">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-warm-800 flex items-center space-x-2">
                                    <span className="bg-pink-100 text-pink-600 p-2 rounded-lg mr-2 text-xl">💜</span>
                                    <span>温暖社区</span>
                                </h3>
                                <button
                                    onClick={() => setCurrentView('community')}
                                    className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors"
                                >
                                    进入社区 →
                                </button>
                            </div>
                            <CommunityFeed maxPosts={5} />
                        </div>
                    </>
                )}

                {/* ===== COMMUNITY VIEW ===== */}
                {currentView === 'community' && (
                    <section className="animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setCurrentView('home')} className="text-warm-500 hover:text-warm-700">
                                ← 返回首页
                            </button>
                        </div>
                        <CommunityFeed maxPosts={50} fullPage={true} />
                    </section>
                )}

                {/* ===== CLOCK TEST VIEW ===== */}
                {currentView === 'clock' && (
                    <section className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-warm-800 mb-2">画钟测验</h2>
                            <p className="text-warm-600">
                                请绘制一个时钟，并将指针设置为 <span className="font-semibold text-primary-600">11:10</span>
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <DrawingCanvas
                                width={400}
                                height={400}
                                onSubmit={handleSubmitDrawing}
                                isLoading={isSubmitting}
                            />
                        </div>
                        <div className="text-center mt-6">
                            <button onClick={() => setCurrentView('home')} className="text-warm-500 hover:text-warm-700">
                                ← 返回首页
                            </button>
                        </div>
                    </section>
                )}

                {/* ===== CHAT VIEW ===== */}
                {currentView === 'chat' && (
                    <PsyChat
                        onSendMessage={async (message) => {
                            // Build conversation history
                            const bioSignals = bioAggregator.consumeAggregation();

                            const response = await fetch(`${API_BASE}/chat`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    user_id: userId,
                                    message,
                                    conversation_history: chatMessages.slice(-10).map(msg => ({
                                        role: msg.role,
                                        content: msg.text
                                    })),
                                    bio_signals: {
                                        avg_blink_rate: bioSignals.avg_blink_rate,
                                        voice_jitter: bioSignals.voice_jitter,
                                        fatigue_index: bioSignals.fatigue_index,
                                    },
                                }),
                            });

                            if (!response.ok) throw new Error('Chat request failed');

                            const result = await response.json();

                            // Update internal messages for history
                            setChatMessages(prev => [...prev, { role: 'user', text: message }]);
                            setChatMessages(prev => [...prev, { role: 'assistant', text: result.reply_text }]);

                            return result;
                        }}
                        onSpeak={(text, emotion) => {
                            // Non-blocking TTS - just fire and forget
                            handleAvatarSpeak(text, emotion as any);
                        }}
                        onStopSpeaking={() => {
                            // Stop current speech synthesis
                            window.speechSynthesis?.cancel();
                        }}
                        isSpeaking={window.speechSynthesis?.speaking}
                        onBack={() => setCurrentView('home')}
                    />
                )}


                {/* ===== SCALE ASSESSMENT VIEW ===== */}
                {currentView === 'scale' && (
                    <section className="animate-fadeIn">
                        <ScaleSelector
                            onClose={() => setCurrentView('home')}
                        />
                    </section>
                )}

                {/* ===== DEMO VIEW (All Features) ===== */}
                {currentView === 'demo' && (
                    <section className="animate-fadeIn">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-warm-800">完整功能演示</h2>
                            <p className="text-warm-500 text-sm">眼动追踪 + 语音分析 + 呼吸夹带 + 智能对话</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Bio-Signal Monitors */}
                            <div className="space-y-4">
                                <OculometricMonitor
                                    showVideo={true}
                                    onMetricsUpdate={(metrics) => console.log('Fatigue:', metrics.fatigueLevel)}
                                />
                                <VoiceAnalyzerMonitor
                                    onMetricsUpdate={(metrics) => console.log('Voice:', metrics)}
                                />
                            </div>

                            {/* Chat + Avatar */}
                            <div className="space-y-4">
                                {/* EmbodiedAvatar with Breathing */}
                                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-warm-200/50">
                                    <h3 className="text-lg font-semibold text-warm-800 mb-3">🧘 呼吸夹带</h3>
                                    <EmbodiedAvatar
                                        ref={embodiedAvatarRef}
                                        width={300}
                                        height={300}
                                        userFatigue={oculometricSensor.metrics?.drowsinessIndex || 0}
                                        voiceJitter={voiceAnalyzer.metrics?.jitterPercent || 0}
                                        enableEntrainment={true}
                                        className="mx-auto"
                                    />
                                    <div className="flex justify-center mt-3 space-x-2">
                                        <button
                                            onClick={() => embodiedAvatarRef.current?.startEntrainment()}
                                            className="px-4 py-2 bg-calm-500 text-white rounded-lg text-sm"
                                        >
                                            开始呼吸引导
                                        </button>
                                        <button
                                            onClick={() => embodiedAvatarRef.current?.stopEntrainment()}
                                            className="px-4 py-2 bg-warm-200 text-warm-700 rounded-lg text-sm"
                                        >
                                            停止
                                        </button>
                                    </div>
                                </div>

                                {/* Mini Chat */}
                                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-warm-200/50">
                                    <h3 className="text-lg font-semibold text-warm-800 mb-3">💬 智能对话</h3>
                                    <div className="h-40 overflow-y-auto mb-3 space-y-2">
                                        {chatMessages.slice(-5).map((msg, idx) => (
                                            <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                <span className={`inline-block px-3 py-1 rounded-lg ${msg.role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-warm-100 text-warm-700'
                                                    }`}>
                                                    {msg.text.slice(0, 100)}...
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="输入消息..."
                                            className="flex-1 px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={isChatting}
                                            className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm"
                                        >
                                            发送
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-6">
                            <button
                                onClick={() => { setCurrentView('home'); setShowMonitors(false); }}
                                className="text-warm-500 hover:text-warm-700"
                            >
                                ← 返回首页
                            </button>
                        </div>
                    </section>
                )}

                {/* ===== BIO-SIGNAL AI PANEL VIEW ===== */}
                {currentView === 'biosignal' && (
                    <section className="animate-fadeIn">
                        <div className="mb-4">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="text-warm-500 hover:text-warm-700 flex items-center space-x-1"
                            >
                                <span>←</span>
                                <span>返回首页</span>
                            </button>
                        </div>
                        <BioSignalAIPanel onClose={() => setCurrentView('home')} />
                    </section>
                )}

                {/* ===== STROOP TEST VIEW ===== */}
                {currentView === 'stroop' && (
                    <section className="animate-fadeIn">
                        <div className="mb-4">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="text-warm-500 hover:text-warm-700 flex items-center space-x-1"
                            >
                                <span>←</span>
                                <span>返回首页</span>
                            </button>
                        </div>
                        <StroopTestView onComplete={() => setCurrentView('home')} />
                    </section>
                )}

                {/* ===== KEYSTROKE ANALYSIS VIEW ===== */}
                {currentView === 'keystroke' && (
                    <section className="animate-fadeIn">
                        <div className="mb-4">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="text-warm-500 hover:text-warm-700 flex items-center space-x-1"
                            >
                                <span>←</span>
                                <span>返回首页</span>
                            </button>
                        </div>
                        <KeystrokeAnalysisView />
                    </section>
                )}

                {/* ===== TREND PREDICTION VIEW ===== */}
                {currentView === 'trend' && (
                    <section className="animate-fadeIn">
                        <div className="mb-4">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="text-warm-500 hover:text-warm-700 flex items-center space-x-1"
                            >
                                <span>←</span>
                                <span>返回首页</span>
                            </button>
                        </div>
                        <TrendPredictionView />
                    </section>
                )}

                {/* ===== 3D BREATHING BALL VIEW ===== */}
                {currentView === 'breathing' && (
                    <section className="animate-fadeIn">
                        <div className="mb-4">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="text-warm-500 hover:text-warm-700 flex items-center space-x-1"
                            >
                                <span>←</span>
                                <span>返回首页</span>
                            </button>
                        </div>
                        <BreathingBallView />
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-warm-800 text-warm-300 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm">© 2024 NeuraSense AI心理健康平台</p>
                    <p className="text-xs text-warm-500 mt-1">本平台仅供参考，不能替代专业医疗诊断</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
