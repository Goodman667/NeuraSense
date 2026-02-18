/**
 * TodayPage — 今日页（移动端优先）
 *
 * 结构:
 * 1. 今日一句话 + 日期
 * 2. 1 分钟状态签到 (4 滑条 + 备注)
 * 3. 今日推荐工具卡片
 * 4. 今日任务打卡
 * 5. 近 7 天趋势折线图
 */

import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';
import { useCheckinStore, type CheckinData } from '../store/useCheckinStore';
import { API_BASE } from '../config/api';
import type { ToolItem } from './ToolboxPage';

/* ============================================================
   Inline SVG Icons
   ============================================================ */

/** Heart icon — mood / 心情 */
const IconMood = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

/** Bolt / lightning icon — stress / 压力 */
const IconStress = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655L9.75 21.75l3.745-4.012M9.257 13.5H3.75l6.409-8.155A.75.75 0 0110.75 6v4.5h5.49a.75.75 0 01.575 1.238l-6.16 7.858" />
    </svg>
);

/** Battery / zap icon — energy / 精力 */
const IconEnergy = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5h1.5m0 0V9.75A2.25 2.25 0 017.5 7.5h9A2.25 2.25 0 0118.75 9.75v4.5a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25V13.5zm15-2.25h.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-.75m-12-3.75h6" />
    </svg>
);

/** Moon icon — sleep / 睡眠 */
const IconSleep = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

/** Pencil-square icon — journal / 签到 */
const IconJournal = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

/** Sparkles icon — meditation / 冥想 */
const IconMeditation = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

/** Chat bubble icon — 聊天 */
const IconChat = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-11.883 5.01L3.72 20.1a.75.75 0 001.06.04l3.168-2.652A9.75 9.75 0 0012 18.75c5.385 0 9.75-3.806 9.75-8.25S17.385 2.25 12 2.25 2.25 6.056 2.25 10.5c0 2.098.846 4.023 2.267 5.51z" />
    </svg>
);

/** Clipboard / assessment icon — 测评 */
const IconAssessment = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
);

/** Chart bar icon — 数据图表 */
const IconChart = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

/** Party / celebration icon (sparkles variant for 签到成功) */
const IconCelebration = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
);

/* ============================================================
   Props
   ============================================================ */
interface TodayPageProps {
    onNavigate: (view: string) => void;
    onStartChat: () => void;
    onOpenTool: (tool: ToolItem) => void;
}

/* ============================================================
   Helpers
   ============================================================ */

const DAILY_QUOTES = [
    '每一天都是新的开始，你已经迈出了最重要的一步。',
    '觉察是改变的起点。记录今天的状态，就是在照顾自己。',
    '不需要完美，只需要真实。',
    '你比你想象的更有力量。',
    '深呼吸。你正在这里，这就够了。',
    '小小的进步也是进步。',
    '照顾好自己，才能更好地面对世界。',
    '今天的你，值得被温柔以待。',
    '每一次练习，都在为内心积攒力量。',
    '关注当下的感受，你已经在成长了。',
    '即使是阴天，太阳依然在云层之上。',
    '给自己一点时间，一切都会好起来。',
    '你的感受很重要，谢谢你愿意分享。',
];

function getDailyQuote() {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
    );
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

