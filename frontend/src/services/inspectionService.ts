import api from '@/utils/api';
import type { Inspection } from '@/types/inspection';
import { useAuthStore } from "@/features/auth/useAuthStore";

export const inspectionService = {
    getAll: async (filter?: 'ALL' | 'PLN' | 'ACT'): Promise<Inspection[]> => {
        try {
            const companyId = useAuthStore.getState().user?.company_id;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<Inspection[]>(`/api/tx/inspections?companyId=${companyId}`);
            let data = response.data;
            if (filter && filter !== 'ALL') {
                data = data.filter(i => i.stage === filter);
            }
            return data;
        } catch (error) {
            console.error("Failed to fetch inspections", error);
            return [];
        }
    },

    getById: async (id: string): Promise<Inspection | undefined> => {
        try {
            const companyId = useAuthStore.getState().user?.company_id;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<Inspection>(`/api/tx/inspections/${companyId}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch inspection", error);
            return undefined;
        }
    },

    create: async (data: Inspection): Promise<Inspection> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        const payload = {
            inspection: { ...data, company_id: companyId },
            items: data.items
        };
        const response = await api.post<Inspection>('/api/tx/inspections', payload);
        return response.data;
    },

    update: async (id: string, updates: Partial<Inspection>): Promise<Inspection> => {
        try {
            const existing = await inspectionService.getById(id);
            if (!existing) throw new Error("Inspection not found");

            const merged = { ...existing, ...updates };
            // Ensure items are included
            if (!updates.items && existing.items) {
                merged.items = existing.items;
            }

            const payload = {
                inspection: merged,
                items: merged.items
            };
            const response = await api.post<Inspection>('/api/tx/inspections', payload);
            return response.data;
        } catch (error) {
            console.error("Failed to update inspection", error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        await api.delete(`/api/tx/inspections/${companyId}/${id}`);
    }
};
