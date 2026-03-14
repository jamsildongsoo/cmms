import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, CheckCircle2, AlertCircle, Download, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/utils/api';

interface ColumnInfo {
    name: string;
    required: boolean;
}

interface ExcelUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    validateUrl: string;
    uploadUrl: string;
    templateUrl?: string;
    columns: ColumnInfo[];
    onSuccess?: () => void;
}

interface UploadResult {
    totalRows: number;
    successCount: number;
    failureCount: number;
    errors: Array<{
        rowNum: number;
        identifier: string;
        message: string;
    }>;
}

type Step = 'select' | 'validated' | 'saved';

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
    isOpen, onClose, title, validateUrl, uploadUrl, templateUrl, columns, onSuccess
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [step, setStep] = useState<Step>('select');
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setStep('select');
        }
    };

    const handleValidate = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        try {
            const response = await api.post<UploadResult>(validateUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
            setStep('validated');
        } catch (error: any) {
            toast({
                title: "검증 오류",
                description: error.response?.data?.message || "파일 검증 중 에러가 발생했습니다.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        try {
            const response = await api.post<UploadResult>(uploadUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
            setStep('saved');
            onSuccess?.();
            toast({
                title: "저장 완료",
                description: `${response.data.successCount}건이 저장되었습니다.`,
            });
        } catch (error: any) {
            toast({
                title: "저장 오류",
                description: error.response?.data?.message || "저장 중 에러가 발생했습니다.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTemplateDownload = async () => {
        if (!templateUrl) return;
        try {
            const response = await api.get(templateUrl, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title}_template.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            toast({ title: "오류", description: "템플릿 다운로드에 실패했습니다.", variant: "destructive" });
        }
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        setStep('select');
        onClose();
    };

    const isValid = result && result.failureCount === 0;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogTitle>{title} 대량 등록</DialogTitle>

                <div className="space-y-4 py-4">
                    {/* 컬럼 안내 */}
                    <div className="rounded-lg border p-3 bg-slate-50">
                        <p className="text-xs font-medium text-slate-600 mb-2">엑셀 컬럼 안내 (* 필수)</p>
                        <div className="grid grid-cols-3 gap-1 text-xs text-slate-500">
                            {columns.map((col, i) => (
                                <span key={i}>
                                    {String.fromCharCode(65 + i)}. {col.name}{col.required ? '*' : ''}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 템플릿 다운로드 */}
                    {templateUrl && (
                        <Button variant="outline" size="sm" className="w-full" onClick={handleTemplateDownload}>
                            <Download className="mr-2 h-4 w-4" /> 템플릿 다운로드
                        </Button>
                    )}

                    {/* 파일 선택 */}
                    <div className="grid w-full items-center gap-1.5">
                        <Input
                            id="excel-file"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* 로딩 */}
                    {isLoading && (
                        <div className="text-center py-4 text-sm text-muted-foreground animate-pulse">
                            {step === 'select' ? '파일을 검증 중입니다...' : '데이터를 저장 중입니다...'}
                        </div>
                    )}

                    {/* 검증/저장 결과 */}
                    {result && (
                        <div className="rounded-lg border p-4 space-y-3 bg-slate-50">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span>총 건수: {result.totalRows}</span>
                                <span className="text-green-600 flex items-center">
                                    <CheckCircle2 className="h-4 w-4 mr-1"/> {result.successCount}
                                </span>
                                <span className="text-red-600 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1"/> {result.failureCount}
                                </span>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="max-h-[200px] overflow-y-auto text-xs space-y-1">
                                    <p className="font-bold text-slate-700 mb-1 border-b">오류 내역 (최대 100건)</p>
                                    {result.errors.map((err, idx) => (
                                        <div key={idx} className="flex gap-2 text-red-500">
                                            <span className="w-12 shrink-0">[{err.rowNum}행]</span>
                                            <span className="font-medium truncate">{err.identifier}</span>
                                            <span className="flex-1 italic">{err.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 'validated' && result.failureCount > 0 && (
                                <p className="text-xs text-red-500 font-medium">
                                    오류를 수정한 후 다시 검증해 주세요.
                                </p>
                            )}

                            {step === 'saved' && (
                                <p className="text-xs text-green-600 font-medium">
                                    저장이 완료되었습니다.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={handleClose} disabled={isLoading}>닫기</Button>
                    {step !== 'saved' && (
                        <>
                            <Button
                                onClick={handleValidate}
                                disabled={!file || isLoading}
                                variant="outline"
                            >
                                <Search className="mr-2 h-4 w-4" /> 검증
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!file || isLoading || step !== 'validated' || !isValid}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Upload className="mr-2 h-4 w-4" /> 저장
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