function formatDateCN() {
    const d = new Date();
    const weekNames = ['日', '一', '二', '三', '四', '五', '六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 周${weekNames[d.getDay()]}`;
}

/** Map slider key to its inline SVG icon node */
function getSliderIcon(key: string, className = 'w-5 h-5 inline-block'): ReactNode {
    switch (key) {
        case 'mood':          return <IconMood className={className} />;
        case 'stress':        return <IconStress className={className} />;
        case 'energy':        return <IconEnergy className={className} />;
        case 'sleep_quality': return <IconSleep className={className} />;
        default:              return null;
    }
}

const SLIDER_LABELS: Record<string, { low: string; high: string; color: string }> = {
    mood:          { low: '低落', high: '开心', color: 'from-rose-400 to-orange-400' },
    stress:        { low: '轻松', high: '紧张', color: 'from-red-400 to-rose-400' },
    energy:        { low: '疲惫', high: '充沛', color: 'from-amber-400 to-yellow-400' },
    sleep_quality: { low: '很差', high: '很好', color: 'from-indigo-400 to-violet-400' },
};

const SLIDER_KEYS = ['mood', 'stress', 'energy', 'sleep_quality'] as const;

/* ============================================================
   CheckinCard
   ============================================================ */
function CheckinCard({ onDone }: { onDone: () => void }) {
    const { submitCheckin } = useCheckinStore();
    const [values, setValues] = useState({ mood: 5, stress: 5, energy: 5, sleep_quality: 5 });
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (key: string, val: number) =>
        setValues((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        setSubmitting(true);
        const ok = await submitCheckin({ ...values, note: note || undefined } as CheckinData);
        setSubmitting(false);
        if (ok) onDone();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-warm-100 dark:border-gray-700 shadow-sm"
        >
            <h3 className="text-base font-bold text-warm-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm">1'</span>
                1 分钟状态签到
            </h3>

            <div className="space-y-4">
                {SLIDER_KEYS.map((key) => {
                    const meta = SLIDER_LABELS[key];
                    const val = values[key];
                    return (
                        <div key={key}>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-warm-700 font-medium flex items-center gap-1">
                                    {getSliderIcon(key, 'w-4 h-4 inline-block')} {key === 'mood' ? '心情' : key === 'stress' ? '压力' : key === 'energy' ? '精力' : '睡眠质量'}
                                </span>
                                <span className="text-xs font-bold text-warm-500">{val}</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={val}
                                    onChange={(e) => handleChange(key, Number(e.target.value))}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-warm-100"
                                    style={{
                                        background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                                        backgroundImage: `linear-gradient(to right, #e5e7eb ${0}%, #8B5CF6 ${val * 10}%, #e5e7eb ${val * 10}%)`,
                                    }}
                                />
                                <div className="flex justify-between text-[10px] text-warm-400 mt-0.5">
                                    <span>{meta.low}</span>
                                    <span>{meta.high}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* 备注 */}
                <div>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="一句话记录今天的感受（可选）"
                        className="w-full px-4 py-2.5 rounded-xl bg-warm-50 border border-warm-100 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/25 active:scale-[0.97] transition-transform disabled:opacity-50 cursor-pointer"
                >
                    {submitting ? '提交中...' : '完成签到'}
                </button>
            </div>
        </motion.div>
    );
}

/* ============================================================
   CheckinSummary — 签到完成后的摘要
   ============================================================ */
function CheckinSummary({ checkin }: { checkin: CheckinData }) {
    const labels = ['心情', '压力', '精力', '睡眠'];
    const keys: (keyof CheckinData)[] = ['mood', 'stress', 'energy', 'sleep_quality'];
    const icons: ReactNode[] = [
        <IconMood key="mood" className="w-5 h-5 text-orange-500" />,
        <IconStress key="stress" className="w-5 h-5 text-rose-500" />,
        <IconEnergy key="energy" className="w-5 h-5 text-amber-500" />,
        <IconSleep key="sleep" className="w-5 h-5 text-violet-500" />,
    ];
    const colors = ['text-orange-500', 'text-rose-500', 'text-amber-500', 'text-violet-500'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-warm-100 dark:border-gray-700 shadow-sm"
        >
            <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </span>
                <h3 className="text-base font-bold text-warm-800">今日已签到</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {keys.map((key, i) => (
                    <div key={key} className="text-center flex flex-col items-center">
                        <span className="mb-0.5">{icons[i]}</span>
                        <div className={`text-xl font-bold ${colors[i]}`}>{checkin[key] as number}</div>
                        <div className="text-[10px] text-warm-400">{labels[i]}</div>
                    </div>
                ))}
            </div>
            {checkin.note && (
                <p className="mt-3 text-sm text-warm-500 italic bg-warm-50 rounded-lg px-3 py-2">"{checkin.note}"</p>
            )}
        </motion.div>
    );
}

/* ============================================================
   RecommendationCards — 今日推荐工具
   ============================================================ */
function RecommendationCards({
    onOpenTool,
}: {
    onOpenTool: (tool: ToolItem) => void;
}) {
    const { recommendations } = useCheckinStore();
    const [toolsMap, setToolsMap] = useState<Record<string, ToolItem>>({});

    // 从 API 拉取全部工具，建立 id→ToolItem 映射
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/tools`);
                if (!res.ok) return;
                const json = await res.json();
                const map: Record<string, ToolItem> = {};
                for (const t of json.tools || []) map[t.id] = t;
                setToolsMap(map);
            } catch { /* offline ok */ }
        })();
    }, []);

    if (recommendations.length === 0) return null;

    return (
        <div>
            <h3 className="text-base font-bold text-warm-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </span>
                今日推荐
            </h3>
            <div className="space-y-2">
                {recommendations.map((rec) => {
                    const tool = toolsMap[rec.id];
                    // Construct a minimal ToolItem from recommendation if not in toolsMap
                    const effectiveTool: ToolItem = tool || {
                        id: rec.id,
                        title: rec.name || rec.id,
                        subtitle: rec.reason || '',
                        category: rec.category || 'mindfulness',
                        icon: rec.icon || '🧘',
                        duration_min: 5,
                        difficulty: 'easy',
                        tags: [],
                        sort_order: 0,
                        steps: [],
                        guidance: [],
                    };
                    return (
                        <motion.button
                            key={rec.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onOpenTool(effectiveTool)}
                            className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 border border-warm-100 dark:border-gray-700 shadow-sm flex items-center gap-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                            <span className="text-3xl flex-shrink-0">{effectiveTool.icon || '🧘'}</span>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-warm-800 text-sm">{effectiveTool.title}</div>
                                <div className="text-xs text-warm-500 mt-0.5 line-clamp-1">{rec.reason}</div>
                            </div>
                            <svg className="w-5 h-5 text-warm-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

/* ============================================================
   DailyTasks — 今日任务打卡
   ============================================================ */
function DailyTasks({
    hasCheckedIn,
    onStartChat,
    onNavigate,
}: {
    hasCheckedIn: boolean;
    onStartChat: () => void;
    onNavigate: (view: string) => void;
}) {
    // 简单的本地完成状态 (刷新后重置)
    const [doneTool, setDoneTool] = useState(false);

    const tasks: { label: string; done: boolean; icon: ReactNode; action: (() => void) | undefined }[] = [
        {
            label: '完成状态签到',
            done: hasCheckedIn,
            icon: <IconJournal className="w-5 h-5" />,
            action: undefined,
        },
        {
            label: '完成 1 个练习工具',
            done: doneTool,
            icon: <IconMeditation className="w-5 h-5" />,
            action: undefined, // 完成工具后自动标记（通过 store 检测）
        },
        {
            label: '和 AI 聊一次',
            done: false,
            icon: <IconChat className="w-5 h-5" />,
            action: onStartChat,
        },
        {
            label: '做 1 次测评',
            done: false,
            icon: <IconAssessment className="w-5 h-5" />,
            action: () => onNavigate('scale'),
        },
    ];

    // 检测工具完成数
    useEffect(() => {
        const completions = JSON.parse(localStorage.getItem('psy-tool-completions-today') || '0');
        if (completions > 0) setDoneTool(true);
    }, []);

    const doneCount = tasks.filter((t) => t.done).length;

    return (
        <div>
            <h3 className="text-base font-bold text-warm-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                今日任务
                <span className="text-xs text-warm-400 font-normal ml-auto">{doneCount}/{tasks.length}</span>
            </h3>

            {/* 进度条 */}
            <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden mb-3">
                <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${(doneCount / tasks.length) * 100}%` }}
                />
            </div>

            <div className="space-y-2">
                {tasks.map((task) => (
                    <div
                        key={task.label}
                        onClick={task.action}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                            task.done
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50'
                                : task.action
                                  ? 'bg-white dark:bg-gray-800 border-warm-100 dark:border-gray-700 cursor-pointer hover:shadow-sm active:scale-[0.98]'
                                  : 'bg-white dark:bg-gray-800 border-warm-100 dark:border-gray-700'
                        }`}
                    >
                        <span className="text-lg flex items-center">{task.icon}</span>
                        <span className={`flex-1 text-sm ${task.done ? 'text-emerald-600 line-through' : 'text-warm-700'}`}>
                            {task.label}
                        </span>
                        {task.done ? (
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : task.action ? (
                            <svg className="w-4 h-4 text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-warm-200" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ============================================================
   TrendChart — 近 7 天趋势折线图
   ============================================================ */
function TrendChart() {
    const { history, isLoading } = useCheckinStore();

    const chartData = useMemo(() => {
        // 取最近7天数据（时间正序）
        const sorted = [...history]
            .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
            .slice(-7);

        return sorted.map((c) => ({
            date: c.created_at ? new Date(c.created_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) : '',
            心情: c.mood,
            压力: c.stress,
            精力: c.energy,
            睡眠: c.sleep_quality,
        }));
    }, [history]);

    if (isLoading) {
        return (
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60">
                <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    if (chartData.length < 2) {
        return (
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60 text-center">
                <span className="mb-2 block"><IconChart className="w-8 h-8 text-warm-400 mx-auto" /></span>
                <p className="text-sm text-warm-500">签到满 2 天后显示趋势图</p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60">
            <h3 className="text-base font-bold text-warm-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14" /></svg>
                </span>
                近 7 天趋势
            </h3>
            <ResponsiveContainer width="100%" height={200}>
                {/* @ts-expect-error recharts + React 19 type compat */}
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#aaa" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="#aaa" />
                    <Tooltip
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    />
                    <Line type="monotone" dataKey="心情" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="压力" stroke="#F43F5E" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="精力" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="睡眠" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ============================================================
   Main TodayPage
   ============================================================ */
export default function TodayPage({
    onNavigate,
    onStartChat,
    onOpenTool,
}: TodayPageProps) {
    const {
        hasCheckedIn,
        todayCheckin,
        loadHistory,
        loadRecommendations,
    } = useCheckinStore();

    const [justCheckedIn, setJustCheckedIn] = useState(false);

    // 初始加载
    useEffect(() => {
        loadHistory('7d');
        loadRecommendations();
    }, [loadHistory, loadRecommendations]);

    const handleCheckinDone = useCallback(() => {
        setJustCheckedIn(true);
    }, []);

    return (
        <div className="animate-fadeIn space-y-5">
            {/* ===== 顶部：问候横幅 ===== */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white"
            >
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-500/15 rounded-full blur-xl" />
                <div className="relative">
                    <p className="text-indigo-200/60 text-xs mb-1">{formatDateCN()}</p>
                    <p className="text-sm text-indigo-100 leading-relaxed">"{getDailyQuote()}"</p>
                </div>
            </motion.div>

            {/* ===== 签到区域 ===== */}
            <AnimatePresence mode="wait">
                {!hasCheckedIn && !justCheckedIn ? (
                    <CheckinCard key="checkin" onDone={handleCheckinDone} />
                ) : todayCheckin ? (
                    <CheckinSummary key="summary" checkin={todayCheckin} />
                ) : null}
            </AnimatePresence>

            {/* ===== 签到成功动画 ===== */}
            <AnimatePresence>
                {justCheckedIn && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                        className="text-center py-2"
                        onAnimationComplete={() => setTimeout(() => setJustCheckedIn(false), 1500)}
                    >
                        <span className="inline-block"><IconCelebration className="w-7 h-7 text-emerald-500 mx-auto" /></span>
                        <p className="text-sm text-emerald-600 font-medium mt-1">签到成功!</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== 今日推荐 ===== */}
            <RecommendationCards onOpenTool={onOpenTool} />

            {/* ===== 今日任务 ===== */}
            <DailyTasks
                hasCheckedIn={hasCheckedIn || justCheckedIn}
                onStartChat={onStartChat}
                onNavigate={onNavigate}
            />

            {/* ===== 趋势图 ===== */}
            <TrendChart />
        </div>
    );
}
