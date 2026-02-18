import { FileText, FileSpreadsheet, FileImage, File, Download } from 'lucide-react';

export interface AttachedFileInfo {
    id: string;
    name: string;
    size: number;
    url?: string;
}

interface FileAttachmentListProps {
    files: AttachedFileInfo[];
    onDownload?: (file: AttachedFileInfo) => void;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return <FileText className="h-4 w-4 text-red-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return <FileImage className="h-4 w-4 text-purple-500" />;
    if (['doc', 'docx', 'txt', 'hwp'].includes(ext)) return <FileText className="h-4 w-4 text-blue-600" />;
    return <File className="h-4 w-4 text-slate-500" />;
}

export function FileAttachmentList({
    files,
    onDownload,
}: FileAttachmentListProps) {
    if (!files || files.length === 0) {
        return (
            <div className="text-sm text-slate-400 italic">
                첨부파일이 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {files.map((file) => (
                <div
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                    onClick={() => onDownload?.(file)}
                >
                    {getFileIcon(file.name)}
                    <span className="flex-1 text-sm text-blue-600 hover:underline truncate">
                        {file.name}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">{formatFileSize(file.size)}</span>
                    {onDownload && (
                        <Download className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
            ))}
        </div>
    );
}
