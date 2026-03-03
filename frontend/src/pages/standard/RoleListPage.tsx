import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { standardService } from '@/services/standardService';
import type { Role } from '@/services/standardService';

export default function RoleListPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        standardService.getAll('role').then(data => setRoles(data));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">권한 관리</h1>
                <Button onClick={() => navigate('/standard/role/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 권한 등록
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">권한 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-slate-500">권한 ID</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">권한명</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">비고/설명</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.length === 0 ? (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">등록된 권한이 없습니다.</td></tr>
                                ) : (
                                    roles.map((item) => (
                                        <tr
                                            key={item.roleId}
                                            className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/standard/role/${item.roleId}/edit`)}
                                        >
                                            <td className="px-4 py-3 font-medium">{item.roleId}</td>
                                            <td className="px-4 py-3">{item.name}</td>
                                            <td className="px-4 py-3">{item.note || '-'}</td>
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
