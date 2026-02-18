/**
 * ToolboxPage — 数据驱动的工具箱首页
 * 分类筛选 + 搜索 + 卡片列表
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config/api';

export interface ToolItem {
    id: string;
    title: string;
    subtitle: string;
    category: string;
    icon: string;
    duration_min: number;
    difficulty: string;
    tags: string[];
    steps: { title: string; body: string; duration_sec: number }[];
    guidance: string[];
    sort_order: number;
}

interface ToolboxPageProps {
    onNavigate: (view: string) => void;
    onStartImmersive: () => void;
    onOpenTool: (tool: ToolItem) => void;
}

const CATEGORY_META: Record<string, { label: string; color: string; gradient: string }> = {
    breathing:   { label: '呼吸放松',   color: 'bg-emerald-500', gradient: 'from-emerald-100 to-teal-200' },
    cbt:         { label: 'CBT 微练习', color: 'bg-amber-500',   gradient: 'from-amber-100 to-orange-200' },
    dbt:         { label: 'DBT 急救',   color: 'bg-red-500',     gradient: 'from-red-100 to-rose-200' },
    mindfulness: { label: '正念冥想',   color: 'bg-violet-500',  gradient: 'from-violet-100 to-purple-200' },
    sleep:       { label: '睡前放松',   color: 'bg-indigo-500',  gradient: 'from-indigo-100 to-blue-200' },
    focus:       { label: '专注',       color: 'bg-cyan-500',    gradient: 'from-cyan-100 to-sky-200' },
};

const DIFFICULTY_LABEL: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '进阶',
};

/* ------------------------------------------------------------------ */
/*  SVG Icon helpers                                                   */
/* ------------------------------------------------------------------ */

/** Clipboard-document-list icon (for 量表评估 / 📋) */
function ClipboardIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
    );
}

/** Eye icon (for 生物信号 / 👁️) */
function EyeIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

/** Tree / nature icon (for 沉浸疗愈 / 🌲) */
function TreeIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-6m0 0l-4-5h2.5L8 6l4-3 4 3-2.5 4H16l-4 5z" />
        </svg>
    );
}

/** Breathing bubble icon (for 3D呼吸球 / 🫧) */
function BreathingBubbleIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** Brain / cognitive icon (for Stroop测试 / 🧠) */
function BrainIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
        </svg>
    );
}

/** Clock icon (for 画钟测验 / 🕐) */
function ClockIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

/** Keyboard icon (for 键盘动力学 / ⌨️) */
function KeyboardIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5h.008v.008H6V10.5zm3 0h.008v.008H9V10.5zm3 0h.008v.008H12V10.5zm3 0h.008v.008H15V10.5zm3 0h.008v.008H18V10.5zM6 13.5h.008v.008H6V13.5zm3 0h.008v.008H9V13.5zm3 0h.008v.008H12V13.5zm3 0h.008v.008H15V13.5zm3 0h.008v.008H18V13.5zM8.25 16.5h7.5" />
        </svg>
    );
}

/** Trending-up / chart icon (for AI趋势预测 / 📈) */
function TrendUpIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
    );
}

/** Wind / breathing icon (for 🌬️) */
function WindIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h11a4 4 0 100-4M3 12h16a4 4 0 110 4M3 16h7a4 4 0 110 4" />
        </svg>
    );
}

/** Pencil-square / writing icon (for 📝) */
function PencilSquareIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
    );
}

/** Stop-circle / emergency icon (for 🛑) */
function StopCircleIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.563A.562.562 0 019 14.437V9.564z" />
        </svg>
    );
}

/** Meditation / sparkles icon (for 🧘) */
function MeditationIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    );
}

/** Moon icon (for 🌙 sleep) */
function MoonIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
    );
}

/** Pomodoro / timer icon (for 🍅 focus timer) */
function PomodoroIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 2.25h3" />
        </svg>
    );
}

/**
 * Maps an emoji string (from API tool data) to an SVG icon ReactNode.
 * Falls back to a generic sparkles icon for unknown emojis.
 */
function toolIconFromEmoji(emoji: string, className = 'w-5 h-5'): ReactNode {
    switch (emoji) {
        case '🌬️': return <WindIcon className={className} />;
        case '📝': return <PencilSquareIcon className={className} />;
        case '🛑': return <StopCircleIcon className={className} />;
        case '🧘': return <MeditationIcon className={className} />;
        case '🌙': return <MoonIcon className={className} />;
        case '🍅': return <PomodoroIcon className={className} />;
        case '📋': return <ClipboardIcon className={className} />;
        case '👁️': return <EyeIcon className={className} />;
        case '🌲': return <TreeIcon className={className} />;
        case '🫧': return <BreathingBubbleIcon className={className} />;
        case '🧠': return <BrainIcon className={className} />;
        case '🕐': return <ClockIcon className={className} />;
        case '⌨️': return <KeyboardIcon className={className} />;
        case '📈': return <TrendUpIcon className={className} />;
        default:
            // Fallback: generic sparkles icon
            return (
                <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
            );
    }
}

