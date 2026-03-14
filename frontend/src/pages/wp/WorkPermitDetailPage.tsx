
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Printer } from 'lucide-react';
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
import { approvalService, type ApprovalStep } from '@/services/approvalService';

const TYPE_LABELS: Record<string, string> = {
    HOT: '화기', CONF: '밀폐', ELEC: '정전', DIG: '굴착', HIGH: '고소', HEAVY: '중량물',
};

export default function WorkPermitDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuthStore();
    const [permit, setPermit] = useState<WorkPermit | null>(null);
    const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        if (!id) return;
        setLoading(true);
        workPermitService.getById(id).then(async data => {
            setPermit(data || null);
            if (data?.approvalId) {
                const approval = await approvalService.getById(data.approvalId);
                if (approval?.approval_steps) {
                    setApprovalSteps(approval.approval_steps);
                }
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handlePrint = () => {
        window.print();
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
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header & Screen UI (Hidden in print) */}
            <div className="space-y-6 print:hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/wp/work-permit')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">허가서 상세 ({permit.permitId})</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{permit.name}</span>
                                <span className="text-slate-300">|</span>
                                {(permit.wpTypes || []).map(type => (
                                    <span key={type} className={`text-xs font-bold px-2 py-0.5 rounded ${
                                        type === 'HOT' ? 'bg-red-100 text-red-700' :
                                        type === 'CONF' ? 'bg-blue-100 text-blue-700' :
                                        type === 'ELEC' ? 'bg-yellow-100 text-yellow-700' :
                                        type === 'HIGH' ? 'bg-green-100 text-green-700' :
                                        type === 'DIG' ? 'bg-amber-100 text-amber-700' :
                                        type === 'HEAVY' ? 'bg-purple-100 text-purple-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                        {TYPE_LABELS[type] || type}
                                    </span>
                                ))}
                                <span className={`text-sm font-medium px-2 py-0.5 rounded ${permit.status === 'C' ? 'bg-green-100 text-green-700' :
                                    permit.status === 'A' ? 'bg-orange-100 text-orange-700' :
                                        permit.status === 'R' ? 'bg-red-100 text-red-700' : 'bg-slate-100'
                                    }`}>
                                    {permit.status === 'T' && '임시 저장'}
                                    {permit.status === 'A' && '결재 중'}
                                    {permit.status === 'C' && '완료'}
                                    {permit.status === 'R' && '반려'}
                                </span>
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

                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">기본 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">허가번호</Label>
                            <div className="font-medium text-sm">{permit.permitId}</div>
                        </div>
                        <div className="space-y-1 lg:col-span-2">
                            <Label className="text-muted-foreground text-xs">작업명</Label>
                            <div className="font-medium text-sm">{permit.name}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">작업 기간</Label>
                            <div className="font-medium text-sm">{permit.startDt || '-'} ~ {permit.endDt || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">작업 장소</Label>
                            <div className="font-medium text-sm">{permit.location || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">대상 설비</Label>
                            <div className="font-medium text-sm">{permit.equipmentId || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">신청 부서</Label>
                            <div className="font-medium text-sm">{permit.deptId || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs">신청자</Label>
                            <div className="font-medium text-sm">{permit.personName || '-'}</div>
                        </div>

                        <div className="lg:col-span-4 space-y-1">
                            <Label className="text-muted-foreground text-xs">작업 내용</Label>
                            <div className="text-sm bg-slate-50 p-2 rounded whitespace-pre-wrap min-h-[60px]">
                                {permit.workSummary || '-'}
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-1">
                            <Label className="text-muted-foreground text-xs">위험 요인</Label>
                            <div className="font-medium text-sm">{permit.hazardFactor || '-'}</div>
                        </div>
                        <div className="lg:col-span-2 space-y-1">
                            <Label className="text-muted-foreground text-xs">안전 대책</Label>
                            <div className="font-medium text-sm">{permit.safetyFactor || '-'}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* 일반작업 (항상 표시) */}
                <WPValueCard template={WP_TEMPLATES.GEN} permit={permit} />

                {/* 선택된 보충 허가 유형 */}
                {(permit.wpTypes || []).map((type) => {
                    const template = WP_TEMPLATES[type];
                    if (!template) return null;
                    return (
                        <WPValueCard key={type} template={template} permit={permit} />
                    );
                })}
            </div>

            {/* Print Form */}
            <WorkPermitPrint permit={permit} companyName={user?.companyId} approvalSteps={approvalSteps} />
        </div>
    );
}
