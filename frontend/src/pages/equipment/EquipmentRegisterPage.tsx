
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { equipmentService } from '@/services/equipmentService';
import { standardService, type Dept } from '@/services/standardService';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import type { Equipment } from '@/types/equipment';

export default function EquipmentRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState<'T' | 'C'>('T');
    const isEditMode = !!id;

    // Department data for SearchableSelect
    const [departments, setDepartments] = useState<Dept[]>([]);

    useEffect(() => {
        standardService.getAll('dept').then(setDepartments);
    }, []);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Equipment>({
        defaultValues: {
            status: 'T',
            inspection_yn: 'Y',
            psm_yn: 'N',
            workpermit_yn: 'N',
            purchase_cost: 0,
            residual_value: 0,
            depre_period: 0,
            inspection_interval: 0,
        }
    });

    useEffect(() => {
        if (isEditMode && id) {
            setLoading(true);
            equipmentService.getById(id)
                .then(data => {
                    if (data) {
                        if (data.status === 'C') {
                            toast({ title: "안내", description: "확정된 건은 수정할 수 없습니다.", variant: "destructive" });
                        }
                        // Reset form with data
                        Object.keys(data).forEach(key => {
                            setValue(key as keyof Equipment, data[key as keyof Equipment]);
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast({ title: "오류", description: "설비 정보를 불러오지 못했습니다.", variant: "destructive" });
                    navigate('/master/equipment');
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEditMode, setValue, navigate, toast]);

    const onSubmit = async (data: Equipment) => {
        try {
            setLoading(true);
            data.status = actionType;
            if (isEditMode && id) {
                await equipmentService.update(id, data);
                toast({ title: "성공", description: actionType === 'C' ? "설비 정보가 확정되었습니다." : "설비 정보가 수정되었습니다." });
            } else {
                await equipmentService.create(data);
                toast({ title: "성공", description: actionType === 'C' ? "신규 설비가 확정 등록되었습니다." : "신규 설비가 임시 저장되었습니다." });
            }
            navigate('/master/equipment');
        } catch (error: any) {
            console.error(error);
            toast({ title: "오류", description: error.response?.data?.message || "저장 중 오류가 발생했습니다.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const isConfirmed = watch('status') === 'C';

    if (loading && isEditMode) {
        return <div className="p-8 text-center">로딩 중...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/master/equipment">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '설비 수정' : '설비 등록'}</h1>
                        <p className="text-muted-foreground">
                            {isEditMode ? '기존 설비 정보를 수정합니다.' : '신규 설비를 등록합니다.'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/master/equipment')}>
                        목록
                    </Button>
                    {!isConfirmed && (
                        <>
                            <Button
                                type="submit"
                                form="equipment-form"
                                disabled={loading}
                                variant="secondary"
                                onClick={() => setActionType('T')}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                임시 저장
                            </Button>
                            <Button
                                type="submit"
                                form="equipment-form"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setActionType('C')}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                확정
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <form id="equipment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* 1. Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">기본 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Row 1: ID(1) / Name(3) */}
                        <div className="space-y-2">
                            <Label htmlFor="equipment_id">설비 코드</Label>
                            <Input
                                id="equipment_id"
                                {...register('equipment_id')}
                                placeholder="저장 시 자동 생성"
                                disabled={true}
                                className="bg-slate-50"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                            <Label htmlFor="name">설비명 <span className="text-red-500">*</span></Label>
                            <Input id="name" {...register('name', { required: '설비명은 필수입니다.' })} placeholder="예: 1호기 공기압축기" />
                            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                        </div>
                        {/* Row 2: Type(1) / Dept(1) / Location(2) */}
                        <div className="space-y-2">
                            <Label htmlFor="code_item">설비 유형</Label>
                            <Select onValueChange={(val: string) => setValue('code_item', val)} defaultValue="COMPRESSOR">
                                <SelectTrigger>
                                    <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COMPRESSOR">압축기</SelectItem>
                                    <SelectItem value="PUMP">펌프</SelectItem>
                                    <SelectItem value="GENERATOR">발전기</SelectItem>
                                    <SelectItem value="TANK">탱크</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dept_id">관리 부서</Label>
                            <SearchableSelect
                                items={departments}
                                value={watch('dept_id') || ''}
                                onChange={(id) => setValue('dept_id', id)}
                                placeholder="부서 검색..."
                                displayFormat={(dept) => `${dept.name} (${dept.id})`}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="install_location">설치 위치</Label>
                            <Input id="install_location" {...register('install_location')} placeholder="예: A동 지하 1층 기계실" />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Specification */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">제원 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Row: Maker(1) / Model(1) / Spec(1) / Serial(1) */}
                        <div className="space-y-2">
                            <Label htmlFor="maker_name">제조사</Label>
                            <Input id="maker_name" {...register('maker_name')} placeholder="예: Atlas Copco" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">모델명</Label>
                            <Input id="model" {...register('model')} placeholder="예: GA-90" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="spec">설비 사양</Label>
                            <Input id="spec" {...register('spec')} placeholder="예: 90kW, 7.5bar" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serial">Serial No.</Label>
                            <Input id="serial" {...register('serial')} placeholder="Serial Number" />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Financial Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">재무 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="install_date">설치 일자</Label>
                            <Input id="install_date" type="date" {...register('install_date')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purchase_cost">취득 금액</Label>
                            <Input id="purchase_cost" type="number" {...register('purchase_cost', { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="residual_value">잔존 가액</Label>
                            <Input id="residual_value" type="number" {...register('residual_value', { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depre_method">상각 방법</Label>
                            <Select onValueChange={(val: string) => setValue('depre_method', val as any)} defaultValue="STRAIGHT">
                                <SelectTrigger>
                                    <SelectValue placeholder="선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STRAIGHT">정액법</SelectItem>
                                    <SelectItem value="DECLINING">정률법</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depre_period">내용 연수 (년)</Label>
                            <Input id="depre_period" type="number" {...register('depre_period', { valueAsNumber: true })} />
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Maintenance Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">보전 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="psm_yn">PSM 대상 여부</Label>
                            <Select onValueChange={(val: string) => setValue('psm_yn', val as any)} defaultValue="N">
                                <SelectTrigger>
                                    <SelectValue placeholder="선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Y">예</SelectItem>
                                    <SelectItem value="N">아니오</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="inspection_yn">예방 점검 대상</Label>
                            <Select onValueChange={(val: string) => setValue('inspection_yn', val as any)} defaultValue="Y">
                                <SelectTrigger>
                                    <SelectValue placeholder="선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Y">예</SelectItem>
                                    <SelectItem value="N">아니오</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="workpermit_yn">작업허가 대상</Label>
                            <Select onValueChange={(val: string) => setValue('workpermit_yn', val as any)} defaultValue="N">
                                <SelectTrigger>
                                    <SelectValue placeholder="선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Y">예</SelectItem>
                                    <SelectItem value="N">아니오</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="inspection_interval">점검 주기</Label>
                            <Input id="inspection_interval" type="number" {...register('inspection_interval', { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="inspection_unit">주기 단위</Label>
                            <Select onValueChange={(val: string) => setValue('inspection_unit', val as any)} defaultValue="MONTH">
                                <SelectTrigger>
                                    <SelectValue placeholder="단위 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAY">일</SelectItem>
                                    <SelectItem value="WEEK">주</SelectItem>
                                    <SelectItem value="MONTH">월</SelectItem>
                                    <SelectItem value="YEAR">년</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>마지막/다음 점검일</Label>
                            <div className="text-sm text-slate-500 py-2">등록 후 자동 계산됩니다.</div>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Etc */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">기타</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="note">비고</Label>
                            <Textarea id="note" {...register('note')} placeholder="특이사항을 입력하세요." className="min-h-[80px]" />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
