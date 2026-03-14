import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wrench, ClipboardCheck, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { equipmentService } from '@/services/equipmentService';
import { inspectionService } from '@/services/inspectionService';
import type { Equipment } from '@/types/equipment';
import type { Inspection } from '@/types/inspection';

export default function EquipmentQrLandingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [pendingPlans, setPendingPlans] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        Promise.all([
            equipmentService.getById(id),
            inspectionService.getAll('PLN'),
        ]).then(([eq, plans]) => {
            setEquipment(eq || null);
            setPendingPlans(plans.filter(p => p.equipmentId === id && p.status === 'C'));
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-slate-500">설비를 찾을 수 없습니다.</p>
                <Button variant="outline" onClick={() => navigate('/')}>홈으로</Button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-6 py-8 px-4">
            {/* Equipment Summary */}
            <Card>
                <CardContent className="pt-6 space-y-2">
                    <p className="text-xs text-muted-foreground font-mono">{equipment.equipmentId}</p>
                    <h1 className="text-xl font-bold">{equipment.name}</h1>
                    <div className="grid grid-cols-2 gap-y-1 text-sm text-slate-600 pt-2">
                        {equipment.codeItem && <p>유형: {equipment.codeItem}</p>}
                        {equipment.installLocation && <p>위치: {equipment.installLocation}</p>}
                        {equipment.makerName && <p>제조사: {equipment.makerName}</p>}
                        {equipment.model && <p>모델: {equipment.model}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
                <Button
                    variant="outline"
                    className="w-full h-14 justify-between text-base"
                    onClick={() => navigate(`/master/equipment/${id}`)}
                >
                    <span className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-blue-600" />
                        설비 상세 조회
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                </Button>

                {pendingPlans.length > 0 ? (
                    pendingPlans.map(plan => (
                        <Button
                            key={plan.inspectionId}
                            variant="outline"
                            className="w-full h-14 justify-between text-base"
                            onClick={() => navigate(`/pm/inspection/result/new?refEntity=IN&refId=${plan.inspectionId}`)}
                        >
                            <span className="flex items-center gap-3">
                                <ClipboardCheck className="h-5 w-5 text-green-600" />
                                <span className="text-left">
                                    <span className="block">점검 실적 입력</span>
                                    <span className="block text-xs text-muted-foreground font-normal">{plan.name} ({plan.date})</span>
                                </span>
                            </span>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        </Button>
                    ))
                ) : (
                    <div className="w-full h-14 flex items-center gap-3 px-4 border rounded-md bg-slate-50 text-slate-400">
                        <ClipboardCheck className="h-5 w-5" />
                        <span>대기 중인 점검 계획이 없습니다</span>
                    </div>
                )}
            </div>
        </div>
    );
}
