import api from '@/utils/api';
import type { Equipment } from "@/types/equipment";
import { useAuthStore } from "@/features/auth/useAuthStore";

export const equipmentService = {
    getAll: async (): Promise<Equipment[]> => {
        const response = await api.get<Equipment[]>('/api/master/equipment');
        return response.data;
    },

    getById: async (id: string): Promise<Equipment | undefined> => {
        const response = await api.get<Equipment>(`/api/master/equipment/${id}`);
        return response.data;
    },

    create: async (equipment: Omit<Equipment, "equipmentId">): Promise<Equipment> => {
        const plantId = useAuthStore.getState().getPlantId();
        const payload = { ...equipment, plantId: equipment.plantId || plantId || 'P0001' };
        const response = await api.post<Equipment>('/api/master/equipment', payload);
        return response.data;
    },

    update: async (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
        const existing = await equipmentService.getById(id);
        if (!existing) throw new Error("Equipment not found");
        const merged = { ...existing, ...updates };
        if (!merged.equipmentId) merged.equipmentId = id;

        const response = await api.post<Equipment>('/api/master/equipment', merged);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/master/equipment/${id}`);
    },

    downloadExcel: async (data: Equipment[]): Promise<void> => {
        const response = await api.post('/api/master/equipment/download', data, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'equipment_list.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
