/**
 * ToolboxPage — 数据驱动的工具箱首页
 * 分类筛选 + 搜索 + 卡片列表
 */

import { useState, useEffect, useCallback } from 'react';
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

    return (
        <div className="space-y-6">
            {/* 标题 */}
            <div>
                <h2 className="text-2xl font-bold text-warm-800">工具箱</h2>
                <p className="text-warm-500 mt-1">专业心理健康工具，随时随地使用</p>
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
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/70 backdrop-blur border border-warm-200/60 text-warm-700 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-300/50 transition"
                />
            </div>

            {/* 分类筛选 */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        !activeCategory
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-white/70 text-warm-600 border border-warm-200/60'
                    }`}
                >
                    全部
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activeCategory === cat
                                ? 'bg-primary-500 text-white shadow-sm'
                                : 'bg-white/70 text-warm-600 border border-warm-200/60'
                        }`}
                    >
                        {CATEGORY_META[cat].label}
                    </button>
                ))}
            </div>

            {/* 内置工具快捷入口 */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { id: 'scale', icon: '📋', label: '量表评估', action: () => onNavigate('scale') },
                    { id: 'biosignal', icon: '👁️', label: '生物信号', action: () => onNavigate('biosignal') },
                    { id: 'immersive', icon: '🌲', label: '沉浸疗愈', action: () => onStartImmersive() },
                    { id: 'breathing', icon: '🫧', label: '3D呼吸球', action: () => onNavigate('breathing') },
                    { id: 'stroop', icon: '🧠', label: 'Stroop测试', action: () => onNavigate('stroop') },
                    { id: 'clock', icon: '🕐', label: '画钟测验', action: () => onNavigate('clock') },
                    { id: 'keystroke', icon: '⌨️', label: '键盘动力学', action: () => onNavigate('keystroke') },
                    { id: 'trend', icon: '📈', label: 'AI趋势预测', action: () => onNavigate('trend') },
                ].map((shortcut) => (
                    <button
                        key={shortcut.id}
                        onClick={shortcut.action}
                        className="flex flex-col items-center gap-1.5 py-3 bg-white/60 backdrop-blur rounded-xl border border-warm-200/40 hover:shadow-md transition-all active:scale-[0.97]"
                    >
                        <span className="text-xl">{shortcut.icon}</span>
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
                                            className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-warm-100/60 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-11 h-11 bg-gradient-to-br ${CATEGORY_META[tool.category]?.gradient || 'from-warm-100 to-warm-200'} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <span className="text-xl">{tool.icon}</span>
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
