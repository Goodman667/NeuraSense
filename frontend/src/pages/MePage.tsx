import { useEffect } from 'react';
import type { UserInfo } from '../components';
import { useProfileStore } from '../store/useProfileStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useI18n } from '../i18n';

interface MePageProps {
    currentUser: UserInfo | null;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onShowAuth: () => void;
    onLogout: () => void;
    onShowAchievements: () => void;
    onNavigate: (view: string) => void;
    streak: number;
    todayPoints: number;
}

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    desc: string;
    action: () => void;
    color: string;
    darkColor: string;
}

export default function MePage({
    currentUser,
    isDarkMode,
    onToggleDarkMode,
    onShowAuth,
    onLogout,
    onShowAchievements,
    onNavigate,
    streak,
    todayPoints,
}: MePageProps) {
    const { stats, loadStats } = useProfileStore();
    const { unreadCount, loadUnreadCount } = useNotificationStore();
    const { lang } = useI18n();

    // 加载统计数据 + 未读数
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (currentUser && token) {
            loadStats(token);
            loadUnreadCount(token);
        }
    }, [currentUser, loadStats, loadUnreadCount]);

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth={1.5} className="w-12 h-12 text-primary-400">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-warm-800 dark:text-gray-100 mb-2">
                    {lang === 'zh' ? '登录后体验完整功能' : 'Login for full access'}
                </h3>
                <p className="text-warm-500 dark:text-gray-400 text-sm mb-6">
                    {lang === 'zh' ? '保存评估记录、追踪成长轨迹' : 'Save assessments & track progress'}
                </p>
                <button
                    onClick={onShowAuth}
                    className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg"
                >
                    {lang === 'zh' ? '登录 / 注册' : 'Login / Register'}
                </button>
            </div>
        );
    }

    const assessmentsCount = stats?.assessments_total ?? 0;
    const toolCompletions7d = stats?.tool_completions_7d ?? 0;

    const menuSections: { title: string; items: MenuItem[] }[] = [
        {
            title: lang === 'zh' ? '数据中心' : 'Data Center',
            items: [
                {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${unreadCount > 0 ? 'text-red-500' : 'text-warm-500 dark:text-gray-400'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                    ),
                    label: lang === 'zh'
                        ? (unreadCount > 0 ? `消息中心 (${unreadCount})` : '消息中心')
                        : (unreadCount > 0 ? `Messages (${unreadCount})` : 'Messages'),
                    desc: lang === 'zh'
                        ? (unreadCount > 0 ? `${unreadCount} 条未读消息` : '查看通知和消息')
                        : (unreadCount > 0 ? `${unreadCount} unread` : 'View notifications'),
                    action: () => onNavigate('messages'),
                    color: unreadCount > 0 ? 'bg-red-50' : 'bg-warm-50',
                    darkColor: unreadCount > 0 ? 'dark:bg-red-900/30' : 'dark:bg-gray-700',
                },
                {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                    ),
                    label: lang === 'zh' ? '评估报告' : 'Assessments',
                    desc: lang === 'zh'
                        ? `已完成 ${assessmentsCount} 次评估`
                        : `${assessmentsCount} assessments completed`,
                    action: () => onNavigate('trend'),
                    color: 'bg-blue-50',
                    darkColor: 'dark:bg-blue-900/30',
                },
                {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    ),
                    label: lang === 'zh' ? '心情日记' : 'Mood Journal',
                    desc: lang === 'zh' ? '记录每天的心情和想法' : 'Daily thoughts & feelings',
                    action: () => onNavigate('journal'),
                    color: 'bg-amber-50',
                    darkColor: 'dark:bg-amber-900/30',
                },
                {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M12 3.75a3.75 3.75 0 0 0-3.75 3.75 7.5 7.5 0 0 0 3.75 6.75 7.5 7.5 0 0 0 3.75-6.75A3.75 3.75 0 0 0 12 3.75Z" />
                        </svg>
                    ),
                    label: lang === 'zh' ? '我的成就' : 'Achievements',
                    desc: lang === 'zh' ? `已获得 ${todayPoints} 积分` : `${todayPoints} points earned`,
                    action: onShowAchievements,
                    color: 'bg-yellow-50',
                    darkColor: 'dark:bg-yellow-900/30',
                },
            ],
        },
        {
            title: lang === 'zh' ? '社区互动' : 'Community',
            items: [
                {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                        </svg>
                    ),
                    label: lang === 'zh' ? '温暖社区' : 'Community',
                    desc: lang === 'zh' ? '与同伴互相鼓励支持' : 'Support each other',
                    action: () => onNavigate('community'),
                    color: 'bg-purple-50',
                    darkColor: 'dark:bg-purple-900/30',
                },
            ],
        },
        {
            title: lang === 'zh' ? '设置' : 'Settings',
            items: [
                {
                    icon: isDarkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                        </svg>
                    ),
                    label: lang === 'zh' ? '外观模式' : 'Appearance',
                    desc: isDarkMode
                        ? (lang === 'zh' ? '当前：深色模式' : 'Current: Dark')
                        : (lang === 'zh' ? '当前：浅色模式' : 'Current: Light'),
                    action: onToggleDarkMode,
                    color: 'bg-warm-50',
                    darkColor: 'dark:bg-gray-700',
                },
                {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-warm-500 dark:text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    ),
                    label: lang === 'zh' ? '更多设置' : 'More Settings',
                    desc: lang === 'zh' ? '提醒、语言、数据导出' : 'Reminders, language, export',
                    action: () => onNavigate('settings'),
                    color: 'bg-warm-50',
                    darkColor: 'dark:bg-gray-700',
                },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* 用户信息卡片 */}
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                        {(currentUser.nickname || currentUser.username || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">{currentUser.nickname || currentUser.username}</h3>
                        <p className="text-white/70 text-sm mt-0.5">@{currentUser.username}</p>
                    </div>
                </div>

                {/* 统计数据 */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/20">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{streak}</div>
                        <div className="text-white/60 text-xs mt-0.5">
                            {lang === 'zh' ? '连续打卡' : 'Streak'}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{todayPoints}</div>
                        <div className="text-white/60 text-xs mt-0.5">
                            {lang === 'zh' ? '总积分' : 'Points'}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{toolCompletions7d}</div>
                        <div className="text-white/60 text-xs mt-0.5">
                            {lang === 'zh' ? '本周练习' : 'This Week'}
                        </div>
                    </div>
                </div>
            </div>

            {/* 菜单分组 */}
            {menuSections.map((section) => (
                <div key={section.title}>
                    <h4 className="text-sm font-medium text-warm-400 dark:text-gray-500 mb-2 px-1">{section.title}</h4>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-warm-200/50 dark:border-gray-700/50 overflow-hidden divide-y divide-warm-100/50 dark:divide-gray-700/50">
                        {section.items.map((item) => (
                            <button
                                key={item.label}
                                onClick={item.action}
                                className="w-full flex items-center gap-4 p-4 hover:bg-warm-50/50 dark:hover:bg-gray-700/50 transition-colors active:bg-warm-100/50 dark:active:bg-gray-600/50"
                            >
                                <div className={`w-10 h-10 ${item.color} ${item.darkColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-warm-800 dark:text-gray-100">{item.label}</div>
                                    <div className="text-warm-400 dark:text-gray-500 text-xs mt-0.5">{item.desc}</div>
                                </div>
                                <svg className="w-4 h-4 text-warm-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* 退出登录 */}
            <button
                onClick={onLogout}
                className="w-full py-3 text-center text-red-500 dark:text-red-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-warm-200/50 dark:border-gray-700/50 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
                {lang === 'zh' ? '退出登录' : 'Logout'}
            </button>

            {/* 底部信息 */}
            <div className="text-center text-xs text-warm-400 dark:text-gray-500 pb-4 space-y-1">
                <p>NeuraSense - By MaRunqi</p>
                <p>{lang === 'zh' ? '本平台仅供参考，不能替代专业医疗诊断' : 'For reference only, not a substitute for professional diagnosis'}</p>
            </div>
        </div>
    );
}
