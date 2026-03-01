
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { standardService } from '@/services/standardService';
import type { Person, Dept } from '@/services/standardService';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useAuthStore } from '@/features/auth/useAuthStore';


export default function UserRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const isEditMode = !!id;

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Person>();

    // Department data for SearchableSelect
    const [departments, setDepartments] = useState<Dept[]>([]);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        standardService.getAll('dept').then(setDepartments);
    }, []);

    useEffect(() => {
        if (user?.companyId) {
            setValue('companyId', user.companyId);
        }
    }, [user, setValue]);

    useEffect(() => {
        if (isEditMode && id) {
            standardService.getById('person', id).then((data: Person) => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof Person, data[key as keyof Person]);
                    });
                }
            });
        }
    }, [id, isEditMode, setValue]);

    const onSubmit = async (data: Person) => {
        try {
            if (isEditMode && id) {
                await standardService.update('person', id, data);
                toast({ title: "성공", description: "사용자 정보가 수정되었습니다." });
            } else {
                await standardService.create('person', data);
                toast({ title: "성공", description: "사용자가 등록되었습니다." });
            }
            navigate('/standard/user');
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/standard/user')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '사용자 수정' : '사용자 등록'}</h1>
                        <p className="text-muted-foreground">{isEditMode ? '기존 사용자 정보를 수정합니다.' : '신규 사용자를 등록합니다.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/standard/user')}>취소</Button>
                    <Button type="submit" form="user-form" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">사용자 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="personId">사번 (ID) <span className="text-red-500">*</span></Label>
                            <Input id="personId" {...register('personId', { required: '사번은 필수입니다.' })} placeholder="사번 입력" disabled={isEditMode} className={isEditMode ? 'bg-slate-50' : ''} />
                            {errors.personId && <span className="text-xs text-red-500">{errors.personId.message}</span>}
                        </div>
                        {!isEditMode && (
                            <div className="space-y-2">
                                <Label htmlFor="passwordHash">초기 비밀번호 <span className="text-red-500">*</span></Label>
                                <Input id="passwordHash" type="password" {...register('passwordHash', { required: '초기 비밀번호는 필수입니다.' })} placeholder="비밀번호 입력" />
                                {errors.passwordHash && <span className="text-xs text-red-500">{errors.passwordHash.message}</span>}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">성명 <span className="text-red-500">*</span></Label>
                            <Input id="name" {...register('name', { required: '성명은 필수입니다.' })} placeholder="성명 입력" />
                            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>회사 ID <span className="text-red-500">*</span></Label>
                            <Input {...register('companyId', { required: true })} disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>부서</Label>
                            <SearchableSelect
                                items={departments.map((d: any) => ({ ...d, id: d.deptId }))}
                                value={watch('deptId') || ''}
                                onChange={(id) => setValue('deptId', id)}
                                placeholder="부서 검색..."
                                displayFormat={(dept) => `${dept.name} (${dept.id})`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>권한</Label>
                            <Input {...register('roleId')} placeholder="ADMIN / USER" />
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
                            <Label>직급</Label>
                            <Input {...register('position')} placeholder="직급" />
                        </div>
                        <div className="space-y-2">
                            <Label>직책</Label>
                            <Input {...register('title')} placeholder="직책" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>비고</Label>
                            <Textarea {...register('note')} placeholder="비고 사항 입력" />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
