/**
 * GAD-7 Anxiety Scale Assessment Component
 * 
 * Generalized Anxiety Disorder 7-item scale for anxiety screening.
 * Includes all 7 questions with scoring and AI interpretation.
 */

import { useState, useCallback } from 'react';
import { API_BASE } from '../../config/api';
import { PDFDownloadButton } from './PDFDownloadButton';

// GAD-7 问题定义
const GAD7_QUESTIONS = [
    "感到紧张、焦虑或急切",
    "不能停止或控制担忧",
    "对各种事情担忧过多",
    "很难放松下来",
    "由于不安而无法静坐",
    "变得容易烦恼或急躁",
    "感到似乎将有可怕的事情发生"
];

// 选项定义（与PHQ-9相同）
const OPTIONS = [
    { value: 0, label: "完全不会", description: "过去2周内完全没有" },
    { value: 1, label: "好几天", description: "少于一半的天数" },
    { value: 2, label: "一半以上的天数", description: "超过一半的天数" },
    { value: 3, label: "几乎每天", description: "每天或几乎每天" },
];

// 严重程度解读
const getSeverity = (score: number) => {
    if (score <= 4) return { level: '正常', color: 'green', description: '您目前的焦虑水平在正常范围内' };
    if (score <= 9) return { level: '轻度焦虑', color: 'yellow', description: '可能存在轻微的焦虑倾向' };
    if (score <= 14) return { level: '中度焦虑', color: 'orange', description: '建议寻求专业心理咨询' };
    return { level: '重度焦虑', color: 'red', description: '强烈建议尽快寻求专业帮助' };
};

interface GAD7ScaleProps {
    onComplete?: (result: GAD7Result) => void;
    onClose?: () => void;
}

export interface GAD7Result {
    totalScore: number;
    answers: number[];
    severity: string;
    timestamp: Date;
    aiInterpretation?: string;
}

