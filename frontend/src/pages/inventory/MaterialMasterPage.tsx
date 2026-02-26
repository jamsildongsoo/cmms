import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { inventoryService } from '@/services/inventoryService';
import type { Material } from '@/services/inventoryService';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

export default function MaterialMasterPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<Material[]>([]);

    const loadMaterials = async () => {
        inventoryService.getAllMaterials().then(setMaterials);
    };

    useEffect(() => {
        loadMaterials();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("정말로 이 자재를 삭제하시겠습니까?")) return;

        try {
            await inventoryService.deleteMaterial(id);
            toast({ title: "성공", description: "자재가 삭제되었습니다." });
            loadMaterials();
        } catch (error) {
            console.error("Failed to delete material", error);
            toast({ title: "오류", description: "자재 삭제 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'T': return <Badge variant="secondary">임시저장</Badge>;
            case 'A': return <Badge variant="outline" className="text-blue-600 border-blue-600">결재중</Badge>;
            case 'C': return <Badge className="bg-green-600 hover:bg-green-700">확정</Badge>;
            case 'R': return <Badge variant="destructive">반려</Badge>;
            default: return <Badge variant="secondary">임시저장</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">자재 마스터</h1>
                <Button onClick={() => navigate('/master/material/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 자재 등록
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>자재 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재코드</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재명</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">상태</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">규격</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">단위</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재유형</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">제조사</th>
                                    <th className="h-12 px-4 font-center font-medium text-slate-500">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-4 text-slate-500">데이터가 없습니다.</td></tr>
                                ) : (
                                    materials.map((item) => (
                                        <tr
                                            key={item.inventory_id}
                                            className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/master/material/${item.inventory_id}/edit`)}
                                        >
                                            <td className="h-12 px-4 font-mono text-xs">{item.inventory_id}</td>
                                            <td className="h-12 px-4 font-medium">{item.name}</td>
                                            <td className="h-12 px-4">{getStatusBadge(item.status)}</td>
                                            <td className="h-12 px-4 text-slate-600">{item.spec || '-'}</td>
                                            <td className="h-12 px-4">{item.unit}</td>
                                            <td className="h-12 px-4">{item.code_item || '-'}</td>
                                            <td className="h-12 px-4">{item.maker_name || '-'}</td>
                                            <td className="h-12 px-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => handleDelete(e, item.inventory_id!)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
