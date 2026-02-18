import axios from 'axios';
import type { Inspection } from '@/types/inspection';

const COMPANY_ID = 'COM-001';

export const inspectionService = {
    getAll: async (filter?: 'ALL' | 'PLN' | 'ACT'): Promise<Inspection[]> => {
        try {
            const response = await axios.get<Inspection[]>('/api/tx/inspections');
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
            const response = await axios.get<Inspection>(`/api/tx/inspections/${COMPANY_ID}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch inspection", error);
            return undefined;
        }
    },

    create: async (data: Inspection): Promise<Inspection> => {
        const payload = {
            inspection: { ...data, company_id: COMPANY_ID },
            items: data.items
        };
        const response = await axios.post<Inspection>('/api/tx/inspections', payload);
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
            const response = await axios.post<Inspection>('/api/tx/inspections', payload);
            return response.data;
        } catch (error) {
            console.error("Failed to update inspection", error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`/api/tx/inspections/${COMPANY_ID}/${id}`);
    }
};
