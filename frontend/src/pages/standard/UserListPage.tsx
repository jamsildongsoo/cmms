
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { standardService } from '@/services/standardService';
import type { Person } from '@/services/standardService';
import { useToast } from '@/components/ui/use-toast';

export default function UserListPage() {
    const [persons, setPersons] = useState<Person[]>([]);
    const navigate = useNavigate();

    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const fetchPersons = () => {
        standardService.getAll('person').then(data => setPersons(data));
    };

    useEffect(() => {
        fetchPersons();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('사번 ' + id + ' 이 사용자를 정말로 삭제하시겠습니까?')) return;

        try {
            setLoading(true);
            await standardService.delete('person', id);
            toast({ title: "성공", description: "사용자가 삭제되었습니다." });
            fetchPersons();
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "삭제 중 오류가 발생했습니다.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">사용자 관리</h1>
                <Button onClick={() => navigate('/standard/user/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 사용자 등록
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">사용자 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-slate-500">ID</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">이름</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">부서</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">직급</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">이메일</th>
                                    <th className="px-4 py-3 font-medium text-slate-500">권한</th>
                                    <th className="px-4 py-3 font-medium text-slate-500 text-center">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {persons.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">등록된 사용자가 없습니다.</td></tr>
                                ) : (
                                    persons.map((item) => (
                                        <tr
                                            key={item.person_id}
                                            className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/standard/user/${item.person_id}/edit`)}
                                        >
                                            <td className="px-4 py-3 font-medium">{item.person_id}</td>
                                            <td className="px-4 py-3">{item.name}</td>
                                            <td className="px-4 py-3">{item.dept_id || '-'}</td>
                                            <td className="px-4 py-3">{item.position || '-'}</td>
                                            <td className="px-4 py-3">{item.email || '-'}</td>
                                            <td className="px-4 py-3">{item.role_id || '-'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => handleDelete(e, item.person_id)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
        </div>
    );
}
