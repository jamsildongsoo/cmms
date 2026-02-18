import axios from 'axios';

const COMPANY_ID = 'COM-001';

export interface Material {
    company_id?: string;
    inventory_id: string;
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
    status?: string;
    delete_mark?: string;
}

export type TransactionType = 'IN' | 'OUT' | 'MOVE' | 'ADJUST';

export interface InventoryTransaction {
    history_id: string; // Backend: history_id
    tx_type: TransactionType;
    tx_date: string;
    inventory_id: string;
    // extended fields for UI if joined, but backend returns History entity which has IDs.
    // UI might need join with Material to show name.
    // For now, let's match backend response.
    qty: number;
    amount?: number;
    ref_entity?: string;
    ref_id?: string;

    // UI convenience fields (might be missing in raw response unless joined)
    name?: string;
    spec?: string;
    unit?: string;
    storage_id?: string;
    company_id?: string;
}

export interface TransactionItem {
    inventory_id: string;
    storage_id: string; // items need storage
    current_stock?: number;
    qty: number;
    unit_price?: number;
    ref?: string;
}

export const inventoryService = {
    getAllMaterials: async (): Promise<Material[]> => {
        try {
            const response = await axios.get<Material[]>('/api/master/inventory');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch materials", error);
            return [];
        }
    },

    getMaterialById: async (id: string): Promise<Material | undefined> => {
        try {
            const response = await axios.get<Material>(`/api/master/inventory/${COMPANY_ID}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch material", error);
            return undefined;
        }
    },

    createMaterial: async (material: Material): Promise<Material> => {
        const payload = { ...material, company_id: COMPANY_ID };
        const response = await axios.post<Material>('/api/master/inventory', payload);
        return response.data;
    },

    updateMaterial: async (id: string, updates: Partial<Material>): Promise<Material> => {
        try {
            const existing = await inventoryService.getMaterialById(id);
            if (!existing) throw new Error("Material not found");
            const merged = { ...existing, ...updates };
            const response = await axios.post<Material>('/api/master/inventory', merged);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Transaction Support
    getAllTransactions: async (): Promise<InventoryTransaction[]> => {
        try {
            const response = await axios.get<InventoryTransaction[]>('/api/inv/history');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            return [];
        }
    },

    processTransaction: async (type: TransactionType, items: TransactionItem[]): Promise<void> => {
        const payload = {
            company_id: COMPANY_ID,
            type: type,
            date: new Date().toISOString(),
            ref_entity: 'MANUAL', // Default or pass in?
            ref_id: items[0]?.ref || '',
            user: 'CurrentUser', // Should come from Auth
            items: items.map(item => ({
                inventory_id: item.inventory_id,
                storage_id: item.storage_id || 'STR-001', // Default storage if missing? UI should provide.
                qty: item.qty,
                unit_price: item.unit_price || 0
            }))
        };
        await axios.post('/api/inv/transactions', payload);
    },

    createTransaction: async (): Promise<InventoryTransaction> => {
        return Promise.resolve({} as InventoryTransaction);
    }
};
