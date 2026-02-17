/**
 * ProgramsPage — 课程/项目系统
 *
 * 三个视图层级:
 * 1. 列表页 (ProgramList) — 展示所有项目
 * 2. 详情页 (ProgramDetail) — 项目介绍 + 天数列表 + 开始按钮
 * 3. 日课页 (ProgramDay) — 学习卡片 + 工具练习入口 + 复盘问题
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config/api';
import type { ToolItem } from './ToolboxPage';

/* ============================================================
   Types
   ============================================================ */
export interface ProgramMeta {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    gradient: string;
    duration_days: number;
    daily_minutes: number;
    category: string;
    tags: string[];
    is_active: boolean;
}

export interface ProgramDayData {
    id?: string;
    program_id: string;
    day_number: number;
    title: string;
    learn_text: string;
    tool_id: string | null;
    review_question: string;
    tip?: string;
    video_url?: string;
    video_title?: string;
}

export interface ProgramProgress {
    id?: string;
    user_id?: string;
    program_id: string;
    current_day: number;
    completed_days: number[];
    review_answers: Record<string, string>;
    started_at?: string;
}

interface ProgramsPageProps {
    onOpenTool: (tool: ToolItem, onComplete?: () => void) => void;
}

/* ============================================================
   ProgramList — 项目列表
   ============================================================ */
