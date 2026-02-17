/**
 * Checkin Store — 每日签到状态管理
 *
 * 缓存今日签到数据、7天历史、推荐结果
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE } from '../config/api';

export interface CheckinData {
    id?: string;
    mood: number;
    stress: number;
    energy: number;
    sleep_quality: number;
    note?: string;
    created_at?: string;
}

export interface Recommendation {
    id: string;
    reason: string;
}

interface CheckinState {
    /** 今日是否已签到 */
    hasCheckedIn: boolean;
    /** 今日签到数据 */
    todayCheckin: CheckinData | null;
    /** 近7天历史 */
    history: CheckinData[];
    /** 今日推荐工具 */
    recommendations: Recommendation[];
    /** 加载状态 */
    isLoading: boolean;

    /** 提交签到 */
    submitCheckin: (data: CheckinData) => Promise<boolean>;
    /** 加载历史 */
    loadHistory: (range?: string) => Promise<void>;
    /** 加载推荐 */
    loadRecommendations: () => Promise<void>;
    /** 重置（登出时） */
    reset: () => void;
}

function getToken(): string | null {
    return localStorage.getItem('token');
}

export const useCheckinStore = create<CheckinState>()(
    persist(
        (set, get) => ({
            hasCheckedIn: false,
            todayCheckin: null,
            history: [],
            recommendations: [],
            isLoading: false,

            submitCheckin: async (data) => {
                const token = getToken();
                if (!token) return false;
                try {
                    const res = await fetch(`${API_BASE}/checkins?token=${token}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });
                    if (!res.ok) return false;
                    const json = await res.json();
                    if (json.success) {
                        set({
                            hasCheckedIn: true,
                            todayCheckin: json.record,
                        });
                        // 签到后自动刷新推荐和历史
                        get().loadRecommendations();
                        get().loadHistory();
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            },

            loadHistory: async (range = '7d') => {
                const token = getToken();
                if (!token) return;
                set({ isLoading: true });
                try {
                    const res = await fetch(`${API_BASE}/checkins?token=${token}&range=${range}`);
                    if (!res.ok) return;
                    const json = await res.json();
                    if (json.success) {
                        const checkins: CheckinData[] = json.checkins || [];
                        // 检查今天是否已签到
                        const todayStr = new Date().toISOString().slice(0, 10);
                        const todayRecord = checkins.find(
                            (c) => c.created_at && c.created_at.slice(0, 10) === todayStr
                        );
                        set({
                            history: checkins,
                            hasCheckedIn: !!todayRecord,
                            todayCheckin: todayRecord || null,
                        });
                    }
                } catch { /* offline ok */ } finally {
                    set({ isLoading: false });
                }
            },

            loadRecommendations: async () => {
                const token = getToken();
                if (!token) return;
                try {
                    const res = await fetch(`${API_BASE}/recommendations/today?token=${token}`);
                    if (!res.ok) return;
                    const json = await res.json();
                    if (json.success) {
                        set({
                            recommendations: json.recommendations || [],
                            hasCheckedIn: json.has_checkin ?? get().hasCheckedIn,
                            todayCheckin: json.checkin || get().todayCheckin,
                        });
                    }
                } catch { /* offline ok */ }
            },

            reset: () =>
                set({
                    hasCheckedIn: false,
                    todayCheckin: null,
                    history: [],
                    recommendations: [],
                }),
        }),
        {
            name: 'psy-checkin',
            partialize: (state) => ({
                hasCheckedIn: state.hasCheckedIn,
                todayCheckin: state.todayCheckin,
            }),
        }
    )
);
