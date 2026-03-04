
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Printer } from 'lucide-react';
import { workOrderService } from '@/services/workOrderService';
import type { WorkOrder } from '@/types/workOrder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { WorkOrderPrint } from '@/components/common/WorkOrderPrint';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { approvalService, type ApprovalStep } from '@/services/approvalService';

export default function WorkOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuthStore();
    const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
    const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        workOrderService.getById(id).then(async data => {
            setWorkOrder(data || null);
            if (data?.approvalId) {
                const approval = await approvalService.getById(data.approvalId);
                if (approval?.approval_steps) {
                    setApprovalSteps(approval.approval_steps);
                }
            }
            setLoading(false);
        });
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const onDelete = async () => {
        if (!id) return;
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await workOrderService.delete(id);
            toast({ title: "성공", description: "삭제되었습니다." });
            navigate('/wo/work-order');
        } catch (error) {
            toast({ title: "오류", description: "삭제 실패", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">로딩 중...</div>;
    if (!workOrder) return <div className="p-8 text-center text-red-500">데이터를 찾을 수 없습니다.</div>;

    const isConfirmed = workOrder.status === 'C';
    const isApproval = workOrder.status === 'A';
    const isReadOnly = isConfirmed || isApproval;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header & Screen UI (Hidden in print) */}
            <div className="space-y-6 print:hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/wo/work-order')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">작업 상세 ({workOrder.orderId})</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{workOrder.name}</span>
                                <span className="text-slate-300">|</span>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded ${workOrder.stage === 'PLN' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    {workOrder.stage === 'PLN' ? '계획' : '실적'}
                                </span>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded ${workOrder.status === 'C' ? 'bg-green-100 text-green-700' :
                                    workOrder.status === 'A' ? 'bg-blue-100 text-blue-700' :
                                        workOrder.status === 'REQ' ? 'bg-yellow-100 text-yellow-700' :
                                            workOrder.status === 'R' ? 'bg-red-100 text-red-700' : 'bg-slate-100'
                                    }`}>
                                    {workOrder.status === 'T' && '임시 저장'}
                                    {workOrder.status === 'REQ' && '요청'}
                                    {workOrder.status === 'A' && '결재 중'}
                                    {workOrder.status === 'C' && '완료 됨'}
                                    {workOrder.status === 'R' && '반려'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/wo/work-order')}>목록</Button>
                        <Button variant="outline" onClick={handlePrint} className="bg-slate-800 text-white hover:bg-slate-900">
                            <Printer className="mr-2 h-4 w-4" /> 출력
                        </Button>
                        {!isReadOnly && (
                            <>
                                <Button variant="outline" onClick={() => navigate(`/wo/work-order/${id}/edit`)}>
                                    <Edit className="mr-2 h-4 w-4" /> 수정
                                </Button>
                                <Button variant="destructive" onClick={onDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" /> 삭제
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">기본 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">지시번호</Label>
                            <div className="font-medium text-sm">{workOrder.orderId}</div>
                        </div>
                        <div className="space-y-1 lg:col-span-2">
                            <Label className="text-muted-foreground text-xs">작업명</Label>
                            <div className="font-medium text-sm">{workOrder.name}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">작업 일자</Label>
                            <div className="font-medium text-sm">{workOrder.date}</div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">작업 유형</Label>
                            <div className="font-medium text-sm">{workOrder.codeItem || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">대상 설비</Label>
                            <div className="font-medium text-sm">{workOrder.equipmentName || workOrder.equipmentId || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">관리 부서</Label>
                            <div className="font-medium text-sm">{workOrder.deptName || workOrder.deptId || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">담당자</Label>
                            <div className="font-medium text-sm">{workOrder.personName || workOrder.personId || '-'}</div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">비용 (원)</Label>
                            <div className="font-medium text-sm">{(workOrder.cost || 0).toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">소요 시간 (M/D)</Label>
                            <div className="font-medium text-sm">{workOrder.time || 0}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">참조 구분</Label>
                            <div className="font-medium text-sm">{workOrder.refEntity || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">참조 ID</Label>
                            <div className="font-medium text-sm">{workOrder.refId || '-'}</div>
                        </div>

                        <div className="lg:col-span-4 space-y-1">
                            <Label className="text-muted-foreground text-xs">비고 / 요청 내용</Label>
                            <div className="text-sm bg-slate-50 p-2 rounded whitespace-pre-wrap min-h-[60px]">
                                {workOrder.note || '-'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Work Items Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">작업 항목 및 결과</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-16 text-center">No.</th>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-[30%]">작업 항목</th>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-[30%]">작업 방법</th>
                                        <th className="h-10 px-4 font-medium text-slate-500">조치 결과</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {workOrder.items && workOrder.items.length > 0 ? (
                                        workOrder.items.map((item: any, index: number) => (
                                            <tr key={item.seq || index} className="hover:bg-slate-50/50">
                                                <td className="p-3 text-center text-slate-500 font-mono">{index + 1}</td>
                                                <td className="p-3 font-medium">{item.task_name || item.name}</td>
                                                <td className="p-3 text-slate-600">{item.method}</td>
                                                <td className="p-3 text-slate-700 font-semibold">{item.result || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500">
                                                등록된 작업 항목이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Work Order Specific Print Form */}
            <WorkOrderPrint
                stage={workOrder.stage as 'PLN' | 'ACT'}
                id={workOrder.orderId}
                name={workOrder.name}
                equipment={workOrder.equipmentName || workOrder.equipmentId || ''}
                dept={workOrder.deptName || workOrder.deptId || ''}
                person={workOrder.personName || workOrder.personId || ''}
                date={workOrder.date}
                items={(workOrder.items || []).map((item: any) => ({
                    name: item.task_name || item.name,
                    method: item.method,
                    result: item.result,
                    remark: item.remark
                }))}
                note={workOrder.note}
                companyName={user?.companyId}
                approvalSteps={approvalSteps}
            />
        </div>
    );
}