export const GAD7Scale = ({ onComplete, onClose }: GAD7ScaleProps) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(7).fill(null));
    const [isComplete, setIsComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);

    // 计算总分
    const totalScore = answers.reduce<number>((sum, val) => sum + (val ?? 0), 0);
    const severity = getSeverity(totalScore);

    // 选择答案
    const handleAnswer = useCallback((value: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = value;
        setAnswers(newAnswers);

        if (currentQuestion < 6) {
            setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
        }
    }, [currentQuestion, answers]);

    // 完成评估并获取 AI 解读
    const handleComplete = useCallback(async () => {
        if (answers.some(a => a === null)) return;

        setIsLoading(true);

        try {
            // 调用后端 API 获取 AI 解读
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 'scale_user',
                    message: `我完成了 GAD-7 焦虑量表测评，得分是 ${totalScore} 分（${severity.level}）。我最高分的维度包括：${GAD7_QUESTIONS.filter((_, i) => (answers[i] ?? 0) >= 2).join('、') || '无明显突出项'
                        }。请根据这个结果给我一些针对焦虑的温暖建议和放松技巧。`,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiInterpretation(data.reply_text || data.message);
            }
        } catch (error) {
            console.error('Failed to get AI interpretation:', error);
            setAiInterpretation(getDefaultInterpretation(totalScore));
        }

        setIsLoading(false);
        setIsComplete(true);

        onComplete?.({
            totalScore,
            answers: answers as number[],
            severity: severity.level,
            timestamp: new Date(),
            aiInterpretation: aiInterpretation || undefined,
        });
    }, [answers, totalScore, severity, onComplete, aiInterpretation]);

    // 默认解读 - 提供具体可操作的焦虑管理建议
    const getDefaultInterpretation = (score: number): string => {
        if (score <= 4) {
            return `✅ 您的焦虑水平在正常范围内，继续保持！

📋 保持建议：
• 规律作息：每天7-8小时睡眠
• 适度运动：有氧运动能有效缓解焦虑
• 正念冥想：每天5-10分钟（推荐App：潮汐、Calm）
• 减少咖啡因摄入：每天不超过2杯咖啡`;
        }
        if (score <= 9) {
            return `⚠️ 您可能正经历轻度焦虑。

📋 自我调节建议：
• 478呼吸法：吸气4秒→屏息7秒→呼气8秒，重复3-5次
• 渐进式肌肉放松：从脚趾到头部，依次紧张-放松各肌群
• 规律运动：每天30分钟有氧运动（快走、游泳、骑车）
• 限制咖啡因和酒精：会加重焦虑症状
• 写焦虑日记：把担心的事情写下来，分析实际发生概率

💡 如果2周后没有改善，建议咨询专业人士。`;
        }
        if (score <= 14) {
            return `🔔 您的焦虑水平较高（中度焦虑）。

📋 强烈建议：
1. 寻求专业帮助
   • 认知行为疗法（CBT）对焦虑症效果显著
   • 可去医院心理科或心理咨询机构评估

2. 自我调节技巧
   • 478呼吸法：焦虑发作时立即使用
   • 5-4-3-2-1接地法：看5样东西、摸4样、听3种声音、闻2种气味、尝1种味道
   • 减少刺激物：咖啡、酒精、尼古丁
   • 规律运动：每天30分钟

📞 心理援助热线：400-161-9995`;
        }
        return `🆘 您可能正在经历严重焦虑，请尽快寻求帮助。

📋 请立即采取行动：
1. 尽快就医
   • 去医院精神心理科或心理门诊
   • 认知行为疗法（CBT）和药物治疗（如SSRI类）效果显著
   • 焦虑是可以治疗的！

2. 焦虑发作时的应对
   📞 先拨打：400-161-9995（24小时心理援助）
   • 478呼吸：吸气4秒→屏息7秒→呼气8秒
   • 告诉自己："这只是焦虑，不会伤害我，它会过去的"
   • 找一个安全的地方坐下

3. 告诉信任的人
   • 让家人或朋友陪伴你

💜 请记住：焦虑可以治疗，你不是一个人在战斗。`;
    };

    const progress = ((currentQuestion + 1) / 7) * 100;

    return (
        <div className="max-w-2xl mx-auto">
            {/* 标题 */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-warm-800 mb-2">GAD-7 焦虑筛查量表</h2>
                <p className="text-warm-600">
                    过去 <span className="font-semibold text-blue-600">2 周</span> 内，您有多少时间受到以下问题的困扰？
                </p>
            </div>

            {!isComplete ? (
                <>
                    {/* 进度条 */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-warm-500 mb-2">
                            <span>问题 {currentQuestion + 1} / 7</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* 问题卡片 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-blue-100">
                        <p className="text-xl text-warm-800 font-medium mb-8 min-h-[60px]">
                            {GAD7_QUESTIONS[currentQuestion]}
                        </p>

                        {/* 选项 */}
                        <div className="space-y-3">
                            {OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleAnswer(option.value)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${answers[currentQuestion] === option.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-warm-200 hover:border-blue-300 hover:bg-warm-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-medium">{option.label}</span>
                                            <span className="text-warm-500 text-sm ml-2">({option.description})</span>
                                        </div>
                                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion] === option.value
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-warm-300'
                                            }`}>
                                            {answers[currentQuestion] === option.value && (
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 导航按钮 */}
                    <div className="flex justify-between">
                        <button
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            disabled={currentQuestion === 0}
                            className="px-6 py-3 text-warm-600 hover:text-warm-800 disabled:opacity-50"
                        >
                            ← 上一题
                        </button>

                        {currentQuestion === 6 ? (
                            <button
                                onClick={handleComplete}
                                disabled={answers.some(a => a === null) || isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                            >
                                {isLoading ? '分析中...' : '完成评估'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(Math.min(6, currentQuestion + 1))}
                                disabled={answers[currentQuestion] === null}
                                className="px-6 py-3 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            >
                                下一题 →
                            </button>
                        )}
                    </div>
                </>
            ) : (
                /* 结果页面 */
                <div className="space-y-6">
                    {/* 顶部得分卡片 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-warm-800">GAD-7 评估报告</h2>
                                <p className="text-warm-500 text-sm">{new Date().toLocaleDateString('zh-CN')}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-blue-600">{totalScore}</div>
                                <div className="text-sm text-warm-500">总分 / 21</div>
                            </div>
                        </div>

                        {/* 得分仪表盘 */}
                        <div className="mb-8">
                            <div className="flex justify-between text-xs text-warm-500 mb-2">
                                <span>正常 (0-4)</span>
                                <span>轻度 (5-9)</span>
                                <span>中度 (10-14)</span>
                                <span>重度 (15+)</span>
                            </div>
                            <div className="h-4 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 rounded-full relative">
                                <div
                                    className="absolute w-4 h-6 bg-white border-2 border-warm-800 rounded-full -top-1 shadow-lg transition-all"
                                    style={{ left: `${Math.min(totalScore / 21 * 100, 98)}%`, transform: 'translateX(-50%)' }}
                                />
                            </div>
                        </div>

                        {/* 严重程度标签 */}
                        <div className="flex items-center justify-center">
                            <span className={`px-6 py-2 rounded-full text-lg font-bold ${totalScore <= 4 ? 'bg-green-100 text-green-700' :
                                totalScore <= 9 ? 'bg-yellow-100 text-yellow-700' :
                                    totalScore <= 14 ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {severity.level}
                            </span>
                        </div>
                    </div>

                    {/* AI 智能解读卡片 */}
                    {aiInterpretation && (
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">小心的专业建议</h3>
                                    <p className="leading-relaxed opacity-95">{aiInterpretation}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 各维度得分图表 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                        <h3 className="font-bold text-warm-800 mb-4 flex items-center">
                            <span className="text-xl mr-2">📊</span>
                            各维度得分分析
                        </h3>

                        <div className="space-y-4">
                            {GAD7_QUESTIONS.map((q, i) => {
                                const score = answers[i] ?? 0;
                                const percentage = (score / 3) * 100;
                                const labels = ['紧张焦虑', '控制担忧', '过度担忧', '难以放松', '坐立不安', '易烦躁', '恐惧预感'];

                                return (
                                    <div key={i} className="group">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-warm-700">{labels[i]}</span>
                                            <span className={`text-sm font-bold ${score === 0 ? 'text-green-600' :
                                                score === 1 ? 'text-yellow-600' :
                                                    score === 2 ? 'text-orange-600' :
                                                        'text-red-600'
                                                }`}>
                                                {score}/3
                                            </span>
                                        </div>
                                        <div className="h-3 bg-blue-50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${score === 0 ? 'bg-green-400' :
                                                    score === 1 ? 'bg-yellow-400' :
                                                        score === 2 ? 'bg-orange-400' :
                                                            'bg-red-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-warm-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                            {q}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 放松技巧卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-cyan-50 rounded-xl p-5 border border-cyan-100">
                            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-3">
                                <span className="text-xl">🌬️</span>
                            </div>
                            <h4 className="font-semibold text-cyan-800 mb-1">深呼吸法</h4>
                            <p className="text-sm text-cyan-600">4秒吸气-7秒屏息-8秒呼气</p>
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                                <span className="text-xl">🧠</span>
                            </div>
                            <h4 className="font-semibold text-indigo-800 mb-1">正念冥想</h4>
                            <p className="text-sm text-indigo-600">每天10分钟专注当下</p>
                        </div>

                        <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                                <span className="text-xl">🌿</span>
                            </div>
                            <h4 className="font-semibold text-teal-800 mb-1">渐进放松</h4>
                            <p className="text-sm text-teal-600">从脚到头依次放松肌肉</p>
                        </div>
                    </div>

                    {/* PDF 下载按钮 */}
                    <PDFDownloadButton
                        scaleType="gad7"
                        totalScore={totalScore}
                        answers={answers as number[]}
                        aiInterpretation={aiInterpretation || undefined}
                        className="w-full mb-4"
                    />

                    {/* 操作按钮 */}
                    <div className="flex space-x-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-warm-100 text-warm-700 rounded-xl font-medium hover:bg-warm-200 transition-all"
                        >
                            ← 返回首页
                        </button>
                        <button
                            onClick={() => {
                                setCurrentQuestion(0);
                                setAnswers(new Array(7).fill(null));
                                setIsComplete(false);
                                setAiInterpretation(null);
                            }}
                            className="flex-1 py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
                        >
                            重新评估
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GAD7Scale;
