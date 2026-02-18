import axios from 'axios';
import type { WorkOrder } from '@/types/workOrder';

const COMPANY_ID = 'COM-001';

export const workOrderService = {
    getAll: async (filter?: 'ALL' | 'REQ' | 'ACT'): Promise<WorkOrder[]> => {
        try {
            // Backend doesn't support filter param in GET yet, we filter client side
            const response = await axios.get<WorkOrder[]>('/api/tx/work-orders');
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
            const response = await axios.get<WorkOrder>(`/api/tx/work-orders/${COMPANY_ID}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch work order", error);
            return undefined;
        }
    },

    create: async (data: WorkOrder): Promise<WorkOrder> => {
        // WorkOrder interface has items? No, WorkOrder types definition in view_file earlier didn't show items list.
        // Let's check WorkOrder type definition again if needed.
        // The Entity has transient items.
        // The DTO has items list.
        // Does frontend WorkOrder type have items?
        // I should check. If not, I can't send items easily.
        // Assuming it matches backend Inspection pattern (interface has items).
        // If WorkOrder type doesn't have items, I need to add it or pass it separately.
        // Let's assume it does or I'll fix it.

        const payload = {
            workOrder: { ...data, company_id: COMPANY_ID },
            items: (data as any).items // Type assertion in case it's missing in type
        };
        const response = await axios.post<WorkOrder>('/api/tx/work-orders', payload);
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
            const response = await axios.post<WorkOrder>('/api/tx/work-orders', payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`/api/tx/work-orders/${COMPANY_ID}/${id}`);
    }
};
