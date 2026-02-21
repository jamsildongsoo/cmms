import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { type Person } from '@/services/standardService';

interface AuthState {
    user: Person | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (companyId: string, id: string, password: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: async (companyId: string, id: string, password: string) => {
                try {
                    const response = await axios.post('/api/auth/login', {
                        company_id: companyId,
                        person_id: id,
                        password: password
                    });

                    // Backend now returns { token: "...", user: { ... } }
                    const { token, user } = response.data;

                    set({ user, token, isAuthenticated: true });
                } catch (error) {
                    throw new Error('Invalid credentials');
                }
            },
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
