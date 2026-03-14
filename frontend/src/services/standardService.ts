
import api from '@/utils/api';

// 기준정보 (Company, Plant, Dept, User, Code) 인터페이스
export interface BaseStandard {
  name: string;
  deleteMark?: 'Y' | 'N';
}

export interface Company extends BaseStandard {
  companyId: string;
  bizno?: string;
  email?: string;
  phone?: string;
}

export interface Plant extends BaseStandard {
  companyId: string;
  plantId: string;
}

export interface Dept extends BaseStandard {
  companyId: string;
  deptId: string;
  parentId?: string;
}

export interface Code extends BaseStandard {
  companyId?: string;
  codeId: string;
}

export interface Storage extends BaseStandard {
  companyId: string;
  storageId: string;
  plantId: string; // Belongs to a plant
  location?: string;
}

export interface CodeItem {
  itemId: string; // The item code (e.g., 'PUMP')
  codeId: string; // The parent code group (e.g., 'EQUIP_TYPE')
  name: string;
  companyId?: string;
}

export interface Person extends BaseStandard {
  companyId: string;
  personId: string;
  roleId?: string;
  deptId?: string;
  email?: string;
  phone?: string;
  position?: string;
  title?: string;
  note?: string;
  passwordHash?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

export interface Role extends BaseStandard {
  companyId: string;
  roleId: string;
  note?: string;
}

// Standard entity type
export interface Bin extends BaseStandard {
  companyId: string;
  binId: string;
  storageId: string;
}

export interface Location extends BaseStandard {
  companyId: string;
  locationId: string;
  storageId: string;
  binId?: string;
}

export type StandardType = 'company' | 'plant' | 'dept' | 'person' | 'code' | 'storage' | 'role' | 'bin' | 'location';

export const standardService = {
  // List
  getAll: async (type: StandardType): Promise<any[]> => {
    const pathMap: Record<StandardType, string> = {
      company: 'v1/companies',
      plant: 'std/plants',
      dept: 'std/depts',
      person: 'std/persons',
      code: 'std/codes',
      storage: 'std/storages',
      role: 'std/roles',
      bin: 'std/bins',
      location: 'std/locations'
    };
    const response = await api.get(`/api/${pathMap[type]}`);
    return response.data;
  },

  // Get by ID
  getById: async (type: StandardType, id: string): Promise<any | undefined> => {
    const pathMap: Record<StandardType, string> = {
      company: 'v1/companies',
      plant: 'std/plants',
      dept: 'std/depts',
      person: 'std/persons',
      code: 'std/codes',
      storage: 'std/storages',
      role: 'std/roles',
      bin: 'std/bins',
      location: 'std/locations'
    };

    let url = `/api/${pathMap[type]}/${id}`;

    try {
      const response = await api.get(url);
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
      storage: 'std/storages',
      role: 'std/roles',
      bin: 'std/bins',
      location: 'std/locations'
    };
    const response = await api.post(`/api/${pathMap[type]}`, data);
    return response.data;
  },

  // Update
  update: async (type: StandardType, _id: string, data: any): Promise<any> => {
    return standardService.create(type, data);
  },

  // Delete
  delete: async (type: StandardType, id: string): Promise<void> => {
    const pathMap: Record<StandardType, string> = {
      company: 'v1/companies',
      plant: 'std/plants',
      dept: 'std/depts',
      person: 'std/persons',
      code: 'std/codes',
      storage: 'std/storages',
      role: 'std/roles',
      bin: 'std/bins',
      location: 'std/locations'
    };
    await api.delete(`/api/${pathMap[type]}/${id}`);
  },

  // Legacy alias
  getStandardList: async (type: StandardType): Promise<any[]> => {
    return standardService.getAll(type);
  },

  // Code Item specific methods
  getCodeItems: async (groupId: string): Promise<CodeItem[]> => {
    const response = await api.get(`/api/std/codes/${groupId}/items`);
    return response.data;
  },

  getCodeItem: async (groupId: string, id: string): Promise<CodeItem | undefined> => {
    const response = await api.get(`/api/std/codes/${groupId}/items/${id}`);
    return response.data;
  },

  saveCodeItem: async (item: CodeItem): Promise<CodeItem> => {
    const response = await api.post(`/api/std/codes/${item.codeId}/items`, item);
    return response.data;
  },

  deleteCodeItem: async (groupId: string, id: string): Promise<void> => {
    await api.delete(`/api/std/codes/${groupId}/items/${id}`);
  },
};
