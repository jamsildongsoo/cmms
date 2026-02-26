
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, FileText, CheckCircle2, XCircle, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FileAttachmentList, type AttachedFileInfo } from '@/components/common/FileAttachmentList';
import { systemService } from '@/services/systemService';
import { approvalService, type Approval, type DecisionType } from '@/services/approvalService';
import { useAuthStore } from '@/features/auth/useAuthStore';

const DECISION_TYPE_MAP: Record<DecisionType, string> = {
    '00': '기안',
    '01': '결재',
    '02': '합의',
    '03': '참조',
    '04': '반려'
};

const STATUS_MAP: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'T': { label: '임시', variant: 'secondary' },
    'A': { label: '결재중', variant: 'outline' },
    'C': { label: '완료', variant: 'default' },
    'R': { label: '반려', variant: 'destructive' },
};

export default function ApprovalDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuthStore();

    const [approval, setApproval] = useState<Approval | null>(null);
    const [files, setFiles] = useState<AttachedFileInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchData = async () => {
        if (!id) return;
        try {
            const data = await approvalService.getById(id);
            if (data) {
                setApproval(data);
                if (data.file_group_id) {
                    const companyId = user?.company_id || 'COM-001';
                    const fileGroup = await systemService.getFileGroup(companyId, data.file_group_id);
                    if (fileGroup && fileGroup.items) {
                        setFiles(fileGroup.items.map(item => ({
                            id: item.line_no.toString(),
                            name: item.original_name,
                            size: item.size,
                            raw: item
                        } as any)));
                    }
                }
            } else {
                toast({ title: "오류", description: "결재 문서를 찾을 수 없습니다.", variant: "destructive" });
                navigate(-1);
            }
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "데이터를 불러오는 중 오류가 발생했습니다.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
        if (!approval || !id) return;
        const msg = decision === 'APPROVE' ? "승인하시겠습니까?" : "반려하시겠습니까?";
        const comment = window.prompt(msg + "\n의견을 입력하세요.");
        if (comment === null) return;

        try {
            setProcessing(true);
            await approvalService.processDecision(id, decision, comment);
            toast({ title: "처리 완료", description: decision === 'APPROVE' ? "결재를 승인하였습니다." : "결재를 반려하였습니다." });
            fetchData();
        } catch (error: any) {
            console.error(error);
            toast({ title: "오류", description: error.response?.data?.message || "처리 중 오류 발생", variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = (file: AttachedFileInfo & { raw?: any }) => {
        if (approval && file.raw) {
            const url = systemService.getDownloadUrl(approval.company_id, file.raw.file_group_id, file.raw.line_no);
            window.open(url, '_blank');
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-10">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (!approval) return null;

    const statusInfo = STATUS_MAP[approval.status] || { label: approval.status, variant: 'secondary' };

    // My Turn Check: status must be 'A' (Submitted/In progress)
    const currentStep = approval.approval_steps?.find((s: any) => s.line_no === approval.current_step);
    const isMyTurn = approval.status === 'A'
        && currentStep?.person_id === user?.person_id
        && currentStep?.result === '00'
        && currentStep?.decision !== '03'; // 참조/통보형은 승인 버튼 노출 제외

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">결재 상세</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isMyTurn && (
                        <>
                            <Button onClick={() => handleDecision('APPROVE')} disabled={processing} className="bg-green-600 hover:bg-green-700">
                                <Check className="mr-2 h-4 w-4" /> 승인
                            </Button>
                            <Button onClick={() => handleDecision('REJECT')} disabled={processing} variant="destructive">
                                <X className="mr-2 h-4 w-4" /> 반려
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">결재선</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative flex items-start justify-between p-4 bg-slate-50 rounded-lg overflow-x-auto">
                        <div className="flex flex-col items-center min-w-[100px] z-10">
                            <div className="bg-white p-3 rounded-full border shadow-sm mb-2">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <div className="text-sm font-bold text-center">{approval.requester_name || approval.requester_id}</div>
                            <div className="text-xs text-muted-foreground">기안</div>
                            <div className="mt-1 text-xs text-slate-500">{approval.created_at?.split(' ')[0]}</div>
                        </div>
                        <div className="absolute top-11 left-12 right-12 h-0.5 bg-slate-200 -z-0" />
                        {(approval.approval_steps || []).map((step: any, index: number) => {
                            const isStepCurrent = approval.status === 'A' && approval.current_step === step.line_no;
                            const isApproved = step.result === 'Y';
                            const isRejected = step.result === 'N' || (approval.status === 'R' && approval.current_step === step.line_no);

                            return (
                                <div key={index} className="flex flex-col items-center min-w-[100px] z-10">
                                    <div className={`p-3 rounded-full border shadow-sm mb-2 ${isApproved ? 'bg-green-50 border-green-200' :
                                        isRejected ? 'bg-red-50 border-red-200' :
                                            isStepCurrent ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' :
                                                'bg-white'
                                        }`}>
                                        {isApproved ? <CheckCircle2 className="h-5 w-5 text-green-600" /> :
                                            isRejected ? <XCircle className="h-5 w-5 text-red-600" /> :
                                                isStepCurrent ? <Clock className="h-5 w-5 text-blue-600 animate-pulse" /> :
                                                    <User className="h-5 w-5 text-slate-300" />}
                                    </div>
                                    <div className="text-sm font-bold text-center">{step.approver_name || step.person_id}</div>
                                    <div className="text-xs text-muted-foreground">{DECISION_TYPE_MAP[step.decision as DecisionType] || step.decision}</div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        {step.decided_at ? step.decided_at.split(' ')[0] : (isStepCurrent ? '검토중' : '-')}
                                    </div>
                                    {step.comment && (
                                        <div className="mt-1 text-[10px] text-slate-400 max-w-[80px] truncate" title={step.comment}>
                                            {step.comment}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        문서 내용
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">제목</h4>
                            <div className="p-3 bg-slate-50 rounded-md border text-sm font-medium">
                                {approval.title}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">기안일시</h4>
                            <div className="p-3 bg-slate-50 rounded-md border text-sm flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {approval.created_at}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">상세 내용</h4>
                        <div className="min-h-[300px] p-4 bg-slate-50 rounded-md border text-sm whitespace-pre-wrap">
                            {approval.content}
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">첨부파일</h4>
                        {files.length > 0 ? (
                            <FileAttachmentList
                                files={files}
                                onDownload={handleDownload}
                            />
                        ) : (
                            <div className="text-sm text-slate-400 italic">첨부파일이 없습니다.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
