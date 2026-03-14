import { useEffect, useState } from 'react';
import { Search, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { inventoryService } from '@/services/inventoryService';
import type { InventoryStockItem } from '@/services/inventoryService';
import { InventoryStockPrint } from '@/components/common/InventoryStockPrint';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function InventoryStatusPage() {
    const [stockList, setStockList] = useState<InventoryStockItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const companyName = useAuthStore((s) => s.user?.companyId);

    useEffect(() => {
        setIsLoading(true);
        inventoryService.getStock()
            .then(setStockList)
            .finally(() => setIsLoading(false));
    }, []);

    const filteredList = stockList.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.inventoryId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold tracking-tight">재고 현황</h1>
                <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" /> 출력
                </Button>
            </div>

            <Card className="print:hidden">
                <CardHeader>
                    <CardTitle>자재 재고</CardTitle>
                    <div className="flex items-center space-x-2 pt-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="자재명 또는 코드 검색..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[900px]">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재코드</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">품명</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">규격</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">창고</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">BIN</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">위치</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">단위</th>
                                    <th className="h-12 px-4 font-medium text-slate-500 text-right">수량</th>
                                    <th className="h-12 px-4 font-medium text-slate-500 text-right">금액</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={9} className="h-24 text-center text-slate-500">로딩 중...</td>
                                    </tr>
                                ) : filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="h-24 text-center text-slate-500">데이터가 없습니다.</td>
                                    </tr>
                                ) : (
                                    filteredList.map((item, idx) => (
                                        <tr key={`${item.inventoryId}-${item.storageId}-${item.binId}-${item.locationId}-${idx}`}
                                            className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="h-12 px-4 font-mono text-xs">{item.inventoryId}</td>
                                            <td className="h-12 px-4 font-medium">{item.name}</td>
                                            <td className="h-12 px-4 text-slate-600">{item.spec || '-'}</td>
                                            <td className="h-12 px-4">{item.storageName || '-'}</td>
                                            <td className="h-12 px-4">{item.binName || '-'}</td>
                                            <td className="h-12 px-4">{item.locationName || '-'}</td>
                                            <td className="h-12 px-4">{item.unit || '-'}</td>
                                            <td className="h-12 px-4 text-right font-bold">{item.qty.toLocaleString()}</td>
                                            <td className="h-12 px-4 text-right">{item.amount > 0 ? item.amount.toLocaleString() : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <InventoryStockPrint items={filteredList} companyName={companyName} />
        </div>
    );
}
