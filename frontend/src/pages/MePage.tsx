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
    icon: string;
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
                    icon: '🔔',
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
                    icon: '📊',
                    label: lang === 'zh' ? '评估报告' : 'Assessments',
                    desc: lang === 'zh'
                        ? `已完成 ${assessmentsCount} 次评估`
                        : `${assessmentsCount} assessments completed`,
                    action: () => onNavigate('trend'),
                    color: 'bg-blue-50',
                    darkColor: 'dark:bg-blue-900/30',
                },
                {
                    icon: '📝',
                    label: lang === 'zh' ? '心情日记' : 'Mood Journal',
                    desc: lang === 'zh' ? '记录每天的心情和想法' : 'Daily thoughts & feelings',
                    action: () => onNavigate('journal'),
                    color: 'bg-amber-50',
                    darkColor: 'dark:bg-amber-900/30',
                },
                {
                    icon: '🏆',
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
                    icon: '💜',
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
                    icon: isDarkMode ? '☀️' : '🌙',
                    label: lang === 'zh' ? '外观模式' : 'Appearance',
                    desc: isDarkMode
                        ? (lang === 'zh' ? '当前：深色模式' : 'Current: Dark')
                        : (lang === 'zh' ? '当前：浅色模式' : 'Current: Light'),
                    action: onToggleDarkMode,
                    color: 'bg-warm-50',
                    darkColor: 'dark:bg-gray-700',
                },
                {
                    icon: '⚙️',
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
                                    <span className="text-xl">{item.icon}</span>
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
