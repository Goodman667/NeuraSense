/**
 * Gamification Store
 * 
 * Global state for points, streaks, badges, and daily tasks
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    requirement: string;
}

export interface DailyTask {
    id: string;
    name: string;
    description: string;
    points: number;
    completed: boolean;
    icon: string;
}

interface GamificationState {
    // Points & Streak
    totalPoints: number;
    todayPoints: number;
    streak: number;
    lastActiveDate: string | null;

    // Badges
    badges: Badge[];
    unlockedBadges: string[];

    // Daily Tasks
    dailyTasks: DailyTask[];

    // Actions
    addPoints: (amount: number) => void;
    completeTask: (taskId: string) => void;
    checkStreak: () => void;
    unlockBadge: (badgeId: string) => void;
    resetDailyTasks: () => void;
}

// Available badges
const ALL_BADGES: Badge[] = [
    { id: 'first_login', name: '初次相遇', description: '完成首次登录', icon: '👋', requirement: '首次登录' },
    { id: 'mood_explorer', name: '情绪探索者', description: '记录第一篇心情日记', icon: '📝', requirement: '记录1篇日记' },
    { id: 'streak_3', name: '坚持三天', description: '连续3天活跃', icon: '🔥', requirement: '3天连击' },
    { id: 'streak_7', name: '一周坚持', description: '连续7天活跃', icon: '⭐', requirement: '7天连击' },
    { id: 'streak_30', name: '月度冠军', description: '连续30天活跃', icon: '🏆', requirement: '30天连击' },
    { id: 'breathing_master', name: '呼吸守护者', description: '完成10次呼吸练习', icon: '🧘', requirement: '10次呼吸' },
    { id: 'assessment_pro', name: '评估达人', description: '完成5次心理量表', icon: '📊', requirement: '5次量表' },
    { id: 'gratitude_guru', name: '感恩大师', description: '记录30条感恩事项', icon: '🙏', requirement: '30条感恩' },
    { id: 'night_owl', name: '夜间守护', description: '晚间完成放松练习', icon: '🌙', requirement: '夜间放松' },
    { id: 'community_star', name: '社区之星', description: '分享正能量获得10个赞', icon: '💫', requirement: '10个赞' },
];

// Default daily tasks
const getDefaultDailyTasks = (): DailyTask[] => [
    { id: 'mood_checkin', name: '心情打卡', description: '记录今日心情', points: 5, completed: false, icon: '😊' },
    { id: 'gratitude', name: '感恩记录', description: '写下3件感恩的事', points: 5, completed: false, icon: '🙏' },
    { id: 'breathing', name: '呼吸练习', description: '完成一次呼吸干预', points: 10, completed: false, icon: '🧘' },
    { id: 'journal', name: '日记撰写', description: '写一篇心情日记', points: 10, completed: false, icon: '📝' },
];

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            totalPoints: 0,
            todayPoints: 0,
            streak: 0,
            lastActiveDate: null,
            badges: ALL_BADGES,
            unlockedBadges: [],
            dailyTasks: getDefaultDailyTasks(),

            addPoints: (amount) => {
                const today = getTodayString();
                set(state => {
                    const newTotal = state.totalPoints + amount;
                    const newToday = state.todayPoints + amount;

                    // Check for badge unlocks based on points
                    const newUnlocked = [...state.unlockedBadges];

                    return {
                        totalPoints: newTotal,
                        todayPoints: newToday,
                        lastActiveDate: today,
                        unlockedBadges: newUnlocked,
                    };
                });

                // Check streak
                get().checkStreak();
            },

            completeTask: (taskId) => {
                set(state => {
                    const tasks = state.dailyTasks.map(task => {
                        if (task.id === taskId && !task.completed) {
                            return { ...task, completed: true };
                        }
                        return task;
                    });

                    const task = state.dailyTasks.find(t => t.id === taskId);
                    if (task && !task.completed) {
                        // Add points for completing task
                        setTimeout(() => get().addPoints(task.points), 0);
                    }

                    return { dailyTasks: tasks };
                });
            },

            checkStreak: () => {
                const today = getTodayString();
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                set(state => {
                    if (state.lastActiveDate === today) {
                        return {}; // Already active today
                    }

                    if (state.lastActiveDate === yesterday) {
                        // Continue streak
                        const newStreak = state.streak + 1;
                        const newUnlocked = [...state.unlockedBadges];

                        // Check streak badges
                        if (newStreak >= 3 && !newUnlocked.includes('streak_3')) {
                            newUnlocked.push('streak_3');
                        }
                        if (newStreak >= 7 && !newUnlocked.includes('streak_7')) {
                            newUnlocked.push('streak_7');
                        }
                        if (newStreak >= 30 && !newUnlocked.includes('streak_30')) {
                            newUnlocked.push('streak_30');
                        }

                        return {
                            streak: newStreak,
                            lastActiveDate: today,
                            unlockedBadges: newUnlocked,
                        };
                    }

                    // Streak broken
                    return {
                        streak: 1,
                        lastActiveDate: today,
                        todayPoints: 0,
                        dailyTasks: getDefaultDailyTasks(),
                    };
                });
            },

            unlockBadge: (badgeId) => {
                set(state => {
                    if (state.unlockedBadges.includes(badgeId)) return {};
                    return {
                        unlockedBadges: [...state.unlockedBadges, badgeId],
                    };
                });
            },

            resetDailyTasks: () => {
                set({
                    dailyTasks: getDefaultDailyTasks(),
                    todayPoints: 0,
                });
            },
        }),
        {
            name: 'psy-gamification',
        }
    )
);
