import api from '@/utils/api';
import type { Inspection } from '@/types/inspection';
import { useAuthStore } from "@/features/auth/useAuthStore";

export const inspectionService = {
    getAll: async (filter?: 'ALL' | 'PLN' | 'ACT'): Promise<Inspection[]> => {
        const response = await api.get<Inspection[]>('/api/tx/inspections');
        let data = response.data;
        if (filter && filter !== 'ALL') {
            data = data.filter(i => i.stage === filter);
        }
        return data;
    },

    getById: async (id: string): Promise<Inspection | undefined> => {
        const response = await api.get<Inspection>(`/api/tx/inspections/${id}`);
        return response.data;
    },

    create: async (data: Inspection): Promise<Inspection> => {
        const plantId = useAuthStore.getState().getPlantId();

        const sanitizedData = {
            ...data,
            plan_date: (data as any).plan_date || new Date().toISOString().split('T')[0]
        };

        const payload = {
            inspection: {
                ...sanitizedData,
                plantId: (data as any).plantId || plantId || 'P0001'
            },
            items: data.items
        };
        const response = await api.post<Inspection>('/api/tx/inspections', payload);
        return response.data;
    },

    update: async (id: string, updates: Partial<Inspection>): Promise<Inspection> => {
        const existing = await inspectionService.getById(id);
        if (!existing) throw new Error("Inspection not found");

        const merged = { ...existing, ...updates };
        const payload = {
            inspection: merged,
            items: merged.items
        };
        const response = await api.post<Inspection>('/api/tx/inspections', payload);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/tx/inspections/${id}`);
    }
};