export default function ToolboxPage({ onNavigate, onStartImmersive, onOpenTool }: ToolboxPageProps) {
    const [tools, setTools] = useState<ToolItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTools = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeCategory) params.set('category', activeCategory);
            if (searchQuery.trim()) params.set('q', searchQuery.trim());
            const res = await fetch(`${API_BASE}/tools?${params}`);
            const data = await res.json();
            if (data.success) setTools(data.tools);
        } catch {
            // fallback: 无网络时保持空列表
        } finally {
            setLoading(false);
        }
    }, [activeCategory, searchQuery]);

    useEffect(() => { fetchTools(); }, [fetchTools]);

    // 按分类分组
    const categories = Object.keys(CATEGORY_META);
    const grouped = categories
        .map((cat) => ({
            key: cat,
            ...CATEGORY_META[cat],
            items: tools.filter((t) => t.category === cat),
        }))
        .filter((g) => g.items.length > 0);

    /* Shortcut definitions with SVG icon elements */
    const shortcuts: { id: string; icon: ReactNode; label: string; action: () => void }[] = [
        { id: 'scale',     icon: <ClipboardIcon className="w-6 h-6" />,       label: '量表评估',   action: () => onNavigate('scale') },
        { id: 'biosignal', icon: <EyeIcon className="w-6 h-6" />,             label: '生物信号',   action: () => onNavigate('biosignal') },
        { id: 'immersive', icon: <TreeIcon className="w-6 h-6" />,            label: '沉浸疗愈',   action: () => onStartImmersive() },
        { id: 'breathing', icon: <BreathingBubbleIcon className="w-6 h-6" />, label: '3D呼吸球',   action: () => onNavigate('breathing') },
        { id: 'stroop',    icon: <BrainIcon className="w-6 h-6" />,           label: 'Stroop测试', action: () => onNavigate('stroop') },
        { id: 'clock',     icon: <ClockIcon className="w-6 h-6" />,           label: '画钟测验',   action: () => onNavigate('clock') },
        { id: 'keystroke', icon: <KeyboardIcon className="w-6 h-6" />,        label: '键盘动力学', action: () => onNavigate('keystroke') },
        { id: 'trend',     icon: <TrendUpIcon className="w-6 h-6" />,         label: 'AI趋势预测', action: () => onNavigate('trend') },
    ];

    return (
        <div className="space-y-6">
            {/* 标题 */}
            <div className="bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 rounded-2xl p-5 shadow-sm">
                <h2 className="text-2xl font-bold text-white">工具箱</h2>
                <p className="text-indigo-200 mt-1">专业心理健康工具，随时随地使用</p>
            </div>

            {/* 搜索 */}
            <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="搜索工具..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-warm-100 dark:border-gray-700 text-warm-700 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-300/50 transition-all duration-200"
                />
            </div>

            {/* 分类筛选 */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${
                        !activeCategory
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-warm-600 border border-warm-100 dark:border-gray-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    全部
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${
                            activeCategory === cat
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-800 text-warm-600 border border-warm-100 dark:border-gray-700 shadow-sm hover:shadow-md'
                        }`}
                    >
                        {CATEGORY_META[cat].label}
                    </button>
                ))}
            </div>

            {/* 内置工具快捷入口 */}
            <div className="grid grid-cols-4 gap-2">
                {shortcuts.map((shortcut) => (
                    <button
                        key={shortcut.id}
                        onClick={shortcut.action}
                        className="flex flex-col items-center gap-1.5 py-3 bg-white dark:bg-gray-800 rounded-xl border border-warm-100 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 active:scale-[0.97]"
                    >
                        <span className="text-warm-700">{shortcut.icon}</span>
                        <span className="text-xs text-warm-600 font-medium">{shortcut.label}</span>
                    </button>
                ))}
            </div>

            {/* 工具列表 */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-3 border-primary-400 border-t-transparent rounded-full" />
                </div>
            ) : grouped.length === 0 ? (
                <div className="text-center py-12 text-warm-400">
                    {searchQuery ? '没有找到匹配的工具' : '暂无工具数据'}
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory || 'all'}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        {grouped.map((group) => (
                            <section key={group.key}>
                                <h3 className="text-base font-semibold text-warm-700 mb-3 flex items-center gap-2">
                                    <span className={`w-1.5 h-5 rounded-full ${group.color}`} />
                                    {group.label}
                                    <span className="text-xs text-warm-400 font-normal ml-1">{group.items.length} 个</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {group.items.map((tool) => (
                                        <motion.div
                                            key={tool.id}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => onOpenTool(tool)}
                                            className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-warm-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-11 h-11 bg-gradient-to-br ${CATEGORY_META[tool.category]?.gradient || 'from-warm-100 to-warm-200'} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <span className="text-warm-700">{toolIconFromEmoji(tool.icon, 'w-5 h-5')}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-warm-800 text-sm">{tool.title}</h4>
                                                    <p className="text-warm-500 text-xs mt-0.5 line-clamp-1">{tool.subtitle}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-warm-400">{tool.duration_min} 分钟</span>
                                                        <span className="w-1 h-1 rounded-full bg-warm-300" />
                                                        <span className="text-xs text-warm-400">{DIFFICULTY_LABEL[tool.difficulty] || tool.difficulty}</span>
                                                    </div>
                                                </div>
                                                <svg className="w-5 h-5 text-warm-300 group-hover:text-warm-500 transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
