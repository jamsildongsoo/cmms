
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
    getFileGroup: async (fileGroupId: string): Promise<FileGroup | null> => {
        try {
            const response = await api.get(`/api/sys/files/${fileGroupId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch file group", error);
            return null;
        }
    },

    // Download file securely with JWT
    downloadFile: async (fileGroupId: string, lineNo: number, originalName: string) => {
        try {
            const response = await api.get(`/api/sys/files/download/item`, {
                params: { fileGroupId, lineNo },
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
    },

    // Upload a single file
    uploadFile: async (
        file: File,
        fileGroupId?: string,
        refEntity?: string,
        refId?: string
    ): Promise<FileGroup> => {
        const formData = new FormData();
        formData.append('file', file);
        if (fileGroupId) formData.append('fileGroupId', fileGroupId);
        if (refEntity) formData.append('refEntity', refEntity);
        if (refId) formData.append('refId', refId);

        const response = await api.post('/api/sys/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
