
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CheckCircle } from 'lucide-react';
import { workPermitService } from '@/services/workPermitService';
import type { WorkPermit } from '@/types/workPermit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Label } from '@/components/ui/label';

import { useToast } from '@/components/ui/use-toast';

export default function WorkPermitDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [permit, setPermit] = useState<WorkPermit | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        workPermitService.getById(id).then(data => {
            setPermit(data || null);
            setLoading(false);
        });
    }, [id]);

    const handleApprove = async () => {
        try {
            if (id) {
                await workPermitService.update(id, { status: 'C' });
                toast({ title: "승인 완료", description: "작업 허가가 승인되었습니다." });
                const updated = await workPermitService.getById(id);
                setPermit(updated || null);
            }
        } catch (e) {
            toast({ title: "오류", description: "승인 처리 중 오류 발생", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-8 text-center">로딩 중...</div>;
    if (!permit) return <div className="p-8 text-center text-red-500">데이터를 찾을 수 없습니다.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/wp/work-permit')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">허가서 상세 ({permit.permit_id})</h1>
                        <div className="flex items-center gap-2">
                            {(permit.wp_types || []).map(type => (
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
                                </span>
                            ))}
                            <span className="text-muted-foreground ml-2">| {permit.name}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/wp/work-permit')}>목록</Button>
                    <Button variant="outline" onClick={() => navigate(`/wp/work-permit/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> 신청 수정
                    </Button>
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
                            <div className="font-medium">{permit.start_dt || '-'} ~ {permit.end_dt || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">작업 장소</Label>
                            <div>{permit.location || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">대상 설비</Label>
                            <div>{permit.equipment_name || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">신청 부서 / 신청자</Label>
                            <div>{permit.dept_id || '-'} / {permit.person_name}</div>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                            <Label className="text-muted-foreground">작업 내용</Label>
                            <div className="bg-slate-50 p-3 rounded-md text-sm whitespace-pre-wrap min-h-[60px]">
                                {permit.description || "내용 없음"}
                            </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="md:col-span-2 border-t pt-4 mt-2 border-b pb-4">
                            <h3 className="font-semibold mb-3">위험성 평가</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block text-xs">작업 개요</span>
                                    <span>{permit.work_summary || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">위험 요인</span>
                                    <span>{permit.hazard_factor || '-'}</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-muted-foreground block text-xs">안전 대책</span>
                                    <span>{permit.safety_factor || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Common Safety Checks (Mandatory) */}
                        <div className="md:col-span-2 space-y-2">
                            <Label className="font-semibold">공통 안전 점검 (필수)</Label>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className={`flex items-center gap-2 p-2 rounded border ${permit.checksheet_json_com?.check_ppe ? 'bg-green-50 border-green-200' : 'bg-slate-50'}`}>
                                    <CheckCircle className={`h-4 w-4 ${permit.checksheet_json_com?.check_ppe ? 'text-green-600' : 'text-slate-300'}`} />
                                    <span>개인보호구 착용</span>
                                </div>
                                <div className={`flex items-center gap-2 p-2 rounded border ${permit.checksheet_json_com?.check_edu ? 'bg-green-50 border-green-200' : 'bg-slate-50'}`}>
                                    <CheckCircle className={`h-4 w-4 ${permit.checksheet_json_com?.check_edu ? 'text-green-600' : 'text-slate-300'}`} />
                                    <span>작업 전 안전교육(TBM)</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Special Work Cards */}
                <div className="md:col-span-2 space-y-4">
                    {permit.wp_types?.includes('HOT') && (
                        <Card className="border-red-200 bg-red-50/10">
                            <CardHeader className="pb-3 border-b border-red-100">
                                <CardTitle className="text-base text-red-700">🔥 화기 작업 정보</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block text-xs">화재 감시자</span>
                                    <span>{permit.checksheet_json_hot?.fire_watcher || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">소화기 비치</span>
                                    <span>{permit.checksheet_json_hot?.fire_extinguisher ? '완료' : '미비치'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {permit.wp_types?.includes('CONF') && (
                        <Card className="border-blue-200 bg-blue-50/10">
                            <CardHeader className="pb-3 border-b border-blue-100">
                                <CardTitle className="text-base text-blue-700">💨 밀폐 공간 측정 기록</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block text-xs">O2</span>
                                    <span>{permit.checksheet_json_conf?.gas_o2 || '-'} %</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">CO</span>
                                    <span>{permit.checksheet_json_conf?.gas_co || '-'} ppm</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">H2S</span>
                                    <span>{permit.checksheet_json_conf?.gas_h2s || '-'} ppm</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">LEL</span>
                                    <span>{permit.checksheet_json_conf?.gas_lel || '-'} %</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Approval & History (Right Column) - Moved below dynamic cards in mobile, or stick to right in desktop */}
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
                                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                                            허가 승인
                                        </Button>
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
                                <li>신청: {permit.person_name} (2025-05-20 09:00)</li>
                                {permit.status === 'C' && <li>승인: 관리자 (2025-05-20 10:00)</li>}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
