import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { inventoryService } from '@/services/inventoryService';
import type { Material } from '@/services/inventoryService';

export default function MaterialMasterPage() {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<Material[]>([]);

    useEffect(() => {
        inventoryService.getAllMaterials().then(setMaterials);
    }, []);

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
                                    <th className="h-12 px-4 font-medium text-slate-500">규격</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">단위</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재유형</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">제조사</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-4 text-slate-500">데이터가 없습니다.</td></tr>
                                ) : (
                                    materials.map((item) => (
                                        <tr
                                            key={item.inventory_id}
                                            className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/master/material/${item.inventory_id}/edit`)}
                                        >
                                            <td className="h-12 px-4 font-mono text-xs">{item.inventory_id}</td>
                                            <td className="h-12 px-4 font-medium">{item.name}</td>
                                            <td className="h-12 px-4 text-slate-600">{item.spec || '-'}</td>
                                            <td className="h-12 px-4">{item.unit}</td>
                                            <td className="h-12 px-4">{item.code_item || '-'}</td>
                                            <td className="h-12 px-4">{item.maker_name || '-'}</td>
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
