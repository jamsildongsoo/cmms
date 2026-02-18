
import axios from 'axios';

// 기준정보 (Company, Plant, Dept, User, Code) 인터페이스
export interface BaseStandard {
  id: string;
  name: string;
  delete_mark?: 'Y' | 'N';
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
  id: string; // The item code (e.g., 'PUMP')
  group_id: string; // The parent code group (e.g., 'EQUIP_TYPE')
  name: string;
  is_active?: 'Y' | 'N';
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

export const standardService = {
  // List
  getAll: async (type: StandardType): Promise<any[]> => {
    const pathMap: Record<StandardType, string> = {
      company: 'v1/companies',
      plant: 'std/plants',
      dept: 'std/depts',
      person: 'std/persons',
      code: 'std/codes',
      warehouse: 'std/storages'
    };

    let url = `/api/${pathMap[type]}`;
    const companyId = 'COM-001';

    if (type !== 'company') {
      url += `?companyId=${companyId}`;
    }

    const response = await axios.get(url);
    return response.data;
  },

  // Get by ID
  getById: async (type: StandardType, id: string): Promise<any | undefined> => {
    const companyId = 'COM-001';
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
      const response = await axios.get(url);
      return response.data;
    } catch (e) {
      return undefined;
    }
  },

  // Create
  create: async (type: StandardType, data: any): Promise<any> => {
    const pathMap: Record<StandardType, string> = {
      company: 'v1/companies',
      plant: 'std/plants',
      dept: 'std/depts',
      person: 'std/persons',
      code: 'std/codes',
      warehouse: 'std/storages'
    };
    const url = `/api/${pathMap[type]}`;
    const response = await axios.post(url, data);
    return response.data;
  },

  // Update
  update: async (type: StandardType, id: string, data: any): Promise<any> => {
    // Currently relying on create (save) for updates as backend typically handles upsert
    return standardService.create(type, data);
  },

  // Delete
  delete: async (type: StandardType, id: string): Promise<void> => {
    const companyId = 'COM-001';
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

    await axios.delete(url);
  },

  // Legacy alias
  getStandardList: async (type: StandardType): Promise<any[]> => {
    return standardService.getAll(type);
  },

  // Code Item specific methods
  getCodeItems: async (groupId: string): Promise<CodeItem[]> => {
    const companyId = 'COM-001';
    const response = await axios.get(`/api/std/codes/${companyId}/${groupId}/items`);
    return response.data;
  },

  getCodeItem: async (groupId: string, id: string): Promise<CodeItem | undefined> => {
    const companyId = 'COM-001';
    const response = await axios.get(`/api/std/code-items/${companyId}/${groupId}/${id}`);
    return response.data;
  },

  saveCodeItem: async (item: CodeItem): Promise<CodeItem> => {
    const response = await axios.post('/api/std/code-items', item);
    return response.data;
  },

  deleteCodeItem: async (groupId: string, id: string): Promise<void> => {
    const companyId = 'COM-001';
    await axios.delete(`/api/std/code-items/${companyId}/${groupId}/${id}`);
  },
};
