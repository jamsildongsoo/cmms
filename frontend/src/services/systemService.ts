
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

    // Download file securely with JWT
    downloadFile: async (companyId: string, fileGroupId: string, lineNo: number, originalName: string) => {
        try {
            const response = await api.get(`/api/sys/files/download/item?companyId=${companyId}&fileGroupId=${fileGroupId}&lineNo=${lineNo}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download file", error);
            throw error;
        }
    }
};
