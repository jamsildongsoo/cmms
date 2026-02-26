
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { standardService, type Warehouse, type Plant } from '@/services/standardService';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function WarehouseRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const isEditMode = !!id;

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Warehouse>();
    const [plants, setPlants] = useState<Plant[]>([]);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        standardService.getAll('plant').then(setPlants);
    }, []);

    useEffect(() => {
        if (user?.company_id) {
            setValue('company_id', user.company_id);
        }
    }, [user, setValue]);

    useEffect(() => {
        if (isEditMode && id) {
            standardService.getById('warehouse', id).then((data: Warehouse) => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof Warehouse, data[key as keyof Warehouse]);
                    });
                }
            });
        }
    }, [id, isEditMode, setValue]);

    const onSubmit = async (data: Warehouse) => {
        try {
            if (isEditMode && id) {
                await standardService.update('warehouse', id, data);
                toast({ title: "성공", description: "창고 정보가 수정되었습니다." });
            } else {
                await standardService.create('warehouse', data);
                toast({ title: "성공", description: "창고가 등록되었습니다." });
            }
            navigate('/standard/warehouse');
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/standard/warehouse')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '창고 수정' : '창고 등록'}</h1>
                        <p className="text-muted-foreground">{isEditMode ? '기존 창고 정보를 수정합니다.' : '신규 창고를 등록합니다.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/standard/warehouse')}>취소</Button>
                    <Button type="submit" form="warehouse-form" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <form id="warehouse-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">창고 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="id">창고 코드 (ID) <span className="text-red-500">*</span></Label>
                            <Input
                                id="id"
                                {...register('id', { required: '창고 코드는 필수입니다.' })}
                                placeholder="예: WH01"
                                disabled={isEditMode}
                                className={isEditMode ? "bg-slate-50" : ""}
                            />
                            {errors.id && <span className="text-xs text-red-500">{errors.id.message}</span>}
                            <input type="hidden" {...register('company_id')} />
                        </div>
                        <div className="space-y-2">
                            <Label>창고명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="창고명 입력" />
                            {errors.name && <span className="text-red-500 text-xs">창고명은 필수입니다.</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>사업장 <span className="text-red-500">*</span></Label>
                            <Select
                                value={watch('plant_id') || ''}
                                onValueChange={(val: string) => setValue('plant_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="사업장 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plants.map(plant => (
                                        <SelectItem key={plant.id} value={plant.id}>{plant.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>위치 상세</Label>
                            <Input {...register('location')} placeholder="예: 본관 1층" />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
