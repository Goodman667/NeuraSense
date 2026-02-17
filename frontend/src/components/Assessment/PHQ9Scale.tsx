/**
 * PHQ-9 Scale Assessment Component
 * 
 * Patient Health Questionnaire-9 for depression screening.
 * Includes all 9 questions with scoring and AI interpretation.
 */

import { useState, useCallback } from 'react';
import { API_BASE } from '../../config/api';
import { PDFDownloadButton } from './PDFDownloadButton';
import { MarkdownText } from './MarkdownText';

// PHQ-9 问题定义
const PHQ9_QUESTIONS = [
    "做事时提不起劲或没有兴趣",
    "感到心情低落、沮丧或绝望",
    "入睡困难、睡不安稳或睡眠过多",
    "感觉疲倦或没有活力",
    "食欲不振或吃太多",
    "觉得自己很糟——或觉得自己很失败，或让自己或家人失望",
    "对事物专注有困难，例如阅读报纸或看电视时",
    "动作或说话速度缓慢到别人已经觉察？或正好相反——Loss得无法静坐，动来动去的情况比平常更严重",
    "有不如死掉或用某种方式伤害自己的念头"
];

// 选项定义
const OPTIONS = [
    { value: 0, label: "完全不会", description: "过去2周内完全没有发生" },
    { value: 1, label: "好几天", description: "一周内有几天" },
    { value: 2, label: "一半以上的天数", description: "超过一半的日子" },
    { value: 3, label: "几乎每天", description: "每天或几乎每天" },
];

// 严重程度解读
const getSeverity = (score: number) => {
    if (score <= 4) return { level: '正常', color: 'green', description: '您目前的情绪状态良好' };
    if (score <= 9) return { level: '轻度', color: 'yellow', description: '可能存在轻微的抑郁倾向' };
    if (score <= 14) return { level: '中度', color: 'orange', description: '建议寻求专业心理咨询' };
    if (score <= 19) return { level: '中重度', color: 'red', description: '强烈建议接受专业帮助' };
    return { level: '重度', color: 'red', description: '请尽快寻求专业医疗帮助' };
};

interface PHQ9ScaleProps {
    onComplete?: (result: PHQ9Result) => void;
    onClose?: () => void;
}

export interface PHQ9Result {
    totalScore: number;
    answers: number[];
    severity: string;
    timestamp: Date;
    aiInterpretation?: string;
}

