import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore, type Goal, type Practice, type ReminderFreq } from '../store/useOnboardingStore';

/* ================================================================
   配置数据
   ================================================================ */

const GOALS: { id: Goal; label: string; icon: string; color: string }[] = [
    { id: 'stress', label: '减轻压力', icon: '🧘', color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
    { id: 'sleep', label: '改善睡眠', icon: '🌙', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
    { id: 'anxiety', label: '缓解焦虑', icon: '💨', color: 'bg-amber-100 border-amber-300 text-amber-700' },
    { id: 'depression', label: '应对抑郁', icon: '🌤', color: 'bg-sky-100 border-sky-300 text-sky-700' },
    { id: 'focus', label: '提升专注', icon: '🎯', color: 'bg-violet-100 border-violet-300 text-violet-700' },
    { id: 'emotion', label: '情绪管理', icon: '❤️', color: 'bg-rose-100 border-rose-300 text-rose-700' },
];

const PRACTICES: { id: Practice; label: string; icon: string }[] = [
    { id: 'breathing', label: '呼吸练习', icon: '🌬️' },
    { id: 'meditation', label: '正念冥想', icon: '🧘' },
    { id: 'cbt', label: 'CBT 认知训练', icon: '🧠' },
    { id: 'writing', label: '日记 / 写作', icon: '✏️' },
];

const FREQ_OPTIONS: { id: ReminderFreq; label: string; desc: string }[] = [
    { id: 'none', label: '不提醒', desc: '我自己安排' },
    { id: 'daily', label: '每天 1 次', desc: '温和提醒' },
    { id: 'twice', label: '每天 2 次', desc: '早晚各一次' },
    { id: 'hourly', label: '每小时', desc: '高频跟进' },
];

const BASELINE_QUESTIONS = [
    { key: 'sleep' as const, label: '最近一周的睡眠质量', low: '很差', high: '很好', color: 'from-indigo-400 to-indigo-600' },
    { key: 'stress' as const, label: '当前压力感受', low: '没压力', high: '压力极大', color: 'from-amber-400 to-amber-600' },
    { key: 'mood' as const, label: '此刻的心情', low: '很低落', high: '很开心', color: 'from-rose-400 to-rose-600' },
    { key: 'energy' as const, label: '今天的精力水平', low: '疲惫', high: '精力充沛', color: 'from-emerald-400 to-emerald-600' },
];

/* ================================================================
   工具函数：根据 onboarding 结果生成"今日计划"
   ================================================================ */
function generateTodayPlan(goals: Goal[], practices: Practice[], baseline: Record<string, number | null>) {
    // 推荐工具
    let tool = '呼吸放松';
    let toolIcon = '🌬️';
    if (practices.includes('meditation')) { tool = '5 分钟正念冥想'; toolIcon = '🧘'; }
    else if (practices.includes('cbt')) { tool = 'Stroop 认知训练'; toolIcon = '🧠'; }
    else if (practices.includes('writing')) { tool = '心情日记'; toolIcon = '✏️'; }

    // 推荐任务
    let task = '今晚比平时早 30 分钟上床';
    let taskIcon = '🌙';
    const stress = baseline.stress ?? 5;
    const mood = baseline.mood ?? 5;
    if (stress >= 7) { task = '找一个安静的地方做 3 次深呼吸'; taskIcon = '💨'; }
    else if (mood <= 3) { task = '给自己写 3 件今天值得感恩的事'; taskIcon = '✨'; }
    else if (goals.includes('focus')) { task = '尝试 25 分钟番茄钟专注工作'; taskIcon = '🎯'; }

    return { tool, toolIcon, task, taskIcon };
}

/* ================================================================
   Slide 动画
   ================================================================ */
const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

/* ================================================================
   主组件
   ================================================================ */
interface OnboardingWizardProps {
    onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const {
        step, nextStep, prevStep,
        profile, setGoals, setReminderFreq, setPractices, setReminderTime, setBaseline,
        completeOnboarding, syncToServer,
    } = useOnboardingStore();

    const [direction, setDirection] = useState(1);

    const goNext = useCallback(() => { setDirection(1); nextStep(); }, [nextStep]);
    const goPrev = useCallback(() => { setDirection(-1); prevStep(); }, [prevStep]);

    const handleFinish = useCallback(async () => {
        completeOnboarding();
        const token = localStorage.getItem('token');
        if (token) await syncToServer(token);
        onComplete();
    }, [completeOnboarding, syncToServer, onComplete]);

    const canProceed = () => {
        if (step === 0) return profile.goals.length > 0;
        if (step === 1) return profile.practices.length > 0;
        if (step === 2) return profile.baseline_sleep !== null && profile.baseline_mood !== null;
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-warm-50 via-rose-50/30 to-primary-50/50 flex flex-col">
            {/* Progress bar */}
            <div className="px-6 pt-6 pb-2 max-w-lg mx-auto w-full">
                <div className="flex items-center gap-2">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-warm-200/60">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full"
                                initial={false}
                                animate={{ width: i <= step ? '100%' : '0%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-xs text-warm-400 mt-2 text-right">{step + 1} / 4</p>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-start justify-center px-5 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="w-full max-w-lg"
                    >
                        {step === 0 && <Step1Goals goals={profile.goals} setGoals={setGoals} />}
                        {step === 1 && (
                            <Step2Preferences
                                practices={profile.practices}
                                setPractices={setPractices}
                                freq={profile.reminder_freq}
                                setFreq={setReminderFreq}
                                time={profile.reminder_time}
                                setTime={setReminderTime}
                            />
                        )}
                        {step === 2 && <Step3Baseline profile={profile} setBaseline={setBaseline} />}
                        {step === 3 && <Step4Complete profile={profile} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Nav buttons */}
            <div className="px-6 pb-10 pt-4 max-w-lg mx-auto w-full flex gap-3">
                {step > 0 && (
                    <button
                        onClick={goPrev}
                        className="flex-1 py-3.5 rounded-2xl bg-white/70 backdrop-blur border border-warm-200/60 text-warm-600 font-medium active:scale-[0.97] transition-transform"
                    >
                        上一步
                    </button>
                )}
                {step < 3 ? (
                    <button
                        onClick={goNext}
                        disabled={!canProceed()}
                        className={`flex-1 py-3.5 rounded-2xl font-bold text-white transition-all active:scale-[0.97] ${
                            canProceed()
                                ? 'bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-300/30'
                                : 'bg-warm-300 cursor-not-allowed'
                        }`}
                    >
                        下一步
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold shadow-lg shadow-primary-300/30 active:scale-[0.97] transition-transform"
                    >
                        进入 NeuraSense
                    </button>
                )}
            </div>
        </div>
    );
}

/* ================================================================
   Step 1: 选择目标
   ================================================================ */
function Step1Goals({ goals, setGoals }: { goals: Goal[]; setGoals: (g: Goal[]) => void }) {
    const toggle = (id: Goal) => {
        setGoals(goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id]);
    };
    return (
        <div className="pt-4">
            <h2 className="text-2xl font-bold text-warm-800 mb-2">你好，欢迎来到 NeuraSense</h2>
            <p className="text-warm-500 mb-6">你最希望在哪些方面获得帮助？（可多选）</p>
            <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => {
                    const selected = goals.includes(g.id);
                    return (
                        <motion.button
                            key={g.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggle(g.id)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors text-left ${
                                selected ? g.color + ' border-current' : 'bg-white/60 border-warm-200/50 text-warm-600'
                            }`}
                        >
                            <span className="text-2xl">{g.icon}</span>
                            <span className="font-medium text-sm">{g.label}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

/* ================================================================
   Step 2: 偏好设置
   ================================================================ */
function Step2Preferences({
    practices, setPractices,
    freq, setFreq,
    time, setTime,
}: {
    practices: Practice[]; setPractices: (p: Practice[]) => void;
    freq: ReminderFreq; setFreq: (f: ReminderFreq) => void;
    time: string; setTime: (t: string) => void;
}) {
    const togglePractice = (id: Practice) => {
        setPractices(practices.includes(id) ? practices.filter((p) => p !== id) : [...practices, id]);
    };

    return (
        <div className="pt-4 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-warm-800 mb-2">定制你的练习偏好</h2>
                <p className="text-warm-500 mb-4">你喜欢哪类练习？（可多选）</p>
                <div className="grid grid-cols-2 gap-3">
                    {PRACTICES.map((p) => {
                        const selected = practices.includes(p.id);
                        return (
                            <motion.button
                                key={p.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => togglePractice(p.id)}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors text-left ${
                                    selected
                                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                                        : 'bg-white/60 border-warm-200/50 text-warm-600'
                                }`}
                            >
                                <span className="text-2xl">{p.icon}</span>
                                <span className="font-medium text-sm">{p.label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* 提醒频率 */}
            <div>
                <h3 className="font-semibold text-warm-700 mb-3">提醒频率</h3>
                <div className="space-y-2">
                    {FREQ_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setFreq(opt.id)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-colors ${
                                freq === opt.id
                                    ? 'bg-primary-50 border-primary-300'
                                    : 'bg-white/60 border-warm-200/50'
                            }`}
                        >
                            <div className="text-left">
                                <span className={`font-medium text-sm ${freq === opt.id ? 'text-primary-700' : 'text-warm-700'}`}>
                                    {opt.label}
                                </span>
                                <span className="text-xs text-warm-400 ml-2">{opt.desc}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                freq === opt.id ? 'border-primary-500 bg-primary-500' : 'border-warm-300'
                            }`}>
                                {freq === opt.id && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 提醒时间 */}
            {freq !== 'none' && (
                <div>
                    <h3 className="font-semibold text-warm-700 mb-2">首次提醒时间</h3>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-warm-200/50 bg-white/60 text-warm-700 focus:outline-none focus:border-primary-300"
                    />
                </div>
            )}
        </div>
    );
}

/* ================================================================
   Step 3: 基线评估
   ================================================================ */
function Step3Baseline({
    profile,
    setBaseline,
}: {
    profile: { baseline_sleep: number | null; baseline_stress: number | null; baseline_mood: number | null; baseline_energy: number | null };
    setBaseline: (key: 'sleep' | 'stress' | 'mood' | 'energy', value: number) => void;
}) {
    return (
        <div className="pt-4">
            <h2 className="text-2xl font-bold text-warm-800 mb-2">快速了解你的状态</h2>
            <p className="text-warm-500 mb-6">拖动滑块选择 0-10 分，帮助我们建立基线</p>
            <div className="space-y-6">
                {BASELINE_QUESTIONS.map((q) => {
                    const val = profile[`baseline_${q.key}`] ?? 5;
                    return (
                        <div key={q.key} className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-warm-100/60">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-medium text-warm-700 text-sm">{q.label}</span>
                                <span className={`text-lg font-bold bg-gradient-to-r ${q.color} bg-clip-text text-transparent`}>
                                    {val}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={10}
                                value={val}
                                onChange={(e) => setBaseline(q.key, parseInt(e.target.value))}
                                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                            <div className="flex justify-between text-xs text-warm-400 mt-1">
                                <span>{q.low}</span>
                                <span>{q.high}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ================================================================
   Step 4: 完成页 + 今日计划
   ================================================================ */
function Step4Complete({ profile }: { profile: { goals: Goal[]; practices: Practice[]; baseline_sleep: number | null; baseline_stress: number | null; baseline_mood: number | null; baseline_energy: number | null } }) {
    const plan = generateTodayPlan(profile.goals, profile.practices, {
        sleep: profile.baseline_sleep,
        stress: profile.baseline_stress,
        mood: profile.baseline_mood,
        energy: profile.baseline_energy,
    });

    return (
        <div className="pt-4 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/40"
            >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </motion.div>

            <h2 className="text-2xl font-bold text-warm-800 mb-2">一切就绪！</h2>
            <p className="text-warm-500 mb-6">根据你的偏好，我们为你生成了今日计划</p>

            <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-warm-100/60 text-left space-y-4">
                <h3 className="font-semibold text-warm-700 text-sm">今日推荐</h3>

                <div className="flex items-center gap-4 p-4 bg-primary-50/80 rounded-xl">
                    <span className="text-3xl">{plan.toolIcon}</span>
                    <div>
                        <p className="font-medium text-primary-700 text-sm">推荐工具</p>
                        <p className="text-primary-600 font-semibold">{plan.tool}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-accent-50/80 rounded-xl">
                    <span className="text-3xl">{plan.taskIcon}</span>
                    <div>
                        <p className="font-medium text-accent-700 text-sm">小任务</p>
                        <p className="text-accent-600 font-semibold">{plan.task}</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-warm-400 mt-6">你可以随时在「我的」页面修改偏好设置</p>
        </div>
    );
}
