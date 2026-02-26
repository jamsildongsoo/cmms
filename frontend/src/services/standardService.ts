
import api from '@/utils/api';

// 기준정보 (Company, Plant, Dept, User, Code) 인터페이스
export interface BaseStandard {
  id: string;
  name: string;
  delete_mark?: 'Y' | 'N';
  use_yn?: 'Y' | 'N';
}

export interface Company extends BaseStandard {
  bizno?: string;
  email?: string;
  phone?: string;
}

export interface Plant extends BaseStandard {
  company_id: string;
}

export interface Dept extends BaseStandard {
  company_id: string;
  parent_id?: string;
}

export interface Code extends BaseStandard {
  company_id?: string;
}

export interface Warehouse extends BaseStandard {
  company_id: string;
  plant_id: string; // Belongs to a plant
  location?: string;
}

export interface CodeItem {
  item_id: string; // The item code (e.g., 'PUMP')
  code_id: string; // The parent code group (e.g., 'EQUIP_TYPE')
  name: string;
  company_id?: string;
}

export interface Person extends BaseStandard {
  company_id: string;
  person_id: string; // Changed from id to match backend
  role_id?: string;
  dept_id?: string;
  email?: string;
  phone?: string;
  position?: string;
  title?: string;
  note?: string;
  password_hash?: string; // Added
  last_login_at?: string;
  last_login_ip?: string; // Added
}

// Standard entity type
export type StandardType = 'company' | 'plant' | 'dept' | 'person' | 'code' | 'warehouse';

import { useAuthStore } from "@/features/auth/useAuthStore";

export const standardService = {
  // List
  getAll: async (type: StandardType): Promise<any[]> => {
    const companyId = useAuthStore.getState().user?.company_id;
    if (!companyId) throw new Error("User not authenticated");
    const pathMap: Record<StandardType, string> = {
      company: 'v1/companies',
      plant: 'std/plants',
      dept: 'std/depts',
      person: 'std/persons',
      code: 'std/codes',
      warehouse: 'std/storages'
    };

    let url = `/api/${pathMap[type]}`;

    if (type !== 'company') {
      url += `?companyId=${companyId}`;
    }

    const response = await api.get(url);
    const data = response.data;

    // Map backend specific ID fields to universal 'id' field for frontend
    return data.map((item: any) => {
      let id = item.id;
      if (!id) {
        if (type === 'company') id = item.company_id;
        if (type === 'plant') id = item.plant_id;
        if (type === 'dept') id = item.dept_id;
        if (type === 'person') id = item.person_id;
        if (type === 'code') id = item.code_id;
        if (type === 'warehouse') id = item.storage_id;
      }
      return { ...item, id };
    });
  },

  // Get by ID
  getById: async (type: StandardType, id: string): Promise<any | undefined> => {
    const companyId = useAuthStore.getState().user?.company_id;
    if (!companyId) throw new Error("User not authenticated");
    const pathMap: Record<StandardType, string> = {
      company: 'v1/companies',
      plant: 'std/plants',
      dept: 'std/depts',
      person: 'std/persons',
      code: 'std/codes',
      warehouse: 'std/storages'
    };

    let url = `/api/${pathMap[type]}`;
    if (type === 'company') {
      url += `/${id}`;
    } else {
      url += `/${companyId}/${id}`;
    }

    try {
      const response = await api.get(url);
      const item = response.data;
      if (!item) return undefined;

      let id = item.id;
      if (!id) {
        if (type === 'company') id = item.company_id;
        if (type === 'plant') id = item.plant_id;
        if (type === 'dept') id = item.dept_id;
        if (type === 'person') id = item.person_id;
        if (type === 'code') id = item.code_id;
        if (type === 'warehouse') id = item.storage_id;
      }
      return { ...item, id };
    } catch (e) {
      return undefined;
    }
  },

  // Create
  create: async (type: StandardType, data: any): Promise<any> => {
    const companyId = useAuthStore.getState().user?.company_id;
    if (!companyId) throw new Error("User not authenticated");
    const pathMap: Record<StandardType, string> = {
      company: 'v1/companies',
      plant: 'std/plants',
      dept: 'std/depts',
      person: 'std/persons',
      code: 'std/codes',
      warehouse: 'std/storages'
    };

    // Inject company_id if not present
    if (type !== 'company' && !data.company_id) {
      data.company_id = companyId;
    }

    // Map frontend 'id' back to backend specific ID fields
    if (data.id) {
      if (type === 'company' && !data.company_id) data.company_id = data.id;
      if (type === 'plant' && !data.plant_id) data.plant_id = data.id;
      if (type === 'dept' && !data.dept_id) data.dept_id = data.id;
      if (type === 'person' && !data.person_id) data.person_id = data.id;
      if (type === 'code' && !data.code_id) data.code_id = data.id;
      if (type === 'warehouse' && !data.storage_id) data.storage_id = data.id;
    }

    const url = `/api/${pathMap[type]}`;
    const response = await api.post(url, data);
    return response.data;
  },

  // Update
  update: async (type: StandardType, _id: string, data: any): Promise<any> => {
    return standardService.create(type, data);
  },

  // Delete
  delete: async (type: StandardType, id: string): Promise<void> => {
    const companyId = useAuthStore.getState().user?.company_id;
    if (!companyId) throw new Error("User not authenticated");
    const pathMap: Record<StandardType, string> = {
      company: 'v1/companies',
      plant: 'std/plants',
      dept: 'std/depts',
      person: 'std/persons',
      code: 'std/codes',
      warehouse: 'std/storages'
    };

    let url = `/api/${pathMap[type]}`;
    if (type === 'company') {
      url += `/${id}`;
    } else {
      url += `/${companyId}/${id}`;
    }

    await api.delete(url);
  },

  // Legacy alias
  getStandardList: async (type: StandardType): Promise<any[]> => {
    return standardService.getAll(type);
  },

  // Code Item specific methods
  getCodeItems: async (groupId: string): Promise<CodeItem[]> => {
    const companyId = useAuthStore.getState().user?.company_id;
    if (!companyId) throw new Error("User not authenticated");
    const response = await api.get(`/api/std/codes/${companyId}/${groupId}/items`);
    return response.data;
  },

  getCodeItem: async (groupId: string, id: string): Promise<CodeItem | undefined> => {
    const companyId = useAuthStore.getState().user?.company_id;
    if (!companyId) throw new Error("User not authenticated");
    const response = await api.get(`/api/std/codes/${companyId}/${groupId}/items/${id}`);
    return response.data;
  },

  saveCodeItem: async (item: CodeItem): Promise<CodeItem> => {
    const companyId = useAuthStore.getState().user?.company_id;
    if (!companyId) throw new Error("User not authenticated");

    const response = await api.post(`/api/std/codes/${companyId}/${item.code_id}/items`, item);
    return response.data;
  },

  deleteCodeItem: async (groupId: string, id: string): Promise<void> => {
    const companyId = useAuthStore.getState().user?.company_id;
    if (!companyId) throw new Error("User not authenticated");
    await api.delete(`/api/std/codes/${companyId}/${groupId}/items/${id}`);
  },
};
