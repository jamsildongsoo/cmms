import axios from 'axios';
import type { WorkPermit } from '@/types/workPermit';

const COMPANY_ID = 'COM-001';

export const workPermitService = {
    getAll: async (filter?: 'ALL' | 'REQ' | 'APR'): Promise<WorkPermit[]> => {
        try {
            const response = await axios.get<WorkPermit[]>('/api/tx/work-permits');
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
            const response = await axios.get<WorkPermit>(`/api/tx/work-permits/${COMPANY_ID}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch work permit", error);
            return undefined;
        }
    },

    create: async (data: Omit<WorkPermit, "permit_id">): Promise<WorkPermit> => {
        // Data might not have permit_id, but backend generates it.
        // Frontend Type has items?
        // WorkPermit type doesn't explicitly have items in the view I saw earlier.
        // It has `checksheet_json` etc.
        // I'll cast to any for items to be safe if it's missing in type but present in object.

        const payload = {
            workPermit: { ...data, company_id: COMPANY_ID },
            items: (data as any).items
        };
        const response = await axios.post<WorkPermit>('/api/tx/work-permits', payload);
        return response.data;
    },

    update: async (id: string, updates: Partial<WorkPermit>): Promise<WorkPermit> => {
        try {
            const existing = await workPermitService.getById(id);
            if (!existing) throw new Error("WorkPermit not found");

            const merged = { ...existing, ...updates };
            const payload = {
                workPermit: merged,
                items: (merged as any).items
            };
            const response = await axios.post<WorkPermit>('/api/tx/work-permits', payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`/api/tx/work-permits/${COMPANY_ID}/${id}`);
    }
};
