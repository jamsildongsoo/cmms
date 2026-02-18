import axios from 'axios';
import { type Person } from './standardService';

export interface Memo {
    company_id: string;
    memo_id: string;
    title: string;
    content: string;
    file_group_id?: string;
    status?: string;
    ref_id?: string;
    approval_id?: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string;
    updated_by?: string;

    // UI fields (derived or joined)
    author_name?: string;
    views?: number; // Not in DB yet?
    isNotice?: boolean; // Not in DB yet?
}

export const memoService = {
    getAllMemos: async (companyId: string): Promise<Memo[]> => {
        const response = await axios.get(`/api/memo?companyId=${companyId}`);
        return response.data;
    },

    getMemoById: async (companyId: string, id: string): Promise<Memo> => {
        const response = await axios.get(`/api/memo/${id}?companyId=${companyId}`);
        return response.data;
    },

    createMemo: async (memo: Partial<Memo>): Promise<Memo> => {
        const response = await axios.post('/api/memo', memo);
        return response.data;
    }
};
