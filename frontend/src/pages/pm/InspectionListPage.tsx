
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { inspectionService } from '@/services/inspectionService';
import type { Inspection } from '@/types/inspection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InspectionListPage() {
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'PLN' | 'ACT'>('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        loadInspections();
    }, [filter]);

    const loadInspections = async () => {
        const data = await inspectionService.getAll(filter);
        // Sort by ID (Descending)
        const sortedData = [...data].sort((a, b) => b.inspectionId.localeCompare(a.inspectionId));
        setInspections(sortedData);
    };

    const getStageBadge = (stage: string) => {
        const labels: Record<string, string> = { 'PLN': '계획', 'ACT': '실적' };
        const styles: Record<string, string> = {
            'PLN': 'bg-blue-50 text-blue-700 border-blue-200',
            'ACT': 'bg-purple-50 text-purple-700 border-purple-200'
        };
        return (
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${styles[stage] || 'bg-gray-100'}`}>
                {labels[stage] || stage}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'T': 'bg-slate-100 text-slate-800 border-slate-200',
            'A': 'bg-orange-100 text-orange-800 border-orange-200',
            'S': 'bg-blue-100 text-blue-800 border-blue-200',
            'P': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'C': 'bg-green-100 text-green-800 border-green-200',
            'R': 'bg-red-100 text-red-800 border-red-200'
        };
        const labels: Record<string, string> = {
            'T': '임시',
            'A': '결재중',
            'S': '계획',
            'P': '진행',
            'C': '완료',
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
                    <h1 className="text-2xl font-bold tracking-tight">점검 목록</h1>
                    <p className="text-muted-foreground">설비별 점검 계획 및 실적을 관리합니다.</p>
                </div>
                <Button onClick={() => navigate('/pm/inspection/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 점검 계획 등록
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
                            <Input placeholder="점검명 또는 설비 검색..." className="pl-9 h-9" />
                        </div>
                        <Button variant="outline" size="sm">검색</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">점검 목록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-slate-500 w-20">구분</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">ID</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">점검명</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">대상설비</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">작업일자</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">담당자</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 text-center">상태</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 text-center">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inspections.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                                등록된 점검 내역이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        inspections.map(plan => (
                                            <tr
                                                key={plan.inspectionId}
                                                className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/pm/inspection/${plan.inspectionId}`)}
                                            >
                                                <td className="px-4 py-3">{getStageBadge(plan.stage)}</td>
                                                <td className="px-4 py-3 font-medium">{plan.inspectionId}</td>
                                                <td className="px-4 py-3">{plan.name}</td>
                                                <td className="px-4 py-3 text-slate-600">{plan.equipmentName}</td>
                                                <td className="px-4 py-3 text-slate-600">{plan.date}</td>
                                                <td className="px-4 py-3 text-slate-600">{plan.personName}</td>
                                                <td className="px-4 py-3 text-center">{getStatusBadge(plan.status)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {plan.stage === 'PLN' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className={`h-8 px-2 ${plan.status === 'C' ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-slate-400 border-slate-200'}`}
                                                                disabled={plan.status !== 'C'}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/pm/inspection/result/new?refEntity=IN&refId=${plan.inspectionId}`);
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
