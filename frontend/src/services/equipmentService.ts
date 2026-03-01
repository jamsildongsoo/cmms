import api from '@/utils/api';
import type { Equipment } from "@/types/equipment";



import { useAuthStore } from "@/features/auth/useAuthStore";

export const equipmentService = {
    getAll: async (): Promise<Equipment[]> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<Equipment[]>(`/api/master/equipment?companyId=${companyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch equipment", error);
            return [];
        }
    },

    getById: async (id: string): Promise<Equipment | undefined> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<Equipment>(`/api/master/equipment/${companyId}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch equipment", error);
            return undefined;
        }
    },

    create: async (equipment: Omit<Equipment, "equipmentId">): Promise<Equipment> => {
        const companyId = useAuthStore.getState().user?.companyId;
        const currentPlantId = useAuthStore.getState().currentPlantId;
        if (!companyId) throw new Error("User not authenticated");
        const payload = { ...equipment, companyId: companyId, plantId: equipment.plantId || currentPlantId || 'P0001' };
        const response = await api.post<Equipment>('/api/master/equipment', payload);
        return response.data;
    },

    update: async (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
        try {
            const existing = await equipmentService.getById(id);
            if (!existing) throw new Error("Equipment not found");
            const merged = { ...existing, ...updates };
            // Ensure ID is set if missing in updates
            if (!merged.equipmentId) merged.equipmentId = id;

            const response = await api.post<Equipment>('/api/master/equipment', merged);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");
        await api.delete(`/api/master/equipment/${companyId}/${id}`);
    }
};
