import api from '@/utils/api';
import type { WorkOrder } from '@/types/workOrder';
import { useAuthStore } from "@/features/auth/useAuthStore";

export const workOrderService = {
    getAll: async (filter?: 'ALL' | 'REQ' | 'ACT'): Promise<WorkOrder[]> => {
        try {
            const companyId = useAuthStore.getState().user?.company_id;
            if (!companyId) throw new Error("User not authenticated");
            // Backend doesn't support filter param in GET yet, we filter client side
            const response = await api.get<WorkOrder[]>(`/api/tx/work-orders?companyId=${companyId}`);
            let data = response.data;

            if (filter && filter !== 'ALL') {
                // REQ = Requested (Status T?), ACT = Action (Status A, C?)
                // Logic from previous mock:
                // REQ = status T (Temp/Requested)
                // ACT = status A (Assigned) or C (Completed)
                if (filter === 'REQ') {
                    data = data.filter(w => w.status === 'T' || w.status === 'REQ');
                } else {
                    data = data.filter(w => w.status === 'A' || w.status === 'C');
                }
            }
            return data;
        } catch (error) {
            console.error("Failed to fetch work orders", error);
            return [];
        }
    },

    getById: async (id: string): Promise<WorkOrder | undefined> => {
        try {
            const companyId = useAuthStore.getState().user?.company_id;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<WorkOrder>(`/api/tx/work-orders/${companyId}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch work order", error);
            return undefined;
        }
    },

    create: async (data: WorkOrder): Promise<WorkOrder> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        const payload = {
            workOrder: { ...data, company_id: companyId },
            items: (data as any).items // Type assertion in case it's missing in type
        };
        const response = await api.post<WorkOrder>('/api/tx/work-orders', payload);
        return response.data;
    },

    update: async (id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> => {
        try {
            const existing = await workOrderService.getById(id);
            if (!existing) throw new Error("WorkOrder not found");

            const merged = { ...existing, ...updates };
            const payload = {
                workOrder: merged,
                items: (merged as any).items
            };
            const response = await api.post<WorkOrder>('/api/tx/work-orders', payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        await api.delete(`/api/tx/work-orders/${companyId}/${id}`);
    }
};
