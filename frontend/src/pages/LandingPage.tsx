import { motion } from 'framer-motion';

const features = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M9 12h6M12 9v6" /><circle cx="12" cy="12" r="10" />
            </svg>
        ),
        title: '专业心理评估',
        desc: 'PHQ-9 / GAD-7 / 画钟测验等多维量表，AI 自动解读',
        gradient: 'from-blue-500 to-cyan-400',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        ),
        title: 'AI 聊愈师',
        desc: '基于大模型的心理咨询对话，实时情绪识别与危机干预',
        gradient: 'from-violet-500 to-purple-400',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
        title: '自助工具箱',
        desc: '呼吸训练 / 正念冥想 / 认知训练 / 生物反馈沉浸场景',
        gradient: 'from-emerald-500 to-teal-400',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
        title: '结构化课程',
        desc: '7~21 天焦虑缓解、睡眠改善、情绪管理等主题计划',
        gradient: 'from-amber-500 to-orange-400',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
        title: '生物信号分析',
        desc: '眼动追踪 / 语音情感 / 键盘动力学，多模态心理评测',
        gradient: 'from-rose-500 to-pink-400',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        title: 'AI 报告与趋势',
        desc: 'PDF 评估报告 / 7 天趋势预测 / 个性化建议',
        gradient: 'from-indigo-500 to-blue-400',
    },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};
const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
};

interface LandingPageProps {
    onGetStarted: () => void;
    onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
            {/* Hero */}
            <header className="flex-shrink-0 pt-14 pb-8 px-6 text-center max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight"
                >
                    NeuraSense
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-indigo-200/70 text-base sm:text-lg leading-relaxed"
                >
                    AI 驱动的心理健康平台 — 评估 · 聊愈 · 训练 · 成长
                </motion.p>
            </header>

            {/* Feature Grid */}
            <motion.section
                variants={container}
                initial="hidden"
                animate="show"
                className="flex-1 px-5 max-w-3xl mx-auto w-full"
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {features.map((f) => (
                        <motion.div
                            key={f.title}
                            variants={item}
                            className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.08] hover:bg-white/[0.12] transition-all duration-200"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center mb-3 shadow-lg shadow-black/20`}>
                                {f.icon}
                            </div>
                            <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                            <p className="text-xs text-indigo-200/50 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* CTA */}
            <motion.footer
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-shrink-0 px-6 pt-8 pb-10 max-w-md mx-auto w-full space-y-3"
            >
                <button
                    onClick={onGetStarted}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 active:scale-[0.97] transition-transform cursor-pointer"
                >
                    开始使用
                </button>
                <button
                    onClick={onLogin}
                    className="w-full py-3 rounded-2xl bg-white/[0.08] backdrop-blur border border-white/[0.12] text-indigo-200 font-medium active:scale-[0.97] transition-transform cursor-pointer hover:bg-white/[0.15]"
                >
                    已有账号？登录
                </button>
                <p className="text-center text-xs text-indigo-300/40 pt-1">
                    继续即表示您同意我们的服务条款和隐私政策
                </p>
            </motion.footer>
        </div>
    );
}
