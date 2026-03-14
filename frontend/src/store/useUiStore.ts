import { create } from 'zustand';

interface UiState {
    isLoading: boolean;
    loadingCount: number; // To handle concurrent requests
    setLoading: (loading: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
    isLoading: false,
    loadingCount: 0,
    setLoading: (loading: boolean) => set((state) => {
        const newCount = loading ? state.loadingCount + 1 : Math.max(0, state.loadingCount - 1);
        return {
            loadingCount: newCount,
            isLoading: newCount > 0
        };
    }),
}));
