
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Send } from 'lucide-react';
import { workOrderService } from '@/services/workOrderService';
import type { WorkOrder } from '@/types/workOrder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function WorkOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        workOrderService.getById(id).then(data => {
            setWorkOrder(data || null);
            setLoading(false);
        });
    }, [id]);

    const handleStatusChange = async (newStatus: 'A' | 'C') => {
        if (!id) return;
        if (newStatus === 'C' && !window.confirm("작업을 완료하시겠습니까?")) return;
        if (newStatus === 'A' && !window.confirm("승인 요청(시작)을 하시겠습니까?")) return;

        try {
            await workOrderService.update(id, { ...workOrder!, status: newStatus });
            toast({ title: "성공", description: newStatus === 'C' ? "작업이 완료되었습니다." : "승인 요청되었습니다." });
            const updated = await workOrderService.getById(id);
            setWorkOrder(updated || null);
        } catch (e) {
            toast({ title: "오류", description: "처리 중 오류 발생", variant: "destructive" });
        }
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

    if (loading) return <div className="p-8 text-center">로딩 중...</div>;
    if (!workOrder) return <div className="p-8 text-center text-red-500">데이터를 찾을 수 없습니다.</div>;



    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/wo/work-order')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">작업 상세 ({workOrder.order_id})</h1>
                        <p className="text-muted-foreground">{workOrder.name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/wo/work-order')}>목록</Button>
                    {workOrder.status === 'T' && (
                        <>
                            <Button variant="outline" onClick={() => navigate(`/wo/work-order/${id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> 요청 수정
                            </Button>
                            <Button variant="destructive" onClick={onDelete}>
                                <Trash2 className="mr-2 h-4 w-4" /> 삭제
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Request Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">작업 요청 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">작업명</Label>
                            <div className="font-medium">{workOrder.name}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">대상 설비</Label>
                            <div className="font-medium">{workOrder.equipment_name}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">작업 유형</Label>
                            <div>{workOrder.code_item || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">관리 부서</Label>
                            <div>{workOrder.dept_id || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">담당자</Label>
                            <div>{workOrder.person_id || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">요청 일자</Label>
                            <div>{workOrder.date}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">예상 비용 / 시간</Label>
                            <div>
                                {workOrder.cost?.toLocaleString()} 원 / {workOrder.time || 0} M/D
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <Label className="text-muted-foreground">요청 내용</Label>
                            <div className="bg-slate-50 p-3 rounded-md text-sm whitespace-pre-wrap min-h-[60px]">
                                {workOrder.note || "내용 없음"}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Status & Action Input */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">진행 상태</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg text-center font-bold text-lg border-2 ${workOrder.status === 'C' ? 'bg-green-50 border-green-500 text-green-700' :
                                    workOrder.status === 'A' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-100 border-slate-200'
                                    }`}>
                                    {workOrder.status === 'T' && '임시 저장'}
                                    {workOrder.status === 'A' && '진행 중 (승인)'}
                                    {workOrder.status === 'C' && '완료 됨'}
                                </div>
                                {workOrder.status === 'T' && (
                                    <Button
                                        className="w-full bg-orange-600 hover:bg-orange-700"
                                        onClick={() => handleStatusChange('A')}
                                    >
                                        <Send className="mr-2 h-4 w-4" /> 작업 상신/시작
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actual Input Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">작업 결과 입력</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => { e.preventDefault(); handleStatusChange('C'); }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>작업 일자</Label>
                                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="space-y-2">
                                    <Label>소요 시간 (시간)</Label>
                                    <Input type="number" placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label>공임비 / 자재비</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input type="number" placeholder="공임" />
                                        <Input type="number" placeholder="자재" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>조치 내용</Label>
                                    <Textarea placeholder="수리 및 조치 내용을 상세히 입력하세요." className="min-h-[80px]" />
                                </div>
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">작업 완료 보고</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
