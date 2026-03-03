import api from '@/utils/api';
import { useAuthStore } from "@/features/auth/useAuthStore";

export interface Material {
    companyId: string;
    inventoryId?: string;
    name: string;
    codeItem?: string;
    deptId?: string;
    unit?: string;
    makerName?: string;
    spec?: string;
    model?: string;
    serial?: string;
    note?: string;
    fileGroupId?: string;
    status: 'T' | 'C' | 'D';
    deleteMark?: 'Y' | 'N';
}

export type TransactionType = 'IN' | 'OUT' | 'MOVE' | 'ADJUST';

export interface InventoryTransaction {
    history_id: string; // Backend: history_id
    type: TransactionType; // Renamed from tx_type to match usage
    date: string; // Renamed from tx_date
    inventoryId: string;
    qty: number;
    amount?: number;
    refEntity?: string;
    refId?: string;

    // UI convenience fields
    name: string; // Made required to fix usage
    spec?: string;
    unit?: string;
    storage?: string; // storage name
    user?: string; // user name
    ref?: string; // reference string
    companyId?: string;
}

export interface TransactionItem {
    inventoryId: string;
    storageId: string; // items need storage
    current_stock?: number;
    qty: number;
    unitPrice?: number;
    ref?: string;
    name?: string; // Added for UI display
    spec?: string; // Added for UI display
    unit?: string; // Added for UI display
    storage?: string; // Added for UI display
}

export const inventoryService = {
    getAllMaterials: async (): Promise<Material[]> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
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
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<Material>(`/api/master/inventory/${companyId}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch material", error);
            return undefined;
        }
    },

    createMaterial: async (material: Material): Promise<Material> => {
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");
        const payload = { ...material, companyId: companyId };
        const response = await api.post<Material>('/api/master/inventory', payload);
        return response.data;
    },

    updateMaterial: async (id: string, updates: Partial<Material>): Promise<Material> => {
        try {
            const existing = await inventoryService.getMaterialById(id);
            if (!existing) throw new Error("Material not found");
            const merged = { ...existing, ...updates };
            // Ensure companyId is present
            if (!merged.companyId) merged.companyId = useAuthStore.getState().user?.companyId ?? '';
            if (!merged.companyId) throw new Error("User not authenticated");

            const response = await api.post<Material>('/api/master/inventory', merged);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Transaction Support
    getAllTransactions: async (): Promise<InventoryTransaction[]> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) throw new Error("User not authenticated");
            const response = await api.get<InventoryTransaction[]>(`/api/inv/history?companyId=${companyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            return [];
        }
    },

    processTransaction: async (type: TransactionType, items: TransactionItem[]): Promise<void> => {
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");
        const userId = useAuthStore.getState().user?.personId || 'SYSTEM';

        const payload = {
            companyId: companyId,
            type: type,
            date: new Date().toISOString(),
            refEntity: 'MANUAL',
            refId: items[0]?.ref || '',
            user: userId,
            items: items.map(item => ({
                inventoryId: item.inventoryId,
                storageId: item.storageId || 'STR-001',
                qty: item.qty,
                unitPrice: item.unitPrice || 0
            }))
        };
        await api.post('/api/inv/transactions', payload);
    },

    createTransaction: async (): Promise<InventoryTransaction> => {
        return Promise.resolve({} as InventoryTransaction);
    },

    deleteMaterial: async (id: string): Promise<void> => {
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");
        await api.delete(`/api/master/inventory/${companyId}/${id}`);
    }
};
