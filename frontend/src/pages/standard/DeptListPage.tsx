
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { standardService } from '@/services/standardService';
import type { Dept } from '@/services/standardService';

export default function DeptListPage() {
    const [depts, setDepts] = useState<Dept[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        standardService.getAll('dept').then(data => setDepts(data));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">부서 관리</h1>
                <Button onClick={() => navigate('/standard/dept/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 부서 등록
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">부서 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-slate-500">ID</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">부서명</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">회사ID</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">상위부서</th>
                                </tr>
                            </thead>
                            <tbody>
                                {depts.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">등록된 부서가 없습니다.</td></tr>
                                ) : (
                                    depts.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/standard/dept/${item.id}/edit`)}
                                        >
                                            <td className="px-4 py-3 font-medium">{item.id}</td>
                                            <td className="px-4 py-3">{item.name}</td>
                                            <td className="px-4 py-3">{item.company_id}</td>
                                            <td className="px-4 py-3">{item.parent_id || '-'}</td>
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
