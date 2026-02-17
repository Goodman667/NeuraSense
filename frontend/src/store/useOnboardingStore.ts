/**
 * Onboarding Store
 *
 * 管理 onboarding wizard 状态 + 用户画像缓存
 * 使用 persist 中间件存到 localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE } from '../config/api';

export type Goal = 'stress' | 'sleep' | 'anxiety' | 'depression' | 'focus' | 'emotion';
export type Practice = 'breathing' | 'meditation' | 'cbt' | 'writing';
export type ReminderFreq = 'none' | 'daily' | 'twice' | 'hourly';

export interface UserProfile {
    onboarding_completed: boolean;
    goals: Goal[];
    reminder_freq: ReminderFreq;
    practices: Practice[];
    reminder_time: string;
    baseline_sleep: number | null;
    baseline_stress: number | null;
    baseline_mood: number | null;
    baseline_energy: number | null;
}

interface OnboardingState {
    // Wizard 进度
    step: number;               // 0-3 (4 步)
    profile: UserProfile;

    // 是否已完成 onboarding (持久化)
    hasCompletedOnboarding: boolean;

    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    setGoals: (goals: Goal[]) => void;
    setReminderFreq: (freq: ReminderFreq) => void;
    setPractices: (practices: Practice[]) => void;
    setReminderTime: (time: string) => void;
    setBaseline: (key: 'sleep' | 'stress' | 'mood' | 'energy', value: number) => void;

    completeOnboarding: () => void;
    resetOnboarding: () => void;

    // 与后端同步
    syncToServer: (token: string) => Promise<void>;
    loadFromServer: (token: string) => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
    onboarding_completed: false,
    goals: [],
    reminder_freq: 'daily',
    practices: [],
    reminder_time: '09:00',
    baseline_sleep: null,
    baseline_stress: null,
    baseline_mood: null,
    baseline_energy: null,
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            step: 0,
            profile: { ...DEFAULT_PROFILE },
            hasCompletedOnboarding: false,

            setStep: (step) => set({ step }),
            nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 3) })),
            prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

            setGoals: (goals) =>
                set((s) => ({ profile: { ...s.profile, goals } })),

            setReminderFreq: (freq) =>
                set((s) => ({ profile: { ...s.profile, reminder_freq: freq } })),

            setPractices: (practices) =>
                set((s) => ({ profile: { ...s.profile, practices } })),

            setReminderTime: (time) =>
                set((s) => ({ profile: { ...s.profile, reminder_time: time } })),

            setBaseline: (key, value) =>
                set((s) => ({
                    profile: { ...s.profile, [`baseline_${key}`]: value },
                })),

            completeOnboarding: () =>
                set((s) => ({
                    hasCompletedOnboarding: true,
                    profile: { ...s.profile, onboarding_completed: true },
                })),

            resetOnboarding: () =>
                set({
                    step: 0,
                    profile: { ...DEFAULT_PROFILE },
                    hasCompletedOnboarding: false,
                }),

            syncToServer: async (token: string) => {
                const { profile } = get();
                try {
                    await fetch(`${API_BASE}/profile?token=${token}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(profile),
                    });
                } catch (err) {
                    console.error('Failed to sync profile:', err);
                }
            },

            loadFromServer: async (token: string) => {
                try {
                    const res = await fetch(`${API_BASE}/profile?token=${token}`);
                    if (!res.ok) return;
                    const data = await res.json();
                    if (data.success && data.profile) {
                        const p = data.profile;
                        set({
                            hasCompletedOnboarding: !!p.onboarding_completed,
                            profile: {
                                onboarding_completed: !!p.onboarding_completed,
                                goals: p.goals || [],
                                reminder_freq: p.reminder_freq || 'daily',
                                practices: p.practices || [],
                                reminder_time: p.reminder_time || '09:00',
                                baseline_sleep: p.baseline_sleep ?? null,
                                baseline_stress: p.baseline_stress ?? null,
                                baseline_mood: p.baseline_mood ?? null,
                                baseline_energy: p.baseline_energy ?? null,
                            },
                        });
                    }
                } catch (err) {
                    console.error('Failed to load profile:', err);
                }
            },
        }),
        {
            name: 'psy-onboarding',
        }
    )
);
