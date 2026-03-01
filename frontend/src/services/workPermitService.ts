import api from '@/utils/api';
import type { WorkPermit } from '@/types/workPermit';
import { useAuthStore } from "@/features/auth/useAuthStore";

export const workPermitService = {
    getAll: async (filter?: 'ALL' | 'REQ' | 'APR'): Promise<WorkPermit[]> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<WorkPermit[]>(`/api/tx/work-permits?companyId=${companyId}`);
            let data = response.data;
            if (filter && filter !== 'ALL') {
                // REQ = Request (T), APR = Approved (A, C)
                if (filter === 'REQ') {
                    data = data.filter(w => w.status === 'T');
                } else {
                    data = data.filter(w => w.status === 'A' || w.status === 'C');
                }
            }
            return data;
        } catch (error) {
            console.error("Failed to fetch work permits", error);
            return [];
        }
    },

    getById: async (id: string): Promise<WorkPermit | undefined> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<WorkPermit>(`/api/tx/work-permits/${companyId}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch work permit", error);
            return undefined;
        }
    },

    create: async (data: Omit<WorkPermit, "permitId">): Promise<WorkPermit> => {
        const companyId = useAuthStore.getState().user?.companyId;
        const currentPlantId = useAuthStore.getState().currentPlantId;
        if (!companyId) throw new Error("User not authenticated");
        const payload = {
            work_permit: { ...data, companyId: companyId, plantId: (data as any).plantId || currentPlantId || 'P0001' },
            items: (data as any).items
        };
        const response = await api.post<WorkPermit>('/api/tx/work-permits', payload);
        return response.data;
    },

    update: async (id: string, updates: Partial<WorkPermit>): Promise<WorkPermit> => {
        try {
            const existing = await workPermitService.getById(id);
            if (!existing) throw new Error("WorkPermit not found");

            const merged = { ...existing, ...updates };
            const payload = {
                work_permit: merged,
                items: (merged as any).items
            };
            const response = await api.post<WorkPermit>('/api/tx/work-permits', payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");
        await api.delete(`/api/tx/work-permits/${companyId}/${id}`);
    }
};
