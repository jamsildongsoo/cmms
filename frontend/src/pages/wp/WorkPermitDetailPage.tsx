
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CheckCircle, Trash2, Send, Printer } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { workPermitService } from '@/services/workPermitService';
import type { WorkPermit } from '@/types/workPermit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { WPValueCard } from '@/components/wp/WPValueCard';
import { WP_TEMPLATES } from '@/constants/wpTemplates';
import { WorkPermitPrint } from '@/components/common/WorkPermitPrint';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function WorkPermitDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuthStore();
    const [permit, setPermit] = useState<WorkPermit | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        if (!id) return;
        setLoading(true);
        workPermitService.getById(id).then(data => {
            setPermit(data || null);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleStatusChange = async (newStatus: 'A' | 'C') => {
        if (!id) return;
        if (newStatus === 'C' && !window.confirm("작업 허가를 승인 완료하시겠습니까?")) return;
        if (newStatus === 'A' && !window.confirm("허가 신청을 상신하시겠습니까?")) return;

        try {
            await workPermitService.update(id, { ...permit!, status: newStatus });
            toast({ title: "성공", description: newStatus === 'C' ? "작업 허가가 승인되었습니다." : "허가 신청이 상신되었습니다." });
            loadData();
        } catch (e) {
            toast({ title: "오류", description: "처리 중 오류 발생", variant: "destructive" });
        }
    };

    const onDelete = async () => {
        if (!id) return;
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await workPermitService.delete(id);
            toast({ title: "성공", description: "삭제되었습니다." });
            navigate('/wp/work-permit');
        } catch (error) {
            toast({ title: "오류", description: "삭제 실패", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">로딩 중...</div>;
    if (!permit) return <div className="p-8 text-center text-red-500">데이터를 찾을 수 없습니다.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header & Screen UI (Hidden in print) */}
            <div className="space-y-6 print:hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/wp/work-permit')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">허가서 상세 ({permit.permitId})</h1>
                            <div className="flex items-center gap-2">
                                {(permit.wpTypes || []).map(type => (
                                    <span key={type} className={`px-2 py-1 rounded text-xs font-bold ${type === 'HOT' ? 'bg-red-100 text-red-700' :
                                        type === 'CONF' ? 'bg-blue-100 text-blue-700' :
                                            type === 'ELEC' ? 'bg-yellow-100 text-yellow-700' :
                                                type === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-slate-100 text-slate-700'
                                        }`}>
                                        {type === 'GEN' && '일반'}
                                        {type === 'HOT' && '화기'}
                                        {type === 'CONF' && '밀폐'}
                                        {type === 'ELEC' && '전기'}
                                        {type === 'HIGH' && '고소'}
                                        {type === 'HEVY' && '중량물'}
                                        {type === 'DIG' && '굴착'}
                                    </span>
                                ))}
                                <span className="text-muted-foreground ml-2">| {permit.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/wp/work-permit')}>목록</Button>
                        <Button variant="outline" onClick={handlePrint} className="bg-slate-800 text-white hover:bg-slate-900">
                            <Printer className="mr-2 h-4 w-4" /> 출력
                        </Button>
                        {permit.status === 'T' && (
                            <>
                                <Button variant="outline" onClick={() => navigate(`/wp/work-permit/${id}/edit`)}>
                                    <Edit className="mr-2 h-4 w-4" /> 신청 수정
                                </Button>
                                <Button variant="destructive" onClick={onDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" /> 삭제
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Permit Info */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">작업 허가 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">작업 기간</Label>
                                <div className="font-medium">{permit.startDt || '-'} ~ {permit.endDt || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">작업 장소</Label>
                                <div>{permit.location || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">대상 설비</Label>
                                <div>{permit.equipmentName || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">신청 부서 / 신청자</Label>
                                <div>{permit.deptId || '-'} / {permit.personName}</div>
                            </div>

                            <div className="md:col-span-2 space-y-1">
                                <Label className="text-muted-foreground">작업 내용</Label>
                                <div className="bg-slate-50 p-3 rounded-md text-sm whitespace-pre-wrap min-h-[60px]">
                                    {permit.workSummary || "내용 없음"}
                                </div>
                            </div>

                            {/* Risk Assessment */}
                            <div className="md:col-span-2 border-t pt-4 mt-2 border-b pb-4">
                                <h3 className="font-semibold mb-3">위험성 평가</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground block text-xs">위험 요인</span>
                                        <span>{permit.hazardFactor || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs">안전 대책</span>
                                        <span>{permit.safetyFactor || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Common Safety Checks (Mandatory) */}
                            <div className="md:col-span-2 space-y-2">
                                <WPValueCard template={WP_TEMPLATES.COM} permit={permit} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Special Work Cards */}
                    <div className="md:col-span-2 space-y-4">
                        {(permit.wpTypes || []).map((type) => {
                            const template = WP_TEMPLATES[type];
                            if (!template) return null;
                            return (
                                <WPValueCard key={type} template={template} permit={permit} />
                            );
                        })}
                    </div>

                    {/* Approval & History */}
                    <div className="md:col-span-1 space-y-6 md:row-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">승인 상태</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg text-center font-bold text-lg border-2 ${permit.status === 'C' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-slate-100 border-slate-200'
                                        }`}>
                                        {permit.status === 'T' && '임시 저장 (신청)'}
                                        {permit.status === 'A' && '승인 대기중'}
                                        {permit.status === 'C' && '승인 완료'}
                                    </div>
                                    {(permit.status === 'T' || permit.status === 'A') && (
                                        <div className="space-y-2">
                                            <div className="text-sm text-center text-muted-foreground">안전 관리자의 승인이 필요합니다.</div>
                                            {permit.status === 'T' ? (
                                                <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => handleStatusChange('A')}>
                                                    <Send className="mr-2 h-4 w-4" /> 허가 신청 상신
                                                </Button>
                                            ) : (
                                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('C')}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> 허가 승인
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">승인 이력</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>신청: {permit.personName} (2025-05-20 09:00)</li>
                                    {permit.status === 'C' && <li>승인: 관리자 (2025-05-20 10:00)</li>}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Work Permit Specific Print Form */}
            <WorkPermitPrint permit={permit} companyName={user?.companyId} />
        </div>
    );
}
