import api from '@/utils/api';
import { useAuthStore } from "@/features/auth/useAuthStore";


export interface Memo {
    companyId: string;
    memoId: string;
    title: string;
    content: string;
    fileGroupId?: string;
    status?: string; // 'T' or 'C'
    refId?: string;
    approvalId?: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;

    // UI fields (derived or joined)
    author_name?: string;
    isNotice?: string; // 'Y' or 'N'
}

export interface MemoComment {
    companyId: string;
    memoId: string;
    commentId: number;
    authorId: string;
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
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");
        const payload = { ...memo, companyId: companyId };
        const response = await api.post('/api/memo', payload);
        return response.data;
    },

    deleteMemo: async (id: string, personId: string): Promise<void> => {
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");
        await api.delete(`/api/memo/${id}?companyId=${companyId}&personId=${personId}`);
    },

    getComments: async (id: string): Promise<MemoComment[]> => {
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");
        const response = await api.get(`/api/memo/${id}/comments?companyId=${companyId}`);
        return response.data;
    },

    addComment: async (id: string, content: string): Promise<MemoComment> => {
        const user = useAuthStore.getState().user;
        if (!user?.companyId || !user?.personId) throw new Error("User not authenticated");
        const payload = { authorId: user.personId, content };
        const response = await api.post(`/api/memo/${id}/comments?companyId=${user.companyId}`, payload);
        return response.data;
    },

    deleteComment: async (id: string, commentId: number): Promise<void> => {
        const user = useAuthStore.getState().user;
        if (!user?.companyId || !user?.personId) throw new Error("User not authenticated");
        await api.delete(`/api/memo/${id}/comments/${commentId}?companyId=${user.companyId}&personId=${user.personId}`);
    }
};
