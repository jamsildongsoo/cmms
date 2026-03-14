import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { type Person, standardService } from '@/services/standardService';

interface AuthState {
    user: Person | null;
    token: string | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    currentPlantId: string | null;
    setPlantId: (plantId: string) => void;
    login: (companyId: string, id: string, password: string) => Promise<any>;
    refreshToken: () => Promise<any>;
    logout: () => void;
    initAuth: () => Promise<void>;
    getCompanyId: () => string;
    getPlantId: () => string;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isInitialized: false,
            currentPlantId: null,
            getCompanyId: () => get().user?.companyId || '',
            getPlantId: () => get().currentPlantId || '',

            // App 시작 시 호출: refresh token으로 access token 재발급
            initAuth: async () => {
                const state = get();
                // persist에서 user 정보가 복원된 경우에만 refresh 시도
                if (state.user && !state.token) {
                    try {
                        await get().refreshToken();
                    } catch {
                        // refresh 실패 → 로그아웃 상태로 전환
                        set({ user: null, token: null, isAuthenticated: false, currentPlantId: null });
                    }
                }
                set({ isInitialized: true });
            },

            setPlantId: async (plantId: string) => {
                set({ currentPlantId: plantId });
                const state = get();
                if (state.user && state.token) {
                    try {
                        await axios.put(`/api/auth/plant?plantId=${plantId}`, null, {
                            headers: { Authorization: `Bearer ${state.token}` }
                        });
                    } catch (e) {
                        console.error('Failed to update plant in DB', e);
                    }
                }
            },
            login: async (companyId: string, id: string, password: string) => {
                try {
                    const response = await axios.post('/api/auth/login', {
                        companyId: companyId,
                        personId: id,
                        password: password
                    }, { withCredentials: true });

                    const { token, user, previousLoginAt, previousLoginIp } = response.data;
                    set({ user, token, isAuthenticated: true, isInitialized: true });

                    // Fetch plants to set default
                    try {
                        const plants = await standardService.getAll('plant');
                        let defaultPlant = user.lastLoginPlantId
                            ? plants.find((p: any) => p.plantId === user.lastLoginPlantId && p.companyId === user.companyId)
                            : null;

                        if (!defaultPlant) {
                            defaultPlant = plants.find((p: any) => p.companyId === user.companyId);
                        }

                        if (defaultPlant) {
                            set({ currentPlantId: defaultPlant.plantId });
                        }
                    } catch (e) {
                        console.error("Failed to fetch default plant", e);
                    }
                    return { user, previousLoginAt, previousLoginIp };
                } catch (error) {
                    throw new Error('Invalid credentials');
                }
            },
            refreshToken: async () => {
                try {
                    const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                    const { token, user } = response.data;
                    set({ token, user, isAuthenticated: true });
                    return { token, user };
                } catch (error) {
                    get().logout();
                    throw error;
                }
            },
            logout: async () => {
                try {
                    await axios.post('/api/auth/logout', {}, { withCredentials: true });
                } catch (e) {
                    console.warn("Logout request failed", e);
                } finally {
                    set({ user: null, token: null, isAuthenticated: false, currentPlantId: null });
                    localStorage.removeItem('auth-storage');
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            // token은 localStorage에 저장하지 않음 (메모리 전용)
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                currentPlantId: state.currentPlantId,
            }),
        }
    )
);
