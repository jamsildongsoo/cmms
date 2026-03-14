import api from '@/utils/api';

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
    getAllMemos: async (): Promise<Memo[]> => {
        const response = await api.get('/api/memo');
        return response.data;
    },

    getMemoById: async (id: string): Promise<Memo> => {
        const response = await api.get(`/api/memo/${id}`);
        return response.data;
    },

    createMemo: async (memo: Partial<Memo>): Promise<Memo> => {
        const response = await api.post('/api/memo', memo);
        return response.data;
    },

    deleteMemo: async (id: string): Promise<void> => {
        await api.delete(`/api/memo/${id}`);
    },

    getComments: async (id: string): Promise<MemoComment[]> => {
        const response = await api.get(`/api/memo/${id}/comments`);
        return response.data;
    },

    addComment: async (id: string, content: string): Promise<MemoComment> => {
        const response = await api.post(`/api/memo/${id}/comments`, { content });
        return response.data;
    },

    deleteComment: async (id: string, commentId: number): Promise<void> => {
        await api.delete(`/api/memo/${id}/comments/${commentId}`);
    }
};
