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

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';
import { useCheckinStore, type CheckinData } from '../store/useCheckinStore';
import { API_BASE } from '../config/api';
import type { ToolItem } from './ToolboxPage';

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

const SLIDER_LABELS: Record<string, { low: string; high: string; emoji: string; color: string }> = {
    mood:          { low: '低落', high: '开心', emoji: '😊', color: 'from-rose-400 to-orange-400' },
    stress:        { low: '轻松', high: '紧张', emoji: '😤', color: 'from-red-400 to-rose-400' },
    energy:        { low: '疲惫', high: '充沛', emoji: '⚡', color: 'from-amber-400 to-yellow-400' },
    sleep_quality: { low: '很差', high: '很好', emoji: '🌙', color: 'from-indigo-400 to-violet-400' },
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
            className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60 shadow-sm"
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
                                <span className="text-sm text-warm-700 font-medium">
                                    {meta.emoji} {key === 'mood' ? '心情' : key === 'stress' ? '压力' : key === 'energy' ? '精力' : '睡眠质量'}
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
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold shadow-lg shadow-primary-300/30 active:scale-[0.97] transition-transform disabled:opacity-50"
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
    const emojis = ['😊', '😤', '⚡', '🌙'];
    const colors = ['text-orange-500', 'text-rose-500', 'text-amber-500', 'text-violet-500'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60 shadow-sm"
        >
            <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </span>
                <h3 className="text-base font-bold text-warm-800">今日已签到</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {keys.map((key, i) => (
                    <div key={key} className="text-center">
                        <span className="text-lg">{emojis[i]}</span>
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
                    return (
                        <motion.button
                            key={rec.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => tool && onOpenTool(tool)}
                            className="w-full text-left bg-white/80 backdrop-blur rounded-xl p-4 border border-warm-100/60 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
                        >
                            <span className="text-3xl flex-shrink-0">{tool?.icon || '🧘'}</span>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-warm-800 text-sm">{tool?.title || rec.id}</div>
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

    const tasks = [
        {
            label: '完成状态签到',
            done: hasCheckedIn,
            icon: '📝',
            action: undefined,
        },
        {
            label: '完成 1 个练习工具',
            done: doneTool,
            icon: '🧘',
            action: undefined, // 完成工具后自动标记（通过 store 检测）
        },
        {
            label: '和 AI 聊一次',
            done: false,
            icon: '💬',
            action: onStartChat,
        },
        {
            label: '做 1 次测评',
            done: false,
            icon: '📋',
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                            task.done
                                ? 'bg-emerald-50/60 border-emerald-200/60'
                                : task.action
                                  ? 'bg-white/80 border-warm-100/60 cursor-pointer hover:shadow-sm active:scale-[0.98]'
                                  : 'bg-white/80 border-warm-100/60'
                        }`}
                    >
                        <span className="text-lg">{task.icon}</span>
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
                <span className="text-3xl mb-2 block">📊</span>
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
            {/* ===== 顶部：日期 + 每日一句 ===== */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <p className="text-sm text-warm-400 mb-1">{formatDateCN()}</p>
                <p className="text-base text-warm-600 italic leading-relaxed">"{getDailyQuote()}"</p>
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
                        <span className="text-2xl">🎉</span>
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
