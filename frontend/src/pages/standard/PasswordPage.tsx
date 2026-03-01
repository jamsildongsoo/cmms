import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/features/auth/useAuthStore';
import api from '@/utils/api';

export default function PasswordPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const newPassword = watch('newPassword');

    const onSubmit = async (data: any) => {
        if (data.newPassword !== data.confirmPassword) {
            toast({ title: "오류", description: "새 비밀번호가 일치하지 않습니다.", variant: "destructive" });
            return;
        }

        try {
            setLoading(true);
            await api.post(`/api/std/persons/${user?.companyId}/${user?.personId}/password`, {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast({ title: "성공", description: "비밀번호가 변경되었습니다." });
            reset();
            navigate('/profile');
        } catch (error: any) {
            console.error(error);
            toast({
                title: "오류",
                description: error.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">비밀번호 변경</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <ShieldCheck className="h-8 w-8 text-blue-600 mb-2" />
                        <CardTitle>보안 설정</CardTitle>
                        <CardDescription>보안을 위해 비밀번호를 주기적으로 변경해 주세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">현재 비밀번호</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                {...register('currentPassword', { required: '현재 비밀번호를 입력해주세요.' })}
                            />
                            {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">새 비밀번호</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                {...register('newPassword', {
                                    required: '새 비밀번호를 입력해주세요.',
                                    minLength: { value: 4, message: '최소 4자 이상 입력해주세요.' }
                                })}
                            />
                            {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword', {
                                    required: '비밀번호 확인을 입력해주세요.',
                                    validate: value => value === newPassword || '비밀번호가 일치하지 않습니다.'
                                })}
                            />
                            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                            {loading ? "변경 중..." : "비밀번호 변경"}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
