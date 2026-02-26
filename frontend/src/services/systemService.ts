
import api from '@/utils/api';

export interface FileItem {
    company_id: string;
    file_group_id: string;
    line_no: number;
    original_name: string;
    storage_path: string;
    size: number;
    mime: string;
    created_at?: string;
    created_by?: string;
}

export interface FileGroup {
    company_id: string;
    file_group_id: string;
    items?: FileItem[];
}

export const systemService = {
    // Get File Group with Items
    getFileGroup: async (companyId: string, fileGroupId: string): Promise<FileGroup | null> => {
        try {
            const response = await api.get(`/api/sys/files/${fileGroupId}?companyId=${companyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch file group", error);
            return null;
        }
    },

    // Download URL generator
    getDownloadUrl: (companyId: string, fileGroupId: string, lineNo: number) => {
        return `/api/sys/files/download/item?companyId=${companyId}&fileGroupId=${fileGroupId}&lineNo=${lineNo}`;
    }
};
