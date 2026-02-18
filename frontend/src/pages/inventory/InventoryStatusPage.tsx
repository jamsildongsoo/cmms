import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { inventoryService } from '@/services/inventoryService';
import type { Material } from '@/services/inventoryService';

export default function InventoryStatusPage() {
    const [inventory, setInventory] = useState<Material[]>([]);

    useEffect(() => {
        inventoryService.getAllMaterials().then(setInventory);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">재고 현황</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">총 품목 수</div>
                        <div className="text-2xl font-bold">{inventory.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">총 재고 금액</div>
                        <div className="text-2xl font-bold">-</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">창고 수</div>
                        <div className="text-2xl font-bold">3</div>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle>자재 현황</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재코드</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">품명</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">규격</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">분류</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">단위</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">제조사</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item) => (
                                    <tr key={item.inventory_id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="h-12 px-4 font-mono text-xs">{item.inventory_id}</td>
                                        <td className="h-12 px-4 font-medium">{item.name}</td>
                                        <td className="h-12 px-4 text-slate-600">{item.spec || '-'}</td>
                                        <td className="h-12 px-4">{item.code_item || '-'}</td>
                                        <td className="h-12 px-4">{item.unit}</td>
                                        <td className="h-12 px-4">{item.maker_name || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
