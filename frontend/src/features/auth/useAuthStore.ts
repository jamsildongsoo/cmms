import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { type Person } from '@/services/standardService';

interface AuthState {
    user: Person | null;
    isAuthenticated: boolean;
    login: (id: string, password: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: async (id: string, password: string) => {
                try {
                    // TODO: Get companyId from input or config
                    const response = await axios.post('/api/auth/login', {
                        company_id: 'COM-001',
                        person_id: id,
                        password: password
                    });
                    set({ user: response.data, isAuthenticated: true });
                } catch (error) {
                    throw new Error('Invalid credentials');
                }
            },
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
