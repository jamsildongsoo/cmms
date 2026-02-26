import axios from 'axios';
import api from '@/utils/api';
import { useAuthStore } from "@/features/auth/useAuthStore";

export interface Material {
    company_id: string;
    inventory_id?: string;
    name: string;
    code_item?: string;
    dept_id?: string;
    unit?: string;
    maker_name?: string;
    spec?: string;
    model?: string;
    serial?: string;
    note?: string;
    file_group_id?: string;
    status: 'T' | 'C' | 'D';
    delete_mark: 'Y' | 'N';
    use_yn?: 'Y' | 'N';
}

export type TransactionType = 'IN' | 'OUT' | 'MOVE' | 'ADJUST';

export interface InventoryTransaction {
    history_id: string; // Backend: history_id
    type: TransactionType; // Renamed from tx_type to match usage
    date: string; // Renamed from tx_date
    inventory_id: string;
    qty: number;
    amount?: number;
    ref_entity?: string;
    ref_id?: string;

    // UI convenience fields
    name: string; // Made required to fix usage
    spec?: string;
    unit?: string;
    storage?: string; // storage name
    user?: string; // user name
    ref?: string; // reference string
    company_id?: string;
}

export interface TransactionItem {
    inventory_id: string;
    storage_id: string; // items need storage
    current_stock?: number;
    qty: number;
    unit_price?: number;
    ref?: string;
    name?: string; // Added for UI display
    spec?: string; // Added for UI display
    unit?: string; // Added for UI display
    storage?: string; // Added for UI display
}

export const inventoryService = {
    getAllMaterials: async (): Promise<Material[]> => {
        try {
            const companyId = useAuthStore.getState().user?.company_id;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<Material[]>(`/api/master/inventory?companyId=${companyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch materials", error);
            return [];
        }
    },

    getMaterialById: async (id: string): Promise<Material | undefined> => {
        try {
            const companyId = useAuthStore.getState().user?.company_id;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<Material>(`/api/master/inventory/${companyId}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch material", error);
            return undefined;
        }
    },

    createMaterial: async (material: Material): Promise<Material> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        const payload = { ...material, company_id: companyId };
        const response = await api.post<Material>('/api/master/inventory', payload);
        return response.data;
    },

    updateMaterial: async (id: string, updates: Partial<Material>): Promise<Material> => {
        try {
            const existing = await inventoryService.getMaterialById(id);
            if (!existing) throw new Error("Material not found");
            const merged = { ...existing, ...updates };
            // Ensure company_id is present
            if (!merged.company_id) merged.company_id = useAuthStore.getState().user?.company_id ?? '';
            if (!merged.company_id) throw new Error("User not authenticated");

            const response = await api.post<Material>('/api/master/inventory', merged);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Transaction Support
    getAllTransactions: async (): Promise<InventoryTransaction[]> => {
        try {
            const companyId = useAuthStore.getState().user?.company_id;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<InventoryTransaction[]>(`/api/inv/history?companyId=${companyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            return [];
        }
    },

    processTransaction: async (type: TransactionType, items: TransactionItem[]): Promise<void> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        const userId = useAuthStore.getState().user?.person_id || 'SYSTEM';

        const payload = {
            company_id: companyId,
            type: type,
            date: new Date().toISOString(),
            ref_entity: 'MANUAL',
            ref_id: items[0]?.ref || '',
            user: userId,
            items: items.map(item => ({
                inventory_id: item.inventory_id,
                storage_id: item.storage_id || 'STR-001',
                qty: item.qty,
                unit_price: item.unit_price || 0
            }))
        };
        await axios.post('/api/inv/transactions', payload);
    },

    createTransaction: async (): Promise<InventoryTransaction> => {
        return Promise.resolve({} as InventoryTransaction);
    },

    deleteMaterial: async (id: string): Promise<void> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        await api.delete(`/api/master/inventory/${companyId}/${id}`);
    }
};
