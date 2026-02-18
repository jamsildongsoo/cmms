import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { standardService, type Warehouse, type Plant } from '@/services/standardService';

export default function WarehouseListPage() {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [plants, setPlants] = useState<Plant[]>([]);

    // Filter State
    const [selectedPlantId, setSelectedPlantId] = useState<string>("ALL");

    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [warehouseData, plantData] = await Promise.all([
            standardService.getAll('warehouse'),
            standardService.getAll('plant')
        ]);
        setWarehouses(warehouseData);
        setPlants(plantData);
    };

    const filteredWarehouses = selectedPlantId === "ALL"
        ? warehouses
        : warehouses.filter(w => w.plant_id === selectedPlantId);

    const handleDelete = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await standardService.delete('warehouse', id);
            toast({ title: "성공", description: "삭제되었습니다." });
            loadData();
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "삭제 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    const getPlantName = (plantId: string) => {
        return plants.find(p => p.id === plantId)?.name || plantId;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">창고 관리</h1>
                    <p className="text-muted-foreground">자재를 보관하는 창고를 관리합니다.</p>
                </div>
                <Button onClick={() => navigate('/standard/warehouse/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 창고 등록
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">창고 목록</CardTitle>
                        <div className="w-[200px]">
                            <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="사업장 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">전체 사업장</SelectItem>
                                    {plants.map(plant => (
                                        <SelectItem key={plant.id} value={plant.id}>{plant.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-slate-500 w-[15%]">ID</th>
                                    <th className="px-4 py-3 font-medium text-slate-500 w-[20%]">창고명</th>
                                    <th className="px-4 py-3 font-medium text-slate-500 w-[20%]">사업장</th>
                                    <th className="px-4 py-3 font-medium text-slate-500 w-[30%]">위치 상세</th>
                                    <th className="px-4 py-3 font-medium text-slate-500 w-[15%] text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredWarehouses.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">등록된 창고가 없습니다.</td></tr>
                                ) : (
                                    filteredWarehouses.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50 cursor-pointer"
                                            onClick={() => navigate(`/standard/warehouse/${item.id}/edit`)}
                                        >
                                            <td className="px-4 py-3 font-mono text-slate-600">{item.id}</td>
                                            <td className="px-4 py-3 font-medium">{item.name}</td>
                                            <td className="px-4 py-3">{getPlantName(item.plant_id)}</td>
                                            <td className="px-4 py-3 text-slate-600">{item.location || '-'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
