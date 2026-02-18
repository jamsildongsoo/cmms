
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { workPermitService } from '@/services/workPermitService';
import type { WorkPermit } from '@/types/workPermit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WorkPermitListPage() {
    const [permits, setPermits] = useState<WorkPermit[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'REQ' | 'APR'>('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        const data = await workPermitService.getAll(filter);
        setPermits(data);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'T': 'bg-gray-100 text-gray-800',
            'A': 'bg-blue-100 text-blue-800', // Approval Pending
            'C': 'bg-green-100 text-green-800' // Approved/Completed
        };
        const labels: Record<string, string> = { 'T': '임시', 'A': '승인대기', 'C': '승인완료' };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getWpTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            'HOT': 'bg-red-100 text-red-700 border-red-200',
            'CONF': 'bg-orange-100 text-orange-700 border-orange-200',
            'ELEC': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'HIGH': 'bg-blue-100 text-blue-700 border-blue-200',
            'DIG': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
        const labels: Record<string, string> = {
            'HOT': '화기', 'CONF': '밀폐', 'ELEC': '전기',
            'HIGH': '고소', 'DIG': '굴착', 'HEVY': '중량', 'GEN': '일반'
        };
        return (
            <span className={`px-2 py-0.5 rounded border text-xs font-bold ${styles[type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {labels[type] || type}
            </span>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">작업허가서</h1>
                    <p className="text-muted-foreground">위험 작업 승인 및 안전 조치 사항을 관리합니다.</p>
                </div>
                <Button onClick={() => navigate('/wp/work-permit/new')} className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> 허가 신청
                </Button>
            </div>

            <Tabs defaultValue="ALL" className="w-full" onValueChange={(val) => setFilter(val as any)}>
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="ALL">전체</TabsTrigger>
                        <TabsTrigger value="REQ">신청</TabsTrigger>
                        <TabsTrigger value="APR">승인</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center space-x-2">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="작업명 또는 신청자 검색..." className="pl-9 h-9" />
                        </div>
                        <Button variant="outline" size="sm">검색</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">허가 신청 목록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-slate-500">허가번호</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">유형</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">작업명</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">작업기간</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">신청자</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">상태</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 text-center">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permits.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                                등록된 작업 허가 신청이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        permits.map(wp => (
                                            <tr
                                                key={wp.permit_id}
                                                className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/wp/work-permit/${wp.permit_id}`)}
                                            >
                                                <td className="px-4 py-3 font-medium">{wp.permit_id}</td>
                                                <td className="px-4 py-3">{getWpTypeBadge(wp.wp_type)}</td>
                                                <td className="px-4 py-3">{wp.name}</td>
                                                <td className="px-4 py-3 text-xs text-slate-600">
                                                    <div>{wp.start_dt ? wp.start_dt.split(' ')[0] : '-'}</div>
                                                    <div className="text-slate-400">~ {wp.end_dt ? wp.end_dt.split(' ')[0] : '-'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{wp.person_name}</td>
                                                <td className="px-4 py-3">{getStatusBadge(wp.status)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-blue-600 hover:text-blue-800"
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/wp/work-permit/${wp.permit_id}`); }}
                                                    >
                                                        상세/승인
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
            </Tabs>
        </div>
    );
}
