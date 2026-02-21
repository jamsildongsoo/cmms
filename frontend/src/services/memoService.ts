import api from '@/utils/api';
import { useAuthStore } from "@/features/auth/useAuthStore";


export interface Memo {
    company_id: string;
    memo_id: string;
    title: string;
    content: string;
    file_group_id?: string;
    status?: string; // 'T' or 'C'
    ref_id?: string;
    approval_id?: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string;
    updated_by?: string;

    // UI fields (derived or joined)
    author_name?: string;
    is_notice?: string; // 'Y' or 'N'
}

export interface MemoComment {
    company_id: string;
    memo_id: string;
    comment_id: number;
    author_id: string;
    date: string;
    content: string;

    // UI fields
    author_name?: string;
}

export const memoService = {
    getAllMemos: async (companyId: string): Promise<Memo[]> => {
        const response = await api.get(`/api/memo?companyId=${companyId}`);
        return response.data;
    },

    getMemoById: async (companyId: string, id: string): Promise<Memo> => {
        const response = await api.get(`/api/memo/${id}?companyId=${companyId}`);
        return response.data;
    },

    createMemo: async (memo: Partial<Memo>): Promise<Memo> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        const payload = { ...memo, company_id: companyId };
        const response = await api.post('/api/memo', payload);
        return response.data;
    },

    deleteMemo: async (id: string, personId: string): Promise<void> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        await api.delete(`/api/memo/${id}?companyId=${companyId}&personId=${personId}`);
    },

    getComments: async (id: string): Promise<MemoComment[]> => {
        const companyId = useAuthStore.getState().user?.company_id;
        if (!companyId) throw new Error("User not authenticated");
        const response = await api.get(`/api/memo/${id}/comments?companyId=${companyId}`);
        return response.data;
    },

    addComment: async (id: string, content: string): Promise<MemoComment> => {
        const user = useAuthStore.getState().user;
        if (!user?.company_id || !user?.person_id) throw new Error("User not authenticated");
        const payload = { authorId: user.person_id, content };
        const response = await api.post(`/api/memo/${id}/comments?companyId=${user.company_id}`, payload);
        return response.data;
    },

    deleteComment: async (id: string, commentId: number): Promise<void> => {
        const user = useAuthStore.getState().user;
        if (!user?.company_id || !user?.person_id) throw new Error("User not authenticated");
        await api.delete(`/api/memo/${id}/comments/${commentId}?companyId=${user.company_id}&personId=${user.person_id}`);
    }
};
