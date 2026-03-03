import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { standardService } from '@/services/standardService';
import type { Role } from '@/services/standardService';

export default function RoleRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const isEditMode = !!id;

    const { register, handleSubmit, setValue } = useForm<Role>();

    useEffect(() => {
        if (isEditMode && id) {
            standardService.getById('role', id).then((data: Role) => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof Role, data[key as keyof Role]);
                    });
                }
            });
        }
    }, [id, isEditMode, setValue]);

    const onSubmit = async (data: Role) => {
        try {
            if (isEditMode && id) {
                await standardService.update('role', id, data);
                toast({ title: "성공", description: "권한 정보가 수정되었습니다." });
            } else {
                await standardService.create('role', data);
                toast({ title: "성공", description: "권한이 등록되었습니다." });
            }
            navigate('/standard/role');
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/standard/role')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '권한 수정' : '권한 등록'}</h1>
                        <p className="text-muted-foreground">{isEditMode ? '기존 권한 정보를 수정합니다.' : '신규 권한을 등록합니다.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/standard/role')}>취소</Button>
                    <Button type="submit" form="role-form" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">권한 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>권한 ID <span className="text-red-500">*</span></Label>
                            <Input {...register('roleId', { required: true })} placeholder="예: CUSTOM_ROLE" disabled={isEditMode} className={isEditMode ? 'bg-slate-50' : ''} />
                        </div>
                        <div className="space-y-2">
                            <Label>권한명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="권한명 입력" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>비고/설명</Label>
                            <Input {...register('note')} placeholder="권한에 대한 상세 설명을 입력하세요" />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
