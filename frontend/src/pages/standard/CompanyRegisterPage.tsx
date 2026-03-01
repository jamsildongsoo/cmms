
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
import type { Company } from '@/services/standardService';

export default function CompanyRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const isEditMode = !!id;

    const { register, handleSubmit, setValue } = useForm<Company>();

    useEffect(() => {
        if (isEditMode && id) {
            standardService.getById('company', id).then((data: Company) => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof Company, data[key as keyof Company]);
                    });
                }
            });
        }
    }, [id, isEditMode, setValue]);

    const onSubmit = async (data: Company) => {
        try {
            if (isEditMode && id) {
                await standardService.update('company', id, data);
                toast({ title: "성공", description: "회사 정보가 수정되었습니다." });
            } else {
                await standardService.create('company', data);
                toast({ title: "성공", description: "회사가 등록되었습니다." });
            }
            navigate('/standard/company');
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/standard/company')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '회사 수정' : '회사 등록'}</h1>
                        <p className="text-muted-foreground">{isEditMode ? '기존 회사 정보를 수정합니다.' : '신규 회사를 등록합니다.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/standard/company')}>취소</Button>
                    <Button type="submit" form="company-form" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">회사 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>회사 코드 <span className="text-red-500">*</span></Label>
                            <Input {...register('companyId', { required: true })} placeholder="회사 코드 입력" disabled={isEditMode} className={isEditMode ? 'bg-slate-50' : ''} />
                        </div>
                        <div className="space-y-2">
                            <Label>회사명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="회사명 입력" />
                        </div>
                        <div className="space-y-2">
                            <Label>사업자번호</Label>
                            <Input {...register('bizno')} placeholder="000-00-00000" />
                        </div>
                        <div className="space-y-2">
                            <Label>이메일</Label>
                            <Input type="email" {...register('email')} placeholder="email@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>전화번호</Label>
                            <Input {...register('phone')} placeholder="02-0000-0000" />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
