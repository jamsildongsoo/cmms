
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Play, CheckCircle, Save } from 'lucide-react';
import { inspectionService } from '@/services/inspectionService';
import type { Inspection, InspectionItem } from '@/types/inspection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function InspectionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [inspection, setInspection] = useState<Inspection | null>(null);
    const [items, setItems] = useState<InspectionItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        if (!id) return;
        setLoading(true);
        inspectionService.getById(id).then(data => {
            setInspection(data || null);
            setItems(data?.items || []);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, [id]);

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
            await inspectionService.update(id, { items });
            toast({ title: "저장 완료", description: "점검 결과가 저장되었습니다." });
        } catch (error) {
            toast({ title: "오류", description: "저장 실패", variant: "destructive" });
        }
    }


    if (loading) return <div className="p-8 text-center text-muted-foreground">로딩 중...</div>;
    if (!inspection) return <div className="p-8 text-center text-red-500">데이터를 찾을 수 없습니다.</div>;

    const isEditable = inspection.status === 'P'; // Only editable when In Progress
    const isCompleted = inspection.status === 'C';

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/pm/inspection')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">점검 상세 ({inspection.inspection_id})</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{inspection.name}</span>
                            <span className="text-slate-300">|</span>
                            <span className={`text-sm font-medium px-2 py-0.5 rounded ${inspection.status === 'S' ? 'bg-blue-100 text-blue-700' :
                                inspection.status === 'P' ? 'bg-orange-100 text-orange-700' :
                                    inspection.status === 'C' ? 'bg-green-100 text-green-700' : 'bg-slate-100'
                                }`}>
                                {inspection.status === 'T' && '임시 저장'}
                                {inspection.status === 'S' && '계획 확정'}
                                {inspection.status === 'P' && '진행 중'}
                                {inspection.status === 'C' && '완료 됨'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/pm/inspection')}>목록</Button>

                    {/* Status Actions */}
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

            {/* Plan Info (Read Only) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Row 1: ID, Name, Date */}
                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">점검번호</Label>
                        <div className="font-medium text-sm">{inspection.inspection_id}</div>
                    </div>
                    <div className="space-y-1 lg:col-span-2">
                        <Label className="text-muted-foreground text-xs">점검명</Label>
                        <div className="font-medium text-sm">{inspection.name}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">{inspection.actual_date ? '실적 일자' : '예정 일자'}</Label>
                        <div className="font-medium text-sm">{inspection.actual_date || inspection.date}</div>
                    </div>

                    {/* Row 1-1: Ref Info */}
                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">단계</Label>
                        <div className="font-medium text-sm">{inspection.stage === 'PLN' ? '계획' : '실적'}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">참조 구분</Label>
                        <div className="font-medium text-sm">{inspection.ref_entity || '-'}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">참조 ID</Label>
                        <div className="font-medium text-sm">{inspection.ref_id || '-'}</div>
                    </div>

                    {/* Row 2: Type, Equipment, Dept, Person */}
                    <div className="space-y-1 lg:col-start-1">
                        <Label className="text-muted-foreground text-xs">점검 유형</Label>
                        <div className="font-medium text-sm">{inspection.code_item}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">대상 설비</Label>
                        <div className="font-medium text-sm">{inspection.equipment_name}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">관리 부서</Label>
                        <div className="font-medium text-sm">{inspection.dept_name || '-'}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">담당자</Label>
                        <div className="font-medium text-sm">{inspection.person_name}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">계획 일자</Label>
                        <div className="font-medium text-sm">{inspection.date}</div>
                    </div>
                    {isCompleted && (
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">완료 일자</Label>
                            <div className="font-medium text-sm text-green-600">{inspection.actual_date || '2024-02-28'}</div>
                        </div>
                    )}
                    <div className="lg:col-span-4 space-y-1">
                        <Label className="text-muted-foreground text-xs">비고</Label>
                        <div className="text-sm bg-slate-50 p-2 rounded">{inspection.note || '-'}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Inspection Items Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">점검 결과 입력</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-16 text-center">No.</th>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[20%]">점검 항목</th>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[20%]">점검 방법</th>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[20%]">판정 기준</th>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[10%] text-center">단위</th>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[15%] text-center">결과</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, index) => (
                                    <tr key={item.seq} className="hover:bg-slate-50/50">
                                        <td className="p-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="p-3 font-medium">{item.check_item}</td>
                                        <td className="p-3 text-slate-600">{item.method}</td>
                                        <td className="p-3 text-slate-600">{item.criteria}</td>
                                        <td className="p-3 text-slate-600 text-center">{item.unit || '-'}</td>

                                        {/* Result Input */}
                                        <td className="p-3 text-center">
                                            {isEditable ? (
                                                <div className="flex justify-center">
                                                    {/* Input is not imported, using simple input for now or need to import Input */}
                                                    <input
                                                        type="number"
                                                        value={item.result_value || ''}
                                                        onChange={(e) => handleItemChange(item.seq, 'result_value', parseFloat(e.target.value))}
                                                        placeholder="0"
                                                        className="h-8 w-24 text-right border rounded px-2"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="font-bold text-slate-700">
                                                    {item.result_value !== undefined ? item.result_value : '-'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
