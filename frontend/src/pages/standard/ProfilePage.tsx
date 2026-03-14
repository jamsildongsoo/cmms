import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { standardService, type Person, type Dept } from '@/services/standardService';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Dept[]>([]);

    const { register, handleSubmit, setValue } = useForm<Person>();

    useEffect(() => {
        standardService.getAll('dept').then(setDepartments);

        if (user) {
            Object.keys(user).forEach(key => {
                setValue(key as keyof Person, (user as any)[key]);
            });
        }
    }, [user, setValue]);

    const onSubmit = async (data: Person) => {
        try {
            setLoading(true);
            await standardService.update('person', data.personId, data);
            toast({ title: "성공", description: "개인 정보가 수정되었습니다." });
            // Update local user state if needed, but standardService.update doesn't return the full updated user for store
            // For now, redirect or just show success
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const deptName = departments.find(d => d.deptId === user?.deptId)?.name || user?.deptId || '부서 미지정';

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">개인 정보 수정</h1>
                        <p className="text-muted-foreground">사용자 본인의 정보를 관리합니다.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/password')}>비밀번호 변경</Button>
                    <Button type="submit" form="profile-form" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                            {user?.name?.[0] || '?'}
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">{user?.name} ({user?.personId})</CardTitle>
                            <CardDescription>{deptName} / {user?.position || '직급 정보 없음'}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>성명</Label>
                            <Input {...register('name', { required: true })} disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>사번</Label>
                            <Input {...register('personId')} disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>이메일</Label>
                            <Input type="email" {...register('email')} placeholder="email@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>전화번호</Label>
                            <Input {...register('phone')} placeholder="010-0000-0000" />
                        </div>
                        <div className="space-y-2">
                            <Label>직급/직책</Label>
                            <Input {...register('position')} placeholder="직급/직책" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>비고</Label>
                            <Textarea {...register('note')} placeholder="특이사항 입력" />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
