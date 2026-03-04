import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Play, CheckCircle, Save, Trash2, Printer } from 'lucide-react';
import { inspectionService } from '@/services/inspectionService';
import type { Inspection, InspectionItem } from '@/types/inspection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { InspectionPrint } from '@/components/common/InspectionPrint';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { approvalService, type Approval } from '@/services/approvalService';

export default function InspectionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuthStore();
    const [inspection, setInspection] = useState<Inspection | null>(null);
    const [items, setItems] = useState<InspectionItem[]>([]);
    const [approval, setApproval] = useState<Approval | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await inspectionService.getById(id);
            setInspection(data || null);
            setItems(data?.items || []);

            if (data?.approvalId) {
                const appData = await approvalService.getById(data.approvalId);
                setApproval(appData || null);
            } else {
                setApproval(null);
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleStatusChange = async (newStatus: 'P' | 'C') => {
        if (!inspection || !id) return;

        try {
            await inspectionService.update(id, {
                status: newStatus,
                items: items // Save current items state as well
            });
            toast({ title: "상태 변경", description: newStatus === 'P' ? "점검이 시작되었습니다." : "점검이 완료되었습니다." });
            loadData();
        } catch (error) {
            toast({ title: "오류", description: "상태 변경 실패", variant: "destructive" });
        }
    };

    const handleItemChange = (seq: number, field: keyof InspectionItem, value: any) => {
        setItems(prev => prev.map(item =>
            item.seq === seq ? { ...item, [field]: value } : item
        ));
    };
    const handleSaveResults = async () => {
        if (!inspection || !id) return;
        try {
            await inspectionService.update(id, { ...inspection, items });
            toast({ title: "저장 완료", description: "점검 결과가 저장되었습니다." });
        } catch (error) {
            toast({ title: "오류", description: "저장 실패", variant: "destructive" });
        }
    }

    const onDelete = async () => {
        if (!id) return;
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await inspectionService.delete(id);
            toast({ title: "성공", description: "삭제되었습니다." });
            navigate('/pm/inspection');
        } catch (error) {
            toast({ title: "오류", description: "삭제 실패", variant: "destructive" });
        }
    };


    if (loading) return <div className="p-8 text-center text-muted-foreground">로딩 중...</div>;
    if (!inspection) return <div className="p-8 text-center text-red-500">데이터를 찾을 수 없습니다.</div>;

    const isEditable = inspection.status === 'P'; // Only editable when In Progress

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header & Screen UI (Hidden in print) */}
            <div className="space-y-6 print:hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/pm/inspection')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">점검 상세 ({inspection.inspectionId})</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{inspection.name}</span>
                                <span className="text-slate-300">|</span>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded ${inspection.status === 'S' ? 'bg-blue-100 text-blue-700' :
                                    inspection.status === 'P' ? 'bg-orange-100 text-orange-700' :
                                        inspection.status === 'C' ? 'bg-green-100 text-green-700' :
                                            inspection.status === 'R' ? 'bg-red-100 text-red-700' : 'bg-slate-100'
                                    }`}>
                                    {inspection.status === 'T' && '계획 임시 저장'}
                                    {inspection.status === 'A' && '결재 중'}
                                    {inspection.status === 'S' && '계획 확정'}
                                    {inspection.status === 'P' && '점검 진행 중'}
                                    {inspection.status === 'C' && '점검 완료'}
                                    {inspection.status === 'R' && '반려'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/pm/inspection')}>목록</Button>
                        <Button variant="outline" onClick={handlePrint} className="bg-slate-800 text-white hover:bg-slate-900">
                            <Printer className="mr-2 h-4 w-4" /> 출력
                        </Button>

                        {inspection.status === 'T' && (
                            <>
                                <Button variant="outline" onClick={() => navigate(`/pm/inspection/${id}/edit`)}>
                                    <Edit className="mr-2 h-4 w-4" /> 계획 수정
                                </Button>
                                <Button variant="destructive" onClick={onDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" /> 삭제
                                </Button>
                            </>
                        )}

                        {inspection.status === 'S' && (
                            <>
                                <Button variant="outline" onClick={() => navigate(`/pm/inspection/${id}/edit`)}>
                                    <Edit className="mr-2 h-4 w-4" /> 계획 수정
                                </Button>
                                <Button onClick={() => handleStatusChange('P')} className="bg-orange-600 hover:bg-orange-700">
                                    <Play className="mr-2 h-4 w-4" /> 점검 시작
                                </Button>
                            </>
                        )}

                        {inspection.status === 'P' && (
                            <>
                                <Button variant="outline" onClick={handleSaveResults}>
                                    <Save className="mr-2 h-4 w-4" /> 임시 저장
                                </Button>
                                <Button onClick={() => handleStatusChange('C')} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="mr-2 h-4 w-4" /> 점검 완료
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">기본 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">점검번호</Label>
                            <div className="font-medium text-sm">{inspection.inspectionId}</div>
                        </div>
                        <div className="space-y-1 lg:col-span-2">
                            <Label className="text-muted-foreground text-xs">점검명</Label>
                            <div className="font-medium text-sm">{inspection.name}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">{inspection.actualDate ? '실적 일자' : '예정 일자'}</Label>
                            <div className="font-medium text-sm">{inspection.actualDate || inspection.date}</div>
                        </div>
                        {/* Removed Stage */}
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">대상 설비</Label>
                            <div className="font-medium text-sm">{inspection.equipmentName || inspection.equipmentId || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">관리 부서</Label>
                            <div className="font-medium text-sm">{inspection.deptName || inspection.deptId || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">담당자</Label>
                            <div className="font-medium text-sm">{inspection.personName || inspection.personId || '-'}</div>
                        </div>
                        <div className="lg:col-span-4 space-y-1">
                            <Label className="text-muted-foreground text-xs">비고</Label>
                            <div className="text-sm bg-slate-50 p-2 rounded">{inspection.note || '-'}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">점검 상세 내역</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-16 text-center">No.</th>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-[25%]">점검 항목</th>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-[25%]">점검 방법/기준</th>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-[20%] text-center">결과</th>
                                        <th className="h-10 px-4 font-medium text-slate-500">비고</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item, index) => (
                                        <tr key={item.seq} className="hover:bg-slate-50/50">
                                            <td className="p-3 text-center text-slate-500">{index + 1}</td>
                                            <td className="p-3 font-medium">{item.name}</td>
                                            <td className="p-3 text-slate-600">{item.method}</td>
                                            <td className="p-3 text-center">
                                                {isEditable ? (
                                                    <input
                                                        type="text"
                                                        value={item.resultVal || ''}
                                                        onChange={(e) => handleItemChange(item.seq, 'resultVal', e.target.value)}
                                                        className="h-8 w-24 text-center border rounded px-2"
                                                    />
                                                ) : (
                                                    <span className="font-bold">{item.resultVal || '-'}</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-slate-500 text-xs">{(item as any).remark || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Inspection Specific Print Form */}
            <InspectionPrint
                stage={inspection.stage as 'PLN' | 'ACT'}
                id={inspection.inspectionId}
                name={inspection.name}
                equipment={inspection.equipmentName || inspection.equipmentId || ''}
                dept={inspection.deptName || inspection.deptId || ''}
                person={inspection.personName || inspection.personId || ''}
                date={inspection.actualDate || inspection.date}
                items={items.map(item => ({
                    name: item.name,
                    method: item.method,
                    result: item.resultVal,
                    remark: (item as any).remark
                }))}
                note={inspection.note}
                companyName={user?.companyId}
                approvalSteps={approval?.approval_steps}
            />
        </div>
    );
}
