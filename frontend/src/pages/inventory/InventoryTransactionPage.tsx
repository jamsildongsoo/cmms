import { useEffect, useState } from 'react';
import { Printer, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { inventoryService } from '@/services/inventoryService';
import type { InventoryTransaction } from '@/services/inventoryService';
import { InventoryVoucherPrint } from '@/components/common/InventoryVoucherPrint';
import { useAuthStore } from '@/features/auth/useAuthStore';

const TX_LABEL: Record<string, string> = {
    IN: '입고', OUT: '출고', MOVE: '이동', MOVE_IN: '이동입고', MOVE_OUT: '이동출고',
    ADJUST: '조정', ADJUST_IN: '조정증가', ADJUST_OUT: '조정감소',
};

export default function InventoryTransactionPage() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [printItems, setPrintItems] = useState<InventoryTransaction[]>([]);
    const companyName = useAuthStore((s) => s.user?.companyId);

    useEffect(() => {
        inventoryService.getAllTransactions().then(setTransactions);
    }, []);

    const filtered = transactions
        .filter(tx => {
            if (typeFilter === 'ALL') return true;
            if (typeFilter === 'MOVE') return tx.type.startsWith('MOVE');
            if (typeFilter === 'ADJUST') return tx.type.startsWith('ADJUST');
            return tx.type === typeFilter;
        })
        .filter(tx => !searchTerm || tx.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handlePrint = (historyId: string) => {
        const group = transactions.filter(tx => tx.history_id === historyId);
        setPrintItems(group);
        setTimeout(() => window.print(), 100);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold tracking-tight">수불 관리</h1>
            </div>

            {/* Transaction Table */}
            <Card className="print:hidden">
                <CardHeader>
                    <CardTitle>수불 이력</CardTitle>
                    <div className="flex items-center space-x-2 pt-4">
                        <Select onValueChange={setTypeFilter} defaultValue="ALL">
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">전체</SelectItem>
                                <SelectItem value="IN">입고</SelectItem>
                                <SelectItem value="OUT">출고</SelectItem>
                                <SelectItem value="MOVE">이동</SelectItem>
                                <SelectItem value="ADJUST">조정</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative w-[250px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="품목명으로 검색"
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="h-12 px-4 font-medium text-slate-500">전표번호</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">일시</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">구분</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재코드</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">품목명</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">규격</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">창고</th>
                                    <th className="h-12 px-4 font-medium text-slate-500 text-right">수량</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">처리자</th>
                                    <th className="h-12 px-4 font-medium text-slate-500 text-center">출력</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((tx, idx) => (
                                    <tr key={`${tx.history_id}-${tx.inventoryId}-${idx}`} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="h-12 px-4 font-mono text-[10px]">{tx.history_id}</td>
                                        <td className="h-12 px-4 text-slate-600">{tx.date}</td>
                                        <td className="h-12 px-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                tx.type === 'IN' || tx.type === 'MOVE_IN' || tx.type === 'ADJUST_IN' ? 'bg-blue-100 text-blue-700' :
                                                tx.type === 'OUT' || tx.type === 'ADJUST_OUT' ? 'bg-red-100 text-red-700' :
                                                tx.type === 'MOVE_OUT' ? 'bg-amber-100 text-amber-700' :
                                                'bg-purple-100 text-purple-700'
                                                }`}>
                                                {TX_LABEL[tx.type] || tx.type}
                                            </span>
                                        </td>
                                        <td className="h-12 px-4 font-mono text-xs">{tx.inventoryId}</td>
                                        <td className="h-12 px-4 font-medium">{tx.name}</td>
                                        <td className="h-12 px-4 text-slate-600">{tx.spec}</td>
                                        <td className="h-12 px-4">{tx.storage}</td>
                                        <td className="h-12 px-4 text-right font-bold">{tx.qty} {tx.unit}</td>
                                        <td className="h-12 px-4">{tx.user}</td>
                                        <td className="h-12 px-4 text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handlePrint(tx.history_id)}
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <InventoryVoucherPrint items={printItems} companyName={companyName} />
        </div>
    );
}
