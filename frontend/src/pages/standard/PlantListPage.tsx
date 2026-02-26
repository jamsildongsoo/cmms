
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { standardService } from '@/services/standardService';
import type { Plant } from '@/services/standardService';
import { useToast } from '@/components/ui/use-toast';

export default function PlantListPage() {
    const [plants, setPlants] = useState<Plant[]>([]);
    const navigate = useNavigate();

    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const loadData = () => {
        standardService.getAll('plant').then(data => setPlants(data));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            setLoading(true);
            await standardService.delete('plant', id);
            toast({ title: "성공", description: "사업장이 삭제되었습니다." });
            loadData();
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "삭제 중 오류가 발생했습니다.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">사업장 관리</h1>
                <Button onClick={() => navigate('/standard/plant/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 사업장 등록
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">사업장 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-slate-500">ID</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">사업장명</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">회사ID</th>
                                    <th className="px-4 py-3 font-medium text-slate-500 text-center">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plants.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">등록된 사업장이 없습니다.</td></tr>
                                ) : (
                                    plants.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/standard/plant/${item.id}/edit`)}
                                        >
                                            <td className="px-4 py-3 font-medium">{item.id}</td>
                                            <td className="px-4 py-3">{item.name}</td>
                                            <td className="px-4 py-3">{item.company_id}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => handleDelete(e, item.id)}
                                                    disabled={loading}
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
