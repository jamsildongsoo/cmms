
import api from '@/utils/api';

export interface FileItem {
    companyId: string;
    fileGroupId: string;
    lineNo: number;
    originalName: string;
    storagePath: string;
    size: number;
    mime: string;
    createdAt?: string;
    createdBy?: string;
}

export interface FileGroup {
    companyId: string;
    fileGroupId: string;
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
