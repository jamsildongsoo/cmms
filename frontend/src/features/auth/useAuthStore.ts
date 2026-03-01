import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { type Person, standardService } from '@/services/standardService';

interface AuthState {
    user: Person | null;
    token: string | null;
    isAuthenticated: boolean;
    currentPlantId: string | null;
    setPlantId: (plantId: string) => void;
    login: (companyId: string, id: string, password: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            currentPlantId: null,
            setPlantId: (plantId: string) => set({ currentPlantId: plantId }),
            login: async (companyId: string, id: string, password: string) => {
                try {
                    const response = await axios.post('/api/auth/login', {
                        companyId: companyId,
                        personId: id,
                        password: password
                    });

                    // Backend now returns { token: "...", user: { ... } }
                    const { token, user } = response.data;

                    set({ user, token, isAuthenticated: true });

                    // Fetch plants to set default
                    try {
                        const plants = await standardService.getAll('plant');
                        const defaultPlant = plants.find(p => p.companyId === user.companyId);
                        if (defaultPlant) {
                            set({ currentPlantId: defaultPlant.id });
                        }
                    } catch (e) {
                        console.error("Failed to fetch default plant", e);
                    }
                } catch (error) {
                    throw new Error('Invalid credentials');
                }
            },
            logout: () => set({ user: null, token: null, isAuthenticated: false, currentPlantId: null }),
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