function ProgramList({
    programs,
    progressMap,
    onSelect,
}: {
    programs: ProgramMeta[];
    progressMap: Record<string, ProgramProgress>;
    onSelect: (p: ProgramMeta) => void;
}) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-warm-800">课程计划</h2>
                <p className="text-warm-500 text-sm mt-1">系统化的心理健康改善方案，循序渐进</p>
            </div>

            <div className="space-y-3">
                {programs.map((program) => {
                    const progress = progressMap[program.id];
                    const completedCount = progress?.completed_days?.length || 0;
                    const pct = Math.round((completedCount / program.duration_days) * 100);
                    const isStarted = !!progress;

                    return (
                        <motion.button
                            key={program.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(program)}
                            className="w-full text-left bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${program.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                    <span className="text-2xl">{program.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-warm-800">{program.title}</h3>
                                    <p className="text-warm-500 text-sm mt-0.5">{program.subtitle}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded-full">{program.duration_days} 天</span>
                                        <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded-full">每天 {program.daily_minutes} 分钟</span>
                                        {program.tags.slice(0, 2).map((tag) => (
                                            <span key={tag} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">{tag}</span>
                                        ))}
                                    </div>

                                    {isStarted && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-warm-400 mb-1">
                                                <span>{completedCount === program.duration_days ? '已完成' : `第 ${progress.current_day} 天`}</span>
                                                <span>{pct}%</span>
                                            </div>
                                            <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${program.gradient} transition-all`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <svg className="w-5 h-5 text-warm-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

/* ============================================================
   ProgramDetail — 项目详情 + 天数列表
   ============================================================ */
function ProgramDetail({
    program,
    days,
    progress,
    onBack,
    onStart,
    onSelectDay,
}: {
    program: ProgramMeta;
    days: ProgramDayData[];
    progress: ProgramProgress | null;
    onBack: () => void;
    onStart: () => void;
    onSelectDay: (day: ProgramDayData) => void;
}) {
    const isStarted = !!progress;
    const completedDays = progress?.completed_days || [];

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/80 border border-warm-200/50 flex items-center justify-center text-warm-500 hover:text-warm-700 transition-all active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <h2 className="text-lg font-semibold text-warm-800">{program.title}</h2>
            </div>

            {/* Info Card */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-warm-100/60 mb-4">
                <div className="text-center mb-4">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${program.gradient} flex items-center justify-center shadow-lg mb-3`}>
                        <span className="text-4xl">{program.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-warm-800">{program.title}</h3>
                    <p className="text-warm-500 text-sm mt-1">{program.subtitle}</p>
                </div>

                <div className="flex justify-center gap-4 text-sm text-warm-500 mb-4">
                    <span>{program.duration_days} 天</span>
                    <span>每天 {program.daily_minutes} 分钟</span>
                </div>

                {program.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {program.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">{tag}</span>
                        ))}
                    </div>
                )}

                <p className="text-sm text-warm-600 leading-relaxed whitespace-pre-line">{program.description}</p>
            </div>

            {/* Progress */}
            {isStarted && (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-warm-100/60 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-warm-600 font-medium">进度</span>
                        <span className="text-warm-500">{completedDays.length} / {program.duration_days} 天</span>
                    </div>
                    <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${program.gradient}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedDays.length / program.duration_days) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            )}

            {/* Day List */}
            <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-warm-700 mb-2">课程日程</h4>
                {days.map((day) => {
                    const isDone = completedDays.includes(day.day_number);
                    const isCurrent = isStarted && progress!.current_day === day.day_number && !isDone;
                    const isLocked = isStarted && day.day_number > progress!.current_day && !isDone;

                    return (
                        <button
                            key={day.day_number}
                            onClick={() => {
                                if (!isLocked && isStarted) onSelectDay(day);
                            }}
                            disabled={isLocked || !isStarted}
                            className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                isDone
                                    ? 'bg-emerald-50/60 border-emerald-200/60'
                                    : isCurrent
                                      ? `bg-gradient-to-r ${program.gradient} bg-opacity-5 border-primary-200`
                                      : isLocked
                                        ? 'bg-warm-50/30 border-warm-100/40 opacity-50'
                                        : 'bg-white/80 border-warm-100/60 hover:shadow-sm'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                isDone
                                    ? 'bg-emerald-500 text-white'
                                    : isCurrent
                                      ? `bg-gradient-to-br ${program.gradient} text-white`
                                      : 'bg-warm-200 text-warm-500'
                            }`}>
                                {isDone ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                ) : day.day_number}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isDone ? 'text-emerald-700' : isCurrent ? 'text-warm-800' : 'text-warm-600'}`}>
                                    {day.title}
                                </p>
                            </div>
                            {isCurrent && (
                                <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-medium">今天</span>
                            )}
                            {isLocked && (
                                <svg className="w-4 h-4 text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Start Button */}
            {!isStarted && (
                <button
                    onClick={onStart}
                    className={`w-full py-4 rounded-2xl bg-gradient-to-r ${program.gradient} text-white font-bold text-lg shadow-lg active:scale-[0.97] transition-transform`}
                >
                    开始课程
                </button>
            )}
        </div>
    );
}

/* ============================================================
   Bilibili 视频嵌入辅助
   ============================================================ */
function getBilibiliEmbedUrl(url: string): string | null {
    if (!url) return null;
    const bvMatch = url.match(/\/video\/(BV[\w]+)/);
    if (bvMatch) {
        return `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}&autoplay=0&high_quality=1`;
    }
    const avMatch = url.match(/\/video\/av(\d+)/);
    if (avMatch) {
        return `https://player.bilibili.com/player.html?aid=${avMatch[1]}&autoplay=0&high_quality=1`;
    }
    return null;
}

/* ============================================================
   ProgramDayView — 单日课程内容
   ============================================================ */
function ProgramDayView({
    program,
    day,
    progress,
    onBack,
    onOpenTool,
    onCompleteDay,
}: {
    program: ProgramMeta;
    day: ProgramDayData;
    progress: ProgramProgress;
    onBack: () => void;
    onOpenTool: (toolId: string, onComplete: () => void) => void;
    onCompleteDay: (answer: string) => void;
}) {
    const [toolCompleted, setToolCompleted] = useState(false);
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const isDone = progress.completed_days.includes(day.day_number);
    const existingAnswer = progress.review_answers?.[String(day.day_number)] || '';

    const handleSubmit = async () => {
        setSubmitting(true);
        await onCompleteDay(answer);
        setSubmitting(false);
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/80 border border-warm-200/50 flex items-center justify-center text-warm-500 hover:text-warm-700 transition-all active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <div>
                    <p className="text-xs text-warm-400">第 {day.day_number} / {program.duration_days} 天</p>
                    <h2 className="text-lg font-semibold text-warm-800">{day.title}</h2>
                </div>
            </div>

            {/* 进度条 */}
            <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden mb-5">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${program.gradient} transition-all`}
                    style={{ width: `${(day.day_number / program.duration_days) * 100}%` }}
                />
            </div>

            {/* 已完成标记 */}
            {isDone && (
                <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-emerald-700 font-medium">今日课程已完成</span>
                </div>
            )}

            {/* 学习卡片 */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60 mb-4">
                <h3 className="text-base font-bold text-warm-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📖</span> 今日知识
                </h3>
                <div className="text-sm text-warm-600 leading-relaxed whitespace-pre-line">
                    {day.learn_text}
                </div>
                {day.tip && (
                    <div className="mt-4 bg-amber-50/80 rounded-xl p-3 border border-amber-100/60">
                        <p className="text-xs text-amber-700">💡 {day.tip}</p>
                    </div>
                )}
            </div>

            {/* 配套视频 */}
            {day.video_url && (() => {
                const embedUrl = getBilibiliEmbedUrl(day.video_url!);
                return embedUrl ? (
                    <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60 mb-4">
                        <h3 className="text-base font-bold text-warm-800 mb-3 flex items-center gap-2">
                            <span className="text-lg">🎬</span> 配套视频
                        </h3>
                        {day.video_title && (
                            <p className="text-sm text-warm-500 mb-3">{day.video_title}</p>
                        )}
                        <div className="relative w-full rounded-xl overflow-hidden bg-warm-100" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                src={embedUrl}
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                                sandbox="allow-scripts allow-same-origin allow-popups"
                                loading="lazy"
                            />
                        </div>
                        <a
                            href={day.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            在 Bilibili 中打开
                        </a>
                    </div>
                ) : null;
            })()}

            {/* 工具练习入口 */}
            {day.tool_id && (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60 mb-4">
                    <h3 className="text-base font-bold text-warm-800 mb-3 flex items-center gap-2">
                        <span className="text-lg">🧘</span> 今日练习
                    </h3>
                    {toolCompleted || isDone ? (
                        <div className="flex items-center gap-2 py-3 px-4 bg-emerald-50 rounded-xl border border-emerald-200/60">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            <span className="text-sm text-emerald-700 font-medium">练习已完成</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => onOpenTool(day.tool_id!, () => setToolCompleted(true))}
                            className={`w-full py-3 rounded-xl bg-gradient-to-r ${program.gradient} text-white font-bold shadow-md active:scale-[0.97] transition-transform`}
                        >
                            开始练习
                        </button>
                    )}
                </div>
            )}

            {/* 复盘问题 */}
            {day.review_question && (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-warm-100/60 mb-4">
                    <h3 className="text-base font-bold text-warm-800 mb-3 flex items-center gap-2">
                        <span className="text-lg">💭</span> 今日复盘
                    </h3>
                    <p className="text-sm text-warm-600 mb-3">{day.review_question}</p>

                    {isDone && existingAnswer ? (
                        <div className="bg-warm-50 rounded-xl p-3">
                            <p className="text-sm text-warm-600 italic">"{existingAnswer}"</p>
                        </div>
                    ) : (
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="写下你的想法..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-warm-50 border border-warm-100 text-sm text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none"
                        />
                    )}
                </div>
            )}

            {/* 完成按钮 */}
            {!isDone && (
                <button
                    onClick={handleSubmit}
                    disabled={submitting || (!toolCompleted && !!day.tool_id)}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.97] transition-transform ${
                        !toolCompleted && day.tool_id
                            ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                            : `bg-gradient-to-r ${program.gradient} text-white`
                    }`}
                >
                    {submitting
                        ? '提交中...'
                        : !toolCompleted && day.tool_id
                          ? '请先完成今日练习'
                          : '完成今日课程'}
                </button>
            )}
        </div>
    );
}

/* ============================================================
   本地进度存储 (未登录时使用)
   ============================================================ */
const LOCAL_PROGRESS_KEY = 'neurasense_program_progress';

function _loadLocalProgress(): Record<string, ProgramProgress> {
    try {
        const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function _saveLocalProgress(map: Record<string, ProgramProgress>) {
    try {
        localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(map));
    } catch { /* quota exceeded */ }
}

/* ============================================================
   Main ProgramsPage
   ============================================================ */
type View = 'list' | 'detail' | 'day';

export default function ProgramsPage({ onOpenTool }: ProgramsPageProps) {
    const [view, setView] = useState<View>('list');
    const [programs, setPrograms] = useState<ProgramMeta[]>([]);
    const [selectedProgram, setSelectedProgram] = useState<ProgramMeta | null>(null);
    const [days, setDays] = useState<ProgramDayData[]>([]);
    const [selectedDay, setSelectedDay] = useState<ProgramDayData | null>(null);
    const [progressMap, setProgressMap] = useState<Record<string, ProgramProgress>>(_loadLocalProgress);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    // 加载项目列表
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/programs`);
                if (!res.ok) return;
                const json = await res.json();
                setPrograms(json.programs || []);
            } catch { /* offline */ }
            setLoading(false);
        })();
    }, []);

    // 加载所有项目进度 (API 优先, 合并本地)
    useEffect(() => {
        if (!token || programs.length === 0) return;
        (async () => {
            const map: Record<string, ProgramProgress> = {};
            for (const p of programs) {
                try {
                    const res = await fetch(`${API_BASE}/programs/${p.id}?token=${token}`);
                    if (!res.ok) continue;
                    const json = await res.json();
                    if (json.progress) map[p.id] = json.progress;
                } catch { /* skip */ }
            }
            if (Object.keys(map).length > 0) {
                setProgressMap((prev) => {
                    const merged = { ...prev, ...map };
                    _saveLocalProgress(merged);
                    return merged;
                });
            }
        })();
    }, [token, programs]);

    // 打开详情页
    const openDetail = useCallback(async (program: ProgramMeta) => {
        setSelectedProgram(program);
        setView('detail');
        try {
            const url = token
                ? `${API_BASE}/programs/${program.id}?token=${token}`
                : `${API_BASE}/programs/${program.id}`;
            const res = await fetch(url);
            if (!res.ok) return;
            const json = await res.json();
            setDays(json.days || []);
            if (json.progress) {
                setProgressMap((prev) => {
                    const next = { ...prev, [program.id]: json.progress };
                    _saveLocalProgress(next);
                    return next;
                });
            }
        } catch { /* offline */ }
    }, [token]);

    // 开始项目 (支持无登录本地模式)
    const startProgram = useCallback(async () => {
        if (!selectedProgram) return;

        // 已登录 → 走 API
        if (token) {
            try {
                const res = await fetch(`${API_BASE}/programs/${selectedProgram.id}/start?token=${token}`, {
                    method: 'POST',
                });
                if (!res.ok) return;
                const json = await res.json();
                if (json.progress) {
                    setProgressMap((prev) => {
                        const next = { ...prev, [selectedProgram.id]: json.progress };
                        _saveLocalProgress(next);
                        return next;
                    });
                }
                return;
            } catch { /* fall through to local */ }
        }

        // 未登录 / API 失败 → 本地进度
        const localProgress: ProgramProgress = {
            program_id: selectedProgram.id,
            current_day: 1,
            completed_days: [],
            review_answers: {},
            started_at: new Date().toISOString(),
        };
        setProgressMap((prev) => {
            const next = { ...prev, [selectedProgram.id]: localProgress };
            _saveLocalProgress(next);
            return next;
        });
    }, [token, selectedProgram]);

    // 完成某天 (支持无登录本地模式)
    const completeDay = useCallback(async (answer: string) => {
        if (!selectedProgram || !selectedDay) return;

        const programId = selectedProgram.id;
        const dayNum = selectedDay.day_number;
        const maxDays = selectedProgram.duration_days;

        // 已登录 → 走 API
        if (token) {
            try {
                const res = await fetch(
                    `${API_BASE}/programs/${programId}/days/${dayNum}/complete?token=${token}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ review_answer: answer || null, tool_completed: true }),
                    },
                );
                if (res.ok) {
                    const json = await res.json();
                    if (json.progress) {
                        setProgressMap((prev) => {
                            const next = { ...prev, [programId]: json.progress };
                            _saveLocalProgress(next);
                            return next;
                        });
                    }
                    setView('detail');
                    setSelectedDay(null);
                    return;
                }
            } catch { /* fall through to local */ }
        }

        // 未登录 / API 失败 → 本地更新
        setProgressMap((prev) => {
            const existing = prev[programId];
            if (!existing) return prev;
            const completedDays = [...existing.completed_days];
            if (!completedDays.includes(dayNum)) completedDays.push(dayNum);
            const reviewAnswers = { ...existing.review_answers };
            if (answer) reviewAnswers[String(dayNum)] = answer;
            const updated: ProgramProgress = {
                ...existing,
                completed_days: completedDays,
                review_answers: reviewAnswers,
                current_day: Math.max(existing.current_day, Math.min(dayNum + 1, maxDays)),
            };
            const next = { ...prev, [programId]: updated };
            _saveLocalProgress(next);
            return next;
        });
        setView('detail');
        setSelectedDay(null);
    }, [token, selectedProgram, selectedDay]);

    // 打开工具练习 — 联动 ToolRunner
    const handleOpenTool = useCallback((toolId: string, onComplete: () => void) => {
        // 从 API 拉取工具数据
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/tools/${toolId}`);
                if (!res.ok) return;
                const json = await res.json();
                if (json.tool) {
                    onOpenTool(json.tool as ToolItem, onComplete);
                }
            } catch { /* offline */ }
        })();
    }, [onOpenTool]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-3 border-primary-400 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {view === 'list' && (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProgramList
                        programs={programs}
                        progressMap={progressMap}
                        onSelect={openDetail}
                    />
                </motion.div>
            )}

            {view === 'detail' && selectedProgram && (
                <motion.div key="detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <ProgramDetail
                        program={selectedProgram}
                        days={days}
                        progress={progressMap[selectedProgram.id] || null}
                        onBack={() => { setView('list'); setSelectedProgram(null); }}
                        onStart={startProgram}
                        onSelectDay={(day) => { setSelectedDay(day); setView('day'); }}
                    />
                </motion.div>
            )}

            {view === 'day' && selectedProgram && selectedDay && progressMap[selectedProgram.id] && (
                <motion.div key="day" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <ProgramDayView
                        program={selectedProgram}
                        day={selectedDay}
                        progress={progressMap[selectedProgram.id]}
                        onBack={() => { setView('detail'); setSelectedDay(null); }}
                        onOpenTool={handleOpenTool}
                        onCompleteDay={completeDay}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
