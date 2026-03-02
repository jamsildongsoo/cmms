import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { workPermitService } from '@/services/workPermitService';
import { standardService, type Dept, type Person } from '@/services/standardService';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import type { WorkPermit } from '@/types/workPermit';
import { equipmentService } from '@/services/equipmentService';
import type { Equipment } from '@/types/equipment';
import { WPTemplateCard } from '@/components/wp/WPTemplateCard';
import { WP_TEMPLATES } from '@/constants/wpTemplates';

export default function WorkPermitRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState<'T' | 'C' | 'A'>('T');
    const isEditMode = !!id;


    const { register, handleSubmit, setValue, watch } = useForm<WorkPermit>({
        defaultValues: {
            wpTypes: [], // Default empty (General is implied/mandatory)
            status: 'T',
            stage: 'PLN',
            date: new Date().toISOString().split('T')[0],
        }
    });

    const selectedTypes = watch('wpTypes') || [];

    // Department & User data for SearchableSelect
    const [departments, setDepartments] = useState<Dept[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [equipments, setEquipments] = useState<Equipment[]>([]);

    useEffect(() => {
        standardService.getAll('dept').then(setDepartments);
        standardService.getAll('person').then(setPersons);
        equipmentService.getAll().then(setEquipments);
    }, []);

    const selectedDeptId = watch('deptId');
    const filteredPersons = useMemo(() => {
        if (!selectedDeptId) return persons;
        return persons.filter(p => p.deptId === selectedDeptId);
    }, [selectedDeptId, persons]);

    useEffect(() => {
        if (isEditMode && id) {
            workPermitService.getById(id).then(data => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof WorkPermit, data[key as keyof WorkPermit]);
                    });
                }
            });
        }
    }, [id, isEditMode, setValue]);

    const handleTypeChange = (type: string, checked: boolean) => {
        const current = selectedTypes;
        if (checked) {
            setValue('wpTypes', [...current, type]);
        } else {
            setValue('wpTypes', current.filter(t => t !== type));
        }
    };

    const onSubmit = async (data: WorkPermit) => {
        if (actionType === 'C' && !window.confirm("확정하시겠습니까? (안전 담당자 승인 단계로 넘어갑니다)")) return;
        if (actionType === 'A' && !window.confirm("허가 신청을 상신하시겠습니까?")) return;

        if (!data.equipmentId) {
            toast({ title: "필수 항목 누락", description: "대상 설비를 선택해주세요.", variant: "destructive" });
            return;
        }
        if (!data.deptId) {
            toast({ title: "필수 항목 누락", description: "신청 부서를 선택해주세요.", variant: "destructive" });
            return;
        }
        if (!data.personId) {
            toast({ title: "필수 항목 누락", description: "신청자를 선택해주세요.", variant: "destructive" });
            return;
        }
        if (!data.wpTypes || data.wpTypes.length === 0) {
            toast({ title: "필수 항목 누락", description: "특별 작업 유형을 1개 이상 선택해주세요.", variant: "destructive" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...data,
                status: actionType
            };

            if (isEditMode && id) {
                await workPermitService.update(id, payload);
            } else {
                await workPermitService.create(payload);
            }

            let message = "정보가 저장되었습니다.";
            if (actionType === 'C') message = "허가 신청이 확정되었습니다.";
            if (actionType === 'A') message = "허가 신청이 상신되었습니다.";

            toast({ title: "성공", description: message });
            navigate('/wp/work-permit');
        } catch (error: any) {
            console.error(error);
            toast({ title: "오류", description: error.response?.data?.message || "저장 중 오류 발생", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        if (!id) return;
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await workPermitService.delete(id);
            toast({ title: "성공", description: "삭제되었습니다." });
            navigate('/wp/work-permit');
        } catch (error) {
            toast({ title: "오류", description: "삭제 실패", variant: "destructive" });
        }
    };

    const currentStatus = watch('status');
    const isConfirmed = currentStatus === 'C';
    const isApproval = currentStatus === 'A';
    const isReadOnly = isConfirmed || isApproval;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/wp/work-permit')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '허가서 수정' : '작업허가 신청'}</h1>
                        <p className="text-muted-foreground">위험 작업에 대한 허가를 신청합니다.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/wp/work-permit')}>목록</Button>
                    {isEditMode && !isReadOnly && (
                        <Button variant="destructive" type="button" onClick={onDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </Button>
                    )}
                    {!isReadOnly && (
                        <>
                            <Button
                                type="submit"
                                form="wp-form"
                                disabled={loading}
                                variant="secondary"
                                onClick={() => setActionType('T')}
                            >
                                <Save className="mr-2 h-4 w-4" /> 임시 저장
                            </Button>
                            <Button
                                type="submit"
                                form="wp-form"
                                disabled={loading}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() => setActionType('A')}
                            >
                                <Send className="mr-2 h-4 w-4" /> 상신
                            </Button>
                            <Button
                                type="submit"
                                form="wp-form"
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => setActionType('C')}
                            >
                                <Save className="mr-2 h-4 w-4" /> 확정 (신청)
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <form id="wp-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* 1. 작업 정보 (Work Info) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">작업 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>허가번호</Label>
                            <Input {...register('permitId')} placeholder="자동 생성" disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>작업명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="예: 배관 용접 작업" disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2">
                            <Label>신청일자</Label>
                            <Input type="date" {...register('date')} disabled={isConfirmed} />
                        </div>

                        <div className="space-y-2">
                            <Label>대상 설비 <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                items={equipments.map(e => ({ ...e, id: e.equipmentId }))}
                                value={watch('equipmentId') || ''}
                                onChange={(val) => {
                                    const equipment = equipments.find(e => e.equipmentId === val);
                                    setValue('equipmentId', val);
                                    setValue('equipmentName', equipment?.name || '');
                                    if (equipment?.deptId) {
                                        setValue('deptId', equipment.deptId);
                                    }
                                }}
                                placeholder="설비 검색..."
                                displayFormat={(item) => `${item.name} (${item.equipmentId})`}
                                disabled={isConfirmed}
                            />
                            <input type="hidden" {...register('equipmentName')} />
                        </div>
                        <div className="space-y-2">
                            <Label>신청 부서 <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                items={departments.map((d: any) => ({ ...d, id: d.deptId }))}
                                value={watch('deptId') || ''}
                                onChange={(val) => setValue('deptId', val)}
                                placeholder="부서 검색..."
                                displayFormat={(dept) => `${dept.name} (${dept.id})`}
                                disabled={isConfirmed}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>신청자 <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                items={filteredPersons.map((p: any) => ({ ...p, id: p.personId }))}
                                value={watch('personId') || ''}
                                onChange={(val) => {
                                    const p = persons.find(person => person.personId === val);
                                    setValue('personId', val);
                                    setValue('personName', p?.name || '');
                                }}
                                placeholder="신청자 검색..."
                                displayFormat={(person) => `${person.name} ${person.position || ''} (${person.personId})`}
                                disabled={isConfirmed}
                            />
                            <input type="hidden" {...register('personName')} />
                        </div>
                        <div className="space-y-2">
                        </div>

                        {/* Special Work Types Selection */}
                        <div className="col-span-1 md:col-span-4 space-y-3 border rounded-md p-4 bg-slate-50">
                            <Label className="font-semibold">특별 작업 유형 (중복 선택 가능) <span className="text-red-500">*</span></Label>
                            <div className="flex flex-wrap gap-4">
                                {['HOT', 'CONF', 'ELEC', 'HIGH', 'HEVY'].map((type) => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`type-${type}`}
                                            checked={selectedTypes.includes(type)}
                                            onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
                                            disabled={isConfirmed}
                                        />
                                        <Label htmlFor={`type-${type}`} className="cursor-pointer">
                                            {type === 'HOT' && '화기'}
                                            {type === 'CONF' && '밀폐'}
                                            {type === 'ELEC' && '전기'}
                                            {type === 'HIGH' && '고소'}
                                            {type === 'HEVY' && '중량물'}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>시작 일시</Label>
                            <Input type="datetime-local" {...register('startDt')} disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2">
                            <Label>종료 일시</Label>
                            <Input type="datetime-local" {...register('endDt')} disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>작업 장소</Label>
                            <Input {...register('location')} placeholder="작업 위치 상세" disabled={isConfirmed} />
                        </div>

                        <div className="space-y-2 md:col-span-4">
                            <Label>작업 내용</Label>
                            <Textarea {...register('workSummary')} placeholder="작업 내용을 상세히 기술하세요." disabled={isConfirmed} className={isConfirmed ? "bg-slate-50 min-h-[80px]" : "min-h-[80px]"} />
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Assessment */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">위험성 평가</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>위험 요인</Label>
                            <Input {...register('hazardFactor')} placeholder="예: 화재, 추락, 질식" disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2">
                            <Label>안전 대책</Label>
                            <Input {...register('safetyFactor')} placeholder="예: 소화기 비치, 안전벨트 착용" disabled={isConfirmed} />
                        </div>
                    </CardContent>
                </Card>

                {/* Dynamic Safety Templates */}
                <div className="space-y-6">
                    {/* 1. Common (Always Mandatory) */}
                    <WPTemplateCard
                        template={WP_TEMPLATES.COM}
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        disabled={isConfirmed}
                    />

                    {/* 2. Special Work Types (Dynamic) */}
                    {selectedTypes.map((type) => {
                        const template = WP_TEMPLATES[type];
                        if (!template) return null;
                        return (
                            <WPTemplateCard
                                key={type}
                                template={template}
                                register={register}
                                watch={watch}
                                setValue={setValue}
                                disabled={isConfirmed}
                            />
                        );
                    })}
                </div>
            </form>
        </div>
    );
}