export const PHQ9Scale = ({ onComplete, onClose }: PHQ9ScaleProps) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(9).fill(null));
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

        // 自动跳转到下一题
        if (currentQuestion < 8) {
            setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
        }
    }, [currentQuestion, answers]);

    // 完成评估并获取 AI 解读
    const handleComplete = useCallback(async () => {
        // 检查是否所有问题都已回答
        if (answers.some(a => a === null)) {
            return;
        }

        setIsLoading(true);

        try {
            // 构建包含各维度得分的个性化 prompt
            const labels = ['兴趣减退', '心情低落', '睡眠问题', '精力不足', '食欲变化', '自我评价低', '注意力不集中', '行动迟缓/烦躁', '自伤念头'];
            const dimensions = answers
                .map((a, i) => `${labels[i]}=${a}/3`)
                .join('，');
            const highItems = labels.filter((_, i) => (answers[i] ?? 0) >= 2);

            const detailedPrompt = `作为心理健康顾问，请根据以下 PHQ-9 评估结果给出个性化建议。

## 评估数据
- 总分：${totalScore}/27（${severity.level}）
- 各维度：${dimensions}
${highItems.length > 0 ? `- 需重点关注：${highItems.join('、')}` : '- 各维度得分均较低，状态良好'}

## 回复要求
1. 直接给出建议，不要以"当然可以"、"好的"等寒暄开头
2. 针对得分较高的维度给出具体建议（而非泛泛而谈）
3. 用以下结构回复：

### 总体评估
（1-2句话概括状态）

### 重点建议
（针对高分维度的 2-3 条具体可操作建议，每条用 - 开头）

### 日常调节
（睡眠、运动、饮食、社交各 1 条简短建议，用 - 开头）

${totalScore >= 10 ? '### 专业资源\n（推荐就医科室和心理援助热线 400-161-9995）' : ''}

请保持温暖但简洁，总字数控制在 300 字以内。`;

            const response = await fetch(`${API_BASE}/counselor/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: detailedPrompt,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiInterpretation(data.message || data.reply);
            }
        } catch (error) {
            console.error('Failed to get AI interpretation:', error);
            // 使用默认解读
            setAiInterpretation(getDefaultInterpretation(totalScore));
        }

        setIsLoading(false);
        setIsComplete(true);

        // 回调
        onComplete?.({
            totalScore,
            answers: answers as number[],
            severity: severity.level,
            timestamp: new Date(),
            aiInterpretation: aiInterpretation || undefined,
        });
    }, [answers, totalScore, severity, onComplete, aiInterpretation]);

    // 默认解读 - 提供具体可操作的建议
    const getDefaultInterpretation = (score: number): string => {
        if (score <= 4) {
            return `✅ 恭喜！您的评估结果显示情绪状态良好。

📋 保持建议：
• 继续保持规律作息（每天7-8小时睡眠）
• 坚持适度运动（每周3-5次，每次30分钟）
• 保持社交活动和兴趣爱好
• 可以尝试正念冥想（推荐App：潮汐、Headspace）

💡 小贴士：定期进行自我评估，关注情绪变化。`;
        }
        if (score <= 9) {
            return `⚠️ 您的评估结果显示可能存在轻度情绪困扰。

📋 自我调节建议：
• 规律作息：每天固定时间睡觉起床，保证7-8小时睡眠
• 适度运动：每天散步、慢跑或瑜伽30分钟，释放内啡肽
• 健康饮食：多吃富含Omega-3的食物（如鱼类）、蔬菜水果
• 社交支持：和信任的家人朋友聊聊心事，不要独自扛
• 放松技巧：试试深呼吸、正念冥想

💡 如果2周后情况没有改善，建议寻求专业心理咨询。`;
        }
        if (score <= 14) {
            return `🔔 您的评估结果显示可能存在中度情绪困扰。

📋 强烈建议：
1. 咨询专业人士
   • 去医院精神心理科、心理门诊进行评估
   • 中度抑郁可通过心理治疗（如认知行为疗法CBT）、药物治疗或两者结合改善
   
2. 短期自我调节（辅助专业帮助）
   • 规律作息：每天固定时间睡觉和起床
   • 适度运动：每天散步或瑜伽30分钟
   • 健康饮食：多吃蔬菜水果，避免过度咖啡因和糖
   • 社交支持：和信任的人聊聊心事

📞 心理援助热线：
• 全国心理援助热线：400-161-9995
• 北京心理危机干预热线：800-810-1117
• 希望24热线：400-161-9995`;
        }
        return `🆘 您的评估结果显示您可能正在经历较严重的情绪困扰。

📋 请立即采取行动：
1. 尽快联系专业人士
   • 去医院精神心理科或心理门诊进行专业评估
   • 认知行为疗法（CBT）和药物治疗对重度抑郁效果显著
   • 早干预效果更好

2. 如有自杀或自伤想法，请立刻拨打危机热线：
   📞 全国心理援助热线：400-161-9995
   📞 北京心理危机干预热线：800-810-1117
   📞 生命热线：400-821-1215
   📞 或直接去当地医院急诊

3. 告诉身边信任的人
   • 不要独自承受，让家人或朋友陪伴你

💜 请记住：寻求帮助是勇敢的表现，您并不孤单。`;
    };

    // 进度百分比
    const progress = ((currentQuestion + 1) / 9) * 100;

    return (
        <div className="max-w-2xl mx-auto">
            {/* 标题 */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-warm-800 mb-2">PHQ-9 抑郁筛查量表</h2>
                <p className="text-warm-600">
                    过去 <span className="font-semibold text-primary-600">2 周</span> 内，您有多少时间受到以下问题的困扰？
                </p>
            </div>

            {!isComplete ? (
                <>
                    {/* 进度条 */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-warm-500 mb-2">
                            <span>问题 {currentQuestion + 1} / 9</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* 问题卡片 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-warm-100">
                        <p className="text-xl text-warm-800 font-medium mb-8 min-h-[80px]">
                            {PHQ9_QUESTIONS[currentQuestion]}
                        </p>

                        {/* 选项 */}
                        <div className="space-y-3">
                            {OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleAnswer(option.value)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${answers[currentQuestion] === option.value
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-warm-200 hover:border-primary-300 hover:bg-warm-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-medium">{option.label}</span>
                                            <span className="text-warm-500 text-sm ml-2">({option.description})</span>
                                        </div>
                                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion] === option.value
                                            ? 'border-primary-500 bg-primary-500'
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

                        {currentQuestion === 8 ? (
                            <button
                                onClick={handleComplete}
                                disabled={answers.some(a => a === null) || isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50"
                            >
                                {isLoading ? '分析中...' : '完成评估'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(Math.min(8, currentQuestion + 1))}
                                disabled={answers[currentQuestion] === null}
                                className="px-6 py-3 text-primary-600 hover:text-primary-700 disabled:opacity-50"
                            >
                                下一题 →
                            </button>
                        )}
                    </div>

                    {/* 第9题特殊提示 */}
                    {currentQuestion === 8 && (
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-amber-800 text-sm">
                                ⚠️ 如果您正在经历困难时刻，请记住您并不孤单。<br />
                                24小时心理援助热线：<span className="font-bold">400-161-9995</span>
                            </p>
                        </div>
                    )}
                </>
            ) : (
                /* 结果页面 - 增强版 */
                <div className="space-y-6">
                    {/* 顶部得分卡片 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-warm-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-warm-800">PHQ-9 评估报告</h2>
                                <p className="text-warm-500 text-sm">{new Date().toLocaleDateString('zh-CN')}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-primary-600">{totalScore}</div>
                                <div className="text-sm text-warm-500">总分 / 27</div>
                            </div>
                        </div>

                        {/* 得分仪表盘 */}
                        <div className="mb-8">
                            <div className="flex justify-between text-xs text-warm-500 mb-2">
                                <span>正常 (0-4)</span>
                                <span>轻度 (5-9)</span>
                                <span>中度 (10-14)</span>
                                <span>中重度 (15-19)</span>
                                <span>重度 (20+)</span>
                            </div>
                            <div className="h-4 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 rounded-full relative">
                                <div
                                    className="absolute w-4 h-6 bg-white border-2 border-warm-800 rounded-full -top-1 shadow-lg transition-all"
                                    style={{ left: `${Math.min(totalScore / 27 * 100, 98)}%`, transform: 'translateX(-50%)' }}
                                />
                            </div>
                        </div>

                        {/* 严重程度标签 */}
                        <div className="flex items-center justify-center space-x-4">
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
                        <div className="bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl shadow-lg p-6 text-white">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-3">小心的专业建议</h3>
                                    <MarkdownText text={aiInterpretation} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 各维度得分图表 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-warm-100">
                        <h3 className="font-bold text-warm-800 mb-4 flex items-center">
                            <span className="text-xl mr-2">📊</span>
                            各维度得分分析
                        </h3>

                        <div className="space-y-4">
                            {PHQ9_QUESTIONS.map((q, i) => {
                                const score = answers[i] ?? 0;
                                const percentage = (score / 3) * 100;
                                const labels = ['兴趣', '心情', '睡眠', '精力', '食欲', '自我评价', '专注', '行动', '自伤念头'];

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
                                        <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
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

                    {/* 建议行动卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                <span className="text-xl">🧘</span>
                            </div>
                            <h4 className="font-semibold text-blue-800 mb-1">放松训练</h4>
                            <p className="text-sm text-blue-600">每天进行5分钟深呼吸或冥想练习</p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                <span className="text-xl">🏃</span>
                            </div>
                            <h4 className="font-semibold text-green-800 mb-1">规律运动</h4>
                            <p className="text-sm text-green-600">每周3次30分钟中等强度运动</p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                                <span className="text-xl">📞</span>
                            </div>
                            <h4 className="font-semibold text-purple-800 mb-1">寻求支持</h4>
                            <p className="text-sm text-purple-600">24h热线: 400-161-9995</p>
                        </div>
                    </div>

                    {/* PDF 下载按钮 */}
                    <PDFDownloadButton
                        scaleType="phq9"
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
                                setAnswers(new Array(9).fill(null));
                                setIsComplete(false);
                                setAiInterpretation(null);
                            }}
                            className="flex-1 py-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all"
                        >
                            重新评估
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PHQ9Scale;
