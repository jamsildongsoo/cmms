import api from '@/utils/api';
import type { WorkOrder } from '@/types/workOrder';
import { useAuthStore } from "@/features/auth/useAuthStore";

export const workOrderService = {
    getAll: async (filter?: 'ALL' | 'REQ' | 'ACT'): Promise<WorkOrder[]> => {
        const response = await api.get<WorkOrder[]>('/api/tx/work-orders');
        let data = response.data;

        if (filter && filter !== 'ALL') {
            if (filter === 'REQ') {
                data = data.filter(w => w.status === 'T' || w.status === 'REQ');
            } else {
                data = data.filter(w => w.status === 'A' || w.status === 'C');
            }
        }
        return data;
    },

    getById: async (id: string): Promise<WorkOrder | undefined> => {
        const response = await api.get<WorkOrder>(`/api/tx/work-orders/${id}`);
        return response.data;
    },

    create: async (data: WorkOrder): Promise<WorkOrder> => {
        const plantId = useAuthStore.getState().getPlantId();

        const sanitizedData = {
            ...data,
            cost: Number(data.cost) || 0,
            time: Number(data.time) || 0,
            req_date: (data as any).req_date || (data as any).date || new Date().toISOString().split('T')[0],
        };

        const payload = {
            workOrder: {
                ...sanitizedData,
                plantId: (data as any).plantId || plantId || 'P0001'
            },
            items: (data as any).items
        };
        const response = await api.post<WorkOrder>('/api/tx/work-orders', payload);
        return response.data;
    },

    update: async (id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> => {
        const existing = await workOrderService.getById(id);
        if (!existing) throw new Error("WorkOrder not found");

        const merged = { ...existing, ...updates };
        const sanitizedMerged = {
            ...merged,
            cost: Number(merged.cost) || 0,
            time: Number(merged.time) || 0,
            req_date: (merged as any).req_date || (merged as any).date || (existing as any).req_date,
        };

        const payload = {
            workOrder: sanitizedMerged,
            items: (merged as any).items
        };
        const response = await api.post<WorkOrder>('/api/tx/work-orders', payload);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/tx/work-orders/${id}`);
    }
};
