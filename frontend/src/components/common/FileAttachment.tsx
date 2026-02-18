import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, FileSpreadsheet, FileImage, File } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AttachedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    file?: File;
    url?: string;
    isNew?: boolean;
}

interface FileAttachmentProps {
    files: AttachedFile[];
    onChange: (files: AttachedFile[]) => void;
    maxFiles?: number;
    maxSizeBytes?: number;
    acceptTypes?: string;
    disabled?: boolean;
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

export function FileAttachment({
    files,
    onChange,
    maxFiles = 5,
    maxSizeBytes = 10 * 1024 * 1024, // 10MB
    acceptTypes,
    disabled = false,
    readonly = false,
}: FileAttachmentProps & { readonly?: boolean }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const addFiles = useCallback(
        (newFileList: FileList | null) => {
            if (!newFileList || disabled || readonly) return;

            const newFiles: AttachedFile[] = [];
            const errors: string[] = [];

            for (let i = 0; i < newFileList.length; i++) {
                const f = newFileList[i];

                // Check max count
                if (files.length + newFiles.length >= maxFiles) {
                    errors.push(`최대 ${maxFiles}개 파일만 첨부할 수 있습니다.`);
                    break;
                }

                // Check file size
                if (f.size > maxSizeBytes) {
                    errors.push(`"${f.name}"이(가) 최대 크기(${formatFileSize(maxSizeBytes)})를 초과합니다.`);
                    continue;
                }

                // Check duplicate
                if (files.some((ef) => ef.name === f.name && ef.size === f.size)) {
                    errors.push(`"${f.name}"은(는) 이미 첨부되어 있습니다.`);
                    continue;
                }

                newFiles.push({
                    id: `file-${Date.now()}-${i}`,
                    name: f.name,
                    size: f.size,
                    type: f.type,
                    file: f,
                    isNew: true,
                });
            }

            if (errors.length > 0) {
                alert(errors.join('\n'));
            }

            if (newFiles.length > 0) {
                onChange([...files, ...newFiles]);
            }
        },
        [files, maxFiles, maxSizeBytes, disabled, readonly, onChange]
    );

    const handleRemove = (id: string) => {
        if (readonly) return;
        onChange(files.filter((f) => f.id !== id));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled && !readonly) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    if (readonly && files.length === 0) {
        return <div className="text-sm text-muted-foreground p-2">첨부된 파일이 없습니다.</div>;
    }

    return (
        <div className="space-y-3">
            {/* Drop Zone - Hide in readonly */}
            {!readonly && (
                <div
                    className={cn(
                        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
                        isDragOver
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50',
                        disabled && 'cursor-not-allowed opacity-50'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                >
                    <Upload className={cn('h-8 w-8 mb-2', isDragOver ? 'text-blue-500' : 'text-slate-400')} />
                    <p className="text-sm text-slate-600">
                        파일을 드래그하거나 <span className="text-blue-600 font-medium">클릭</span>하여 선택
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        최대 {maxFiles}개, 각 {formatFileSize(maxSizeBytes)} 이하
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        accept={acceptTypes}
                        onChange={(e) => {
                            addFiles(e.target.files);
                            e.target.value = '';
                        }}
                        disabled={disabled}
                    />
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-1">
                    {files.map((f) => (
                        <div
                            key={f.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-slate-100 hover:border-slate-200 transition-colors group"
                        >
                            {getFileIcon(f.name)}
                            <span className="flex-1 text-sm truncate">{f.name}</span>
                            <span className="text-xs text-slate-400 shrink-0">{formatFileSize(f.size)}</span>
                            {!disabled && !readonly && (
                                <button
                                    type="button"
                                    className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(f.id);
                                    }}
                                >
                                    <X className="h-3.5 w-3.5 text-red-500" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
