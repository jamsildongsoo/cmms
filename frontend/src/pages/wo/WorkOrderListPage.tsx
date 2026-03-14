
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { workOrderService } from '@/services/workOrderService';
import type { WorkOrder } from '@/types/workOrder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WorkOrderListPage() {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'PLN' | 'ACT'>('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        const data = await workOrderService.getAll();
        // Sort by ID (Descending)
        let filtered = [...data].sort((a, b) => b.orderId.localeCompare(a.orderId));

        if (filter !== 'ALL') {
            filtered = filtered.filter(wo => wo.stage === filter);
        }

        setWorkOrders(filtered);
    };

    const getStageBadge = (stage?: string) => {
        const labels: Record<string, string> = { 'PLN': '계획', 'ACT': '실적' };
        const styles: Record<string, string> = {
            'PLN': 'bg-blue-50 text-blue-700 border-blue-200',
            'ACT': 'bg-purple-50 text-purple-700 border-purple-200'
        };
        return (
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${styles[stage || ""] || 'bg-gray-100'}`}>
                {labels[stage || ""] || stage || '-'}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'T': 'bg-slate-100 text-slate-800 border-slate-200',
            'A': 'bg-orange-100 text-orange-800 border-orange-200',
            'C': 'bg-green-100 text-green-800 border-green-200',
            'REQ': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'R': 'bg-red-100 text-red-800 border-red-200'
        };
        const labels: Record<string, string> = {
            'T': '임시',
            'A': '결재중',
            'C': '완료',
            'REQ': '요청',
            'R': '반려'
        };
        return (
            <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">작업지시 관리</h1>
                    <p className="text-muted-foreground">설비 고장 수리 및 작업 요청을 관리합니다.</p>
                </div>
                <Button onClick={() => navigate('/wo/work-order/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 작업 요청 등록
                </Button>
            </div>

            <Tabs defaultValue="ALL" className="w-full" onValueChange={(val) => setFilter(val as any)}>
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="ALL">전체</TabsTrigger>
                        <TabsTrigger value="PLN">계획</TabsTrigger>
                        <TabsTrigger value="ACT">실적</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center space-x-2">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="작업명 또는 설비 검색..." className="pl-9 h-9" />
                        </div>
                        <Button variant="outline" size="sm">검색</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">작업 목록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-slate-500 w-20">구분</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">지시번호</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">작업명</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">설비번호</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">작업일자</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">담당자</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 text-center">상태</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 text-center">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                                등록된 작업 내역이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        workOrders.map(wo => (
                                            <tr
                                                key={wo.orderId}
                                                className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/wo/work-order/${wo.orderId}`)}
                                            >
                                                <td className="px-4 py-3">{getStageBadge(wo.stage)}</td>
                                                <td className="px-4 py-3 font-medium">{wo.orderId}</td>
                                                <td className="px-4 py-3">{wo.name}</td>
                                                <td className="px-4 py-3 text-slate-600">{wo.equipmentId || '-'}</td>
                                                <td className="px-4 py-3 text-slate-600">{wo.date}</td>
                                                <td className="px-4 py-3 text-slate-600">{wo.personName || wo.personId || '-'}</td>
                                                <td className="px-4 py-3 text-center">{getStatusBadge(wo.status || "")}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {wo.stage === 'PLN' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className={`h-8 px-2 ${wo.status === 'C' ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-slate-400 border-slate-200'}`}
                                                                disabled={wo.status !== 'C'}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/wo/work-order/result/new?refEntity=WO&refId=${wo.orderId}`);
                                                                }}
                                                            >
                                                                실적 입력
                                                            </Button>
                                                        )}
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
            </Tabs>
        </div>
    );
}
