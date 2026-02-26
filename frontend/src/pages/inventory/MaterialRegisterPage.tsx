
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { inventoryService } from '@/services/inventoryService';
import { standardService, type Dept } from '@/services/standardService';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Material } from '@/services/inventoryService';

export default function MaterialRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState<'T' | 'C'>('T');
    const isEditMode = !!id;
    const user = useAuthStore((state) => state.user);

    const [departments, setDepartments] = useState<Dept[]>([]);

    useEffect(() => {
        standardService.getAll('dept').then(setDepartments);
    }, []);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Material>();

    // Auto-fill company_id from auth store (hidden)
    useEffect(() => {
        if (user?.company_id) {
            setValue('company_id', user.company_id);
        }
    }, [user, setValue]);

    useEffect(() => {
        let isMounted = true;
        if (isEditMode && id) {
            setLoading(true);
            inventoryService.getMaterialById(id)
                .then((data) => {
                    if (isMounted && data) {
                        if (data.status === 'C') {
                            toast({ title: "안내", description: "확정된 건은 수정할 수 없습니다.", variant: "destructive" });
                        }
                        Object.keys(data).forEach(key => {
                            setValue(key as keyof Material, data[key as keyof Material]);
                        });
                    }
                })
                .catch(err => {
                    if (isMounted) {
                        console.error(err);
                        toast({ title: "오류", description: "자재 정보를 불러오지 못했습니다.", variant: "destructive" });
                        navigate('/master/inventory');
                    }
                })
                .finally(() => {
                    if (isMounted) setLoading(false);
                });
        }
        return () => { isMounted = false; };
    }, [id, isEditMode, setValue, navigate, toast]);

    const onSubmit = async (data: Material) => {
        try {
            setLoading(true);
            data.status = actionType;
            if (isEditMode && id) {
                await inventoryService.updateMaterial(id, data);
                toast({ title: "성공", description: actionType === 'C' ? "자재 정보가 확정되었습니다." : "자재 정보가 수정되었습니다." });
            } else {
                await inventoryService.createMaterial(data);
                toast({ title: "성공", description: actionType === 'C' ? "신규 자재가 확정 등록되었습니다." : "신규 자재가 임시 저장되었습니다." });
            }
            navigate('/master/inventory');
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
                    <Button variant="ghost" size="icon" onClick={() => navigate('/master/inventory')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '자재 수정' : '자재 등록'}</h1>
                        <p className="text-muted-foreground">{isEditMode ? '기존 자재 정보를 수정합니다.' : '신규 자재를 등록합니다.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/master/inventory')}>목록</Button>
                    {!isConfirmed && (
                        <>
                            <Button
                                type="submit"
                                form="material-form"
                                disabled={loading}
                                variant="secondary"
                                onClick={() => setActionType('T')}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                임시 저장
                            </Button>
                            <Button
                                type="submit"
                                form="material-form"
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

            {/* company_id: hidden, managed by auth store */}
            <input type="hidden" {...register('company_id')} />

            <form id="material-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* 섹션 1: 기본정보 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">기본 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Row 1: 자재코드(1) / 자재명(3) */}
                        <div className="space-y-2">
                            <Label>자재 코드</Label>
                            <Input
                                {...register('inventory_id')}
                                placeholder="저장 시 자동 생성"
                                disabled={true}
                                className="bg-slate-50"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                            <Label>자재명 <span className="text-red-500">*</span></Label>
                            <Input
                                {...register('name', { required: '자재명은 필수입니다.' })}
                                placeholder="자재명 입력"
                            />
                            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                        </div>
                        {/* Row 2: 자재유형(1) / 기본단위(1) / 관리부서(2) */}
                        <div className="space-y-2">
                            <Label>자재 유형</Label>
                            <Select onValueChange={(val: string) => setValue('code_item', val)} defaultValue={watch('code_item') || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FASTENER">체결류</SelectItem>
                                    <SelectItem value="BEARING">베어링</SelectItem>
                                    <SelectItem value="OIL">오일/유류</SelectItem>
                                    <SelectItem value="FILTER">필터</SelectItem>
                                    <SelectItem value="SEAL">씰/패킹</SelectItem>
                                    <SelectItem value="ELECTRICAL">전기부품</SelectItem>
                                    <SelectItem value="ETC">기타</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>기본 단위</Label>
                            <Select onValueChange={(val: string) => setValue('unit', val)} defaultValue={watch('unit') || 'EA'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="단위 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EA">EA (개)</SelectItem>
                                    <SelectItem value="SET">SET (세트)</SelectItem>
                                    <SelectItem value="L">L (리터)</SelectItem>
                                    <SelectItem value="KG">KG (킬로그램)</SelectItem>
                                    <SelectItem value="M">M (미터)</SelectItem>
                                    <SelectItem value="BOX">BOX (박스)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>관리 부서</Label>
                            <SearchableSelect
                                items={departments}
                                value={watch('dept_id') || ''}
                                onChange={(id) => setValue('dept_id', id)}
                                placeholder="부서 검색..."
                                displayFormat={(dept) => `${dept.name} (${dept.id})`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 섹션 2: 제원정보 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">제원 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>제조사</Label>
                            <Input {...register('maker_name')} placeholder="제조사 입력" />
                        </div>
                        <div className="space-y-2">
                            <Label>모델명</Label>
                            <Input {...register('model')} placeholder="모델명 입력" />
                        </div>
                        <div className="space-y-2">
                            <Label>규격</Label>
                            <Input {...register('spec')} placeholder="규격/사양 입력" />
                        </div>
                        <div className="space-y-2">
                            <Label>시리얼번호</Label>
                            <Input {...register('serial')} placeholder="시리얼번호 입력" />
                        </div>
                    </CardContent>
                </Card>

                {/* 섹션 3: 기타 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">기타</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>비고</Label>
                            <Textarea
                                {...register('note')}
                                placeholder="특이사항을 입력하세요."
                                className="min-h-[80px]"
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div >
    );
}
