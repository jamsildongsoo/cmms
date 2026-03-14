import api from '@/utils/api';

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

export type TransactionType = 'IN' | 'OUT' | 'MOVE' | 'ADJUST' | 'MOVE_IN' | 'MOVE_OUT' | 'ADJUST_IN' | 'ADJUST_OUT';

export interface InventoryTransaction {
    history_id: string;
    type: TransactionType;
    date: string;
    inventoryId: string;
    qty: number;
    amount?: number;
    refEntity?: string;
    refId?: string;
    name: string;
    spec?: string;
    unit?: string;
    storage?: string;
    user?: string;
    ref?: string;
    companyId?: string;
}

export interface TransactionItem {
    inventoryId: string;
    storageId: string;
    locationId?: string;
    binId?: string;
    // MOVE destination
    toStorageId?: string;
    toLocationId?: string;
    toBinId?: string;
    current_stock?: number;
    qty: number;
    amount?: number;
    ref?: string;
    name?: string;
    spec?: string;
    unit?: string;
    storage?: string;
}

export interface InventoryStockItem {
    inventoryId: string;
    name: string;
    spec?: string;
    unit?: string;
    codeItem?: string;
    storageId?: string;
    storageName?: string;
    binId?: string;
    binName?: string;
    locationId?: string;
    locationName?: string;
    qty: number;
    amount: number;
}

export const inventoryService = {
    getStock: async (): Promise<InventoryStockItem[]> => {
        const response = await api.get<InventoryStockItem[]>('/api/inv/stock');
        return response.data;
    },

    getAllMaterials: async (): Promise<Material[]> => {
        const response = await api.get<Material[]>('/api/master/inventory');
        return response.data;
    },

    getMaterialById: async (id: string): Promise<Material | undefined> => {
        const response = await api.get<Material>(`/api/master/inventory/${id}`);
        return response.data;
    },

    createMaterial: async (material: Material): Promise<Material> => {
        const response = await api.post<Material>('/api/master/inventory', material);
        return response.data;
    },

    updateMaterial: async (id: string, updates: Partial<Material>): Promise<Material> => {
        const existing = await inventoryService.getMaterialById(id);
        if (!existing) throw new Error("Material not found");
        const merged = { ...existing, ...updates };

        const response = await api.post<Material>('/api/master/inventory', merged);
        return response.data;
    },

    getAllTransactions: async (): Promise<InventoryTransaction[]> => {
        const response = await api.get<any[]>('/api/inv/history');
        const materials = await inventoryService.getAllMaterials();

        return response.data.map(item => {
            const material = materials.find(m => m.inventoryId === item.inventoryId);
            return {
                history_id: item.historyId,
                type: item.txType,
                date: item.createdAt ? item.createdAt.replace('T', ' ').substring(0, 16) : '-',
                inventoryId: item.inventoryId,
                qty: item.qty,
                amount: item.amount,
                refEntity: item.refEntity,
                refId: item.refId,
                name: material ? material.name : item.inventoryId,
                spec: material?.spec || '-',
                unit: material?.unit || 'EA',
                storage: item.storageId,
                user: item.createdBy || 'SYSTEM',
                ref: item.refId || '-',
                companyId: item.companyId,
            } as InventoryTransaction;
        });
    },

    processTransaction: async (type: TransactionType, items: TransactionItem[]): Promise<void> => {
        const payload = {
            type,
            refEntity: 'MANUAL',
            refId: items[0]?.ref || '',
            items: items.map(item => ({
                inventoryId: item.inventoryId,
                storageId: item.storageId || 'STR-001',
                locationId: item.locationId || '',
                binId: item.binId || '',
                toStorageId: item.toStorageId || '',
                toLocationId: item.toLocationId || '',
                toBinId: item.toBinId || '',
                qty: item.qty,
                amount: item.amount || 0
            }))
        };
        await api.post('/api/inv/transactions', payload);
    },

    deleteMaterial: async (id: string): Promise<void> => {
        await api.delete(`/api/master/inventory/${id}`);
    },

    downloadExcel: async (data: Material[]): Promise<void> => {
        const response = await api.post('/api/master/inventory/download', data, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'inventory_list.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
