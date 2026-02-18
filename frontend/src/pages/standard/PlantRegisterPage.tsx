
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
import type { Plant } from '@/services/standardService';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function PlantRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const isEditMode = !!id;

    const { register, handleSubmit, setValue } = useForm<Plant>();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?.company_id) {
            setValue('company_id', user.company_id);
        }
    }, [user, setValue]);

    useEffect(() => {
        if (isEditMode && id) {
            standardService.getById('plant', id).then((data: Plant) => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof Plant, data[key as keyof Plant]);
                    });
                }
            });
        }
    }, [id, isEditMode, setValue]);

    const onSubmit = async (data: Plant) => {
        try {
            if (isEditMode && id) {
                await standardService.update('plant', id, data);
                toast({ title: "성공", description: "사업장 정보가 수정되었습니다." });
            } else {
                await standardService.create('plant', data);
                toast({ title: "성공", description: "사업장이 등록되었습니다." });
            }
            navigate('/standard/plant');
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/standard/plant')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '사업장 수정' : '사업장 등록'}</h1>
                        <p className="text-muted-foreground">{isEditMode ? '기존 사업장 정보를 수정합니다.' : '신규 사업장을 등록합니다.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/standard/plant')}>취소</Button>
                    <Button type="submit" form="plant-form" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <form id="plant-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">사업장 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>사업장 코드 <span className="text-red-500">*</span></Label>
                            <Input {...register('id', { required: true })} placeholder="사업장 코드 입력" disabled={isEditMode} className={isEditMode ? 'bg-slate-50' : ''} />
                        </div>
                        <div className="space-y-2">
                            <Label>사업장명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="사업장명 입력" />
                        </div>
                        <div className="space-y-2">
                            <Label>회사 ID <span className="text-red-500">*</span></Label>
                            <Input {...register('company_id', { required: true })} disabled className="bg-slate-50" />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
