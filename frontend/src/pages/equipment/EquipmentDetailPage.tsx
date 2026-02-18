import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { equipmentService } from '@/services/equipmentService';
import type { Equipment } from '@/types/equipment';

export default function EquipmentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            equipmentService.getById(id).then(data => {
                setEquipment(data || null);
                setLoading(false);
            });
        }
    }, [id]);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'T': 'bg-gray-100 text-gray-800', // Temporary
            'A': 'bg-blue-100 text-blue-800', // Approval
            'O': 'bg-green-100 text-green-800', // Operating (C -> O in some contexts, but let's stick to simple logic or DB values)
            'S': 'bg-yellow-100 text-yellow-800', // Stopped
            'D': 'bg-red-100 text-red-800',   // Discarded
            'OPERATING': 'bg-green-100 text-green-800',
            'STOPPED': 'bg-red-100 text-red-800',
        };
        const labels: Record<string, string> = {
            'T': '임시', 'A': '결재중', 'S': '정지', 'O': '가동', 'D': '폐기',
            'OPERATING': '가동중', 'STOPPED': '정지', 'IDLE': '대기', 'REPAIR': '수리중'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">로딩 중...</div>;
    }

    if (!equipment) {
        return (
            <div className="p-8 text-center text-slate-500">
                <p>설비 정보를 찾을 수 없습니다.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/master/equipment')}>
                    목록으로 돌아가기
                </Button>
            </div>
        );
    }

    // Helper for Read-only field
    const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
        <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm min-h-[40px] flex items-center text-slate-900">
                {value !== undefined && value !== null && value !== '' ? value : <span className="text-slate-400">-</span>}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/master/equipment">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">설비 상세</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            {equipment.equipment_id}
                            {getStatusBadge(equipment.status ?? '')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/master/equipment">
                            <List className="mr-2 h-4 w-4" /> 목록
                        </Link>
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                        <Link to={`/master/equipment/${equipment.equipment_id}/edit`}>
                            <Edit2 className="mr-2 h-4 w-4" /> 수정
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 1. Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>기본 정보 (Basic Information)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Row 1: ID(1) / Name(3) */}
                    <Field label="설비 코드" value={equipment.equipment_id} />
                    <div className="col-span-1 md:col-span-3">
                        <Field label="설비명" value={equipment.name} />
                    </div>
                    {/* Row 2: Type(1) / Dept(1) / Location(2) */}
                    <Field label="설비 유형" value={equipment.code_item} />
                    <Field label="관리 부서" value={equipment.dept_id} />
                    <div className="col-span-1 md:col-span-2">
                        <Field label="설치 위치" value={equipment.install_location} />
                    </div>
                </CardContent>
            </Card>

            {/* 2. Specification Info */}
            <Card>
                <CardHeader>
                    <CardTitle>제원 정보 (Specification)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Row 3: Maker(1) / Model(1) / Spec(1) / Serial(1) */}
                    <Field label="제조사" value={equipment.maker_name} />
                    <Field label="모델명" value={equipment.model} />
                    <Field label="설비 사양" value={equipment.spec} />
                    <Field label="Serial No." value={equipment.serial} />
                </CardContent>
            </Card>

            {/* 3. Financial Info */}
            <Card>
                <CardHeader>
                    <CardTitle>재무 정보 (Financial Info)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Row 4: InstallDate(1) / Cost(1) / Residual(1) / Method(1) / Period(1) */}
                    <Field label="설치 일자" value={equipment.install_date} />
                    <Field label="취득 금액" value={equipment.purchase_cost?.toLocaleString()} />
                    <Field label="잔존 가액" value={equipment.residual_value?.toLocaleString()} />
                    <Field label="상각 방법" value={equipment.depre_method} />
                    <Field label="내용 연수" value={equipment.depre_period ? `${equipment.depre_period}년` : '-'} />
                </CardContent>
            </Card>

            {/* 4. Maintenance / Operational Info */}
            <Card>
                <CardHeader>
                    <CardTitle>보전 정보 (Maintenance Info)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Row 5: PSM / Insp / WP */}
                    <Field label="PSM 대상 여부" value={equipment.psm_yn === 'Y' ? '예 (Yes)' : '아니오 (No)'} />
                    <Field label="예방 점검 대상" value={equipment.inspection_yn === 'Y' ? '예 (Yes)' : '아니오 (No)'} />
                    <Field label="작업허가 대상" value={equipment.workpermit_yn === 'Y' ? '예 (Yes)' : '아니오 (No)'} />

                    {/* Row 6: Interval / Last / Next */}
                    <Field label="표준 점검 주기" value={equipment.inspection_interval ? `${equipment.inspection_interval} ${equipment.inspection_unit === 'MONTH' ? '개월' : equipment.inspection_unit === 'WEEK' ? '주' : '일'}` : '-'} />
                    <Field label="마지막 점검일" value="-" />
                    <Field label="다음 점검일" value="-" />
                </CardContent>
            </Card>

            {/* 5. Etc */}
            <Card>
                <CardHeader>
                    <CardTitle>기타</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-slate-500">비고</span>
                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm min-h-[80px] text-slate-900 whitespace-pre-wrap">
                            {equipment.note || <span className="text-slate-400">비고 없음</span>}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-slate-500">첨부 파일</span>
                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm min-h-[40px] text-slate-900">
                            <span className="text-slate-400">첨부 파일 없음</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
