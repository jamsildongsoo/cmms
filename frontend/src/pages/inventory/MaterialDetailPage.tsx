import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { inventoryService, type Material } from '@/services/inventoryService';
import { Badge } from '@/components/ui/badge';

export default function MaterialDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [material, setMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            inventoryService.getMaterialById(id).then(data => {
                setMaterial(data || null);
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [id]);

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'T': return <Badge variant="secondary">임시저장</Badge>;
            case 'A': return <Badge variant="outline" className="text-blue-600 border-blue-600">결재중</Badge>;
            case 'C': return <Badge className="bg-green-600 hover:bg-green-700">확정</Badge>;
            case 'R': return <Badge variant="destructive">반려</Badge>;
            default: return <Badge variant="secondary">임시저장</Badge>;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">로딩 중...</div>;
    }

    if (!material) {
        return (
            <div className="p-8 text-center text-slate-500">
                <p>자재 정보를 찾을 수 없습니다.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/master/inventory')}>
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
                        <Link to="/master/inventory">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">자재 상세</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            {material.inventoryId}
                            {getStatusBadge(material.status)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/master/inventory">
                            <List className="mr-2 h-4 w-4" /> 목록
                        </Link>
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                        <Link to={`/master/material/${material.inventoryId}/edit`}>
                            <Edit2 className="mr-2 h-4 w-4" /> 수정
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 1. Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Row 1: ID(1) / Name(3) */}
                    <Field label="자재 코드" value={material.inventoryId} />
                    <div className="col-span-1 md:col-span-3">
                        <Field label="자재명" value={material.name} />
                    </div>
                    {/* Row 2: Type(1) / Unit(1) / Dept(2) */}
                    <Field label="자재 유형" value={material.codeItem} />
                    <Field label="기본 단위" value={material.unit} />
                    <div className="col-span-1 md:col-span-2">
                        <Field label="관리 부서" value={material.deptId} />
                    </div>
                </CardContent>
            </Card>

            {/* 2. Specification Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">제원 정보</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Field label="제조사" value={material.makerName} />
                    <Field label="모델명" value={material.model} />
                    <Field label="규격" value={material.spec} />
                    <Field label="시리얼번호" value={material.serial} />
                </CardContent>
            </Card>

            {/* 3. Etc */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">기타</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-slate-500">비고</span>
                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm min-h-[80px] text-slate-900 whitespace-pre-wrap">
                            {material.note || <span className="text-slate-400">비고 없음</span>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
