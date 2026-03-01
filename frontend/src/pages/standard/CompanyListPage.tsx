
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { standardService } from '@/services/standardService';
import type { Company } from '@/services/standardService';

export default function CompanyListPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        standardService.getAll('company').then(data => setCompanies(data));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">회사 관리</h1>
                <Button onClick={() => navigate('/standard/company/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 회사 등록
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">회사 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-slate-500">ID</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">회사명</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">사업자번호</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">이메일</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">전화번호</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">등록된 회사가 없습니다.</td></tr>
                                ) : (
                                    companies.map((item) => (
                                        <tr
                                            key={item.companyId}
                                            className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/standard/company/${item.companyId}/edit`)}
                                        >
                                            <td className="px-4 py-3 font-medium">{item.companyId}</td>
                                            <td className="px-4 py-3">{item.name}</td>
                                            <td className="px-4 py-3">{item.bizno || '-'}</td>
                                            <td className="px-4 py-3">{item.email || '-'}</td>
                                            <td className="px-4 py-3">{item.phone || '-'}</td>
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
