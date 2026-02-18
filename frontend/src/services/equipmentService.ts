import axios from 'axios';
import type { Equipment } from "@/types/equipment";

const COMPANY_ID = 'COM-001';

export const equipmentService = {
    getAll: async (): Promise<Equipment[]> => {
        try {
            const response = await axios.get<Equipment[]>('/api/master/equipment');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch equipment", error);
            return [];
        }
    },

    getById: async (id: string): Promise<Equipment | undefined> => {
        try {
            const response = await axios.get<Equipment>(`/api/master/equipment/${COMPANY_ID}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch equipment", error);
            return undefined;
        }
    },

    create: async (equipment: Omit<Equipment, "equipment_id">): Promise<Equipment> => {
        const payload = { ...equipment, company_id: COMPANY_ID };
        const response = await axios.post<Equipment>('/api/master/equipment', payload);
        return response.data;
    },

    update: async (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
        try {
            const existing = await equipmentService.getById(id);
            if (!existing) throw new Error("Equipment not found");
            const merged = { ...existing, ...updates };
            // Ensure ID is set if missing in updates
            if (!merged.equipment_id) merged.equipment_id = id;

            const response = await axios.post<Equipment>('/api/master/equipment', merged);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`/api/master/equipment/${COMPANY_ID}/${id}`);
    }
};
