import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { inventoryService } from '@/services/inventoryService';
import type { InventoryTransaction } from '@/services/inventoryService';

export default function InventoryTransactionPage() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        inventoryService.getAllTransactions().then(setTransactions);
    }, []);

    const filtered = transactions
        .filter(tx => typeFilter === 'ALL' || tx.type === typeFilter)
        .filter(tx => !searchTerm || tx.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">수불 관리</h1>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">구분</span>
                    <Select onValueChange={setTypeFilter} defaultValue="ALL">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">전체</SelectItem>
                            <SelectItem value="IN">입고</SelectItem>
                            <SelectItem value="OUT">출고</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">품목 검색</span>
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="품목명으로 검색"
                    />
                </div>
            </div>

            {/* Transaction Table */}
            <Card>
                <CardHeader>
                    <CardTitle>수불 이력</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="h-12 px-4 font-medium text-slate-500">일시</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">구분</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재코드</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">품목명</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">규격</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">창고</th>
                                    <th className="h-12 px-4 font-medium text-slate-500 text-right">수량</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">처리자</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">참조</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((tx) => (
                                    <tr key={tx.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="h-12 px-4 text-slate-600">{tx.date}</td>
                                        <td className="h-12 px-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${tx.type === 'IN' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {tx.type === 'IN' ? '입고' : '출고'}
                                            </span>
                                        </td>
                                        <td className="h-12 px-4 font-mono text-xs">{tx.inventory_id}</td>
                                        <td className="h-12 px-4 font-medium">{tx.name}</td>
                                        <td className="h-12 px-4 text-slate-600">{tx.spec}</td>
                                        <td className="h-12 px-4">{tx.storage}</td>
                                        <td className="h-12 px-4 text-right font-bold">{tx.qty} {tx.unit}</td>
                                        <td className="h-12 px-4">{tx.user}</td>
                                        <td className="h-12 px-4 text-slate-500 text-xs">{tx.ref}</td>
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
