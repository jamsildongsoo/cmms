
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { inspectionService } from '@/services/inspectionService';
import type { Inspection, InspectionItem } from '@/types/inspection';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { standardService, type Dept, type Person } from '@/services/standardService';
import { equipmentService } from '@/services/equipmentService';
import type { Equipment } from '@/types/equipment';

export default function InspectionRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    // Mode Detection
    const isEditMode = !!id;
    const isResultMode = location.pathname.includes('/result'); // Detects /pm/inspection/result/new

    // Result Mode Inputs (from Query Params)
    const refEntityParam = searchParams.get('ref_entity');
    const refIdParam = searchParams.get('ref_id');

    // Data for SearchableSelect
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [departments, setDepartments] = useState<Dept[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);

    useEffect(() => {
        equipmentService.getAll().then(setEquipments);
        standardService.getAll('dept').then(setDepartments);
        standardService.getAll('person').then(setPersons);
    }, []);

    // Local state for items
    const [items, setItems] = useState<InspectionItem[]>([
        { seq: 1, check_item: '', method: '', criteria: '', unit: '' },
    ]);
    const [status, setStatus] = useState<'T' | 'S' | 'P' | 'C'>('T');

    const { register, setValue, getValues } = useForm<Inspection>({
        defaultValues: {
            status: 'T',
            stage: isResultMode ? 'ACT' : 'PLN', // Force stage based on mode
            plan_date: new Date().toISOString().split('T')[0],
            ref_entity: refEntityParam || undefined,
            ref_id: refIdParam || undefined,
        }
    });

    useEffect(() => {
        // Load existing data if edit mode
        if (isEditMode && id) {
            inspectionService.getById(id).then(data => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof Inspection, data[key as keyof Inspection]);
                    });
                    setItems(data.items || []);
                    setStatus(data.status);
                }
            });
        }
        // Load Plan data if in Result Mode (creating new result from plan)
        else if (isResultMode && refIdParam && !id) {
            inspectionService.getById(refIdParam).then(planData => {
                if (planData) {
                    // Pre-fill from plan
                    setValue('name', planData.name + ' (실적)');
                    setValue('equipment_name', planData.equipment_name);
                    setValue('person_name', planData.person_name);
                    setValue('description', planData.description);
                    setValue('equipment_id', planData.equipment_id);

                    // Copy items (reset results just in case, though they should be empty in plan)
                    const planItems = (planData.items || []).map(item => ({
                        ...item,
                        result: undefined, // Clear result for new entry
                        remarks: undefined
                    }));
                    setItems(planItems);

                    // Set Status to Progress for new result
                    setStatus('P');
                }
            });
        }
    }, [id, isEditMode, isResultMode, refIdParam, setValue]);

    const addItem = () => {
        setItems(prev => [...prev, { seq: prev.length + 1, check_item: '', method: '', criteria: '', unit: '' }]);
    };

    const removeItem = (seq: number) => {
        setItems(prev => prev.filter(i => i.seq !== seq).map((item, idx) => ({ ...item, seq: idx + 1 })));
    };

    const updateItem = (seq: number, field: keyof InspectionItem, value: any) => {
        setItems(prev => prev.map(i => i.seq === seq ? { ...i, [field]: value } : i));
    };

    // Save Logic
    const onSave = async (targetStatus: 'T' | 'S' | 'P' | 'C') => {
        const formData = getValues();
        const dataToSave: Inspection = {
            ...formData,
            status: targetStatus,
            items: items,
            stage: isResultMode ? 'ACT' : 'PLN'
        };

        try {
            if (isEditMode && id) {
                await inspectionService.update(id, dataToSave);
            } else {
                await inspectionService.create(dataToSave);
            }

            let message = "저장되었습니다.";
            if (targetStatus === 'S') message = "점검 계획이 확정되었습니다.";
            if (targetStatus === 'C') message = "점검이 완료되었습니다.";

            toast({ title: "성공", description: message });
            navigate('/pm/inspection');

        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    // UI State Logic
    const isReadOnly = status === 'S' || status === 'C'; // Fully read-only
    const isPlanEditable = !isResultMode && status === 'T'; // Plan Draft
    const isResultEditable = isResultMode && (status === 'P' || status === 'T'); // Result In-Progress

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/pm/inspection')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isResultMode ? '점검 실적 등록' : (isEditMode ? '점검 계획 수정' : '점검 계획 등록')}
                        </h1>
                        <p className="text-muted-foreground">
                            {isResultMode ? '점검 결과를 입력하고 완료합니다.' : '예방 점검 계획을 수립하고 확정합니다.'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/pm/inspection')}>취소</Button>

                    {/* Plan Mode Actions */}
                    {!isResultMode && !isReadOnly && (
                        <>
                            <Button type="button" variant="outline" onClick={() => onSave('T')} className="text-slate-600">
                                <Save className="mr-2 h-4 w-4" /> 임시 저장
                            </Button>
                            <Button type="button" onClick={() => onSave('S')} className="bg-blue-600 hover:bg-blue-700">
                                <CheckCircle2 className="mr-2 h-4 w-4" /> 계획 확정
                            </Button>
                        </>
                    )}

                    {/* Result Mode Actions */}
                    {isResultMode && !isReadOnly && (
                        <>
                            <Button type="button" variant="outline" onClick={() => onSave('P')} className="text-slate-600">
                                <Save className="mr-2 h-4 w-4" /> 임시 저장
                            </Button>
                            <Button type="button" onClick={() => onSave('C')} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="mr-2 h-4 w-4" /> 점검 완료
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <form className="space-y-6">
                {/* Basic Info - 4 Column Grid */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">기본 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Row 1: ID, Name, Date */}
                        <div className="space-y-2">
                            <Label>점검번호</Label>
                            <Input value={id || '자동 생성'} disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <Label>점검명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="예: 1호기 월간 정기점검" disabled={!isPlanEditable && !isResultEditable} />
                        </div>
                        <div className="space-y-2">
                            <Label>{isResultMode ? '실적 일자' : '예정 일자'} <span className="text-red-500">*</span></Label>
                            <Input type="date" {...register('plan_date', { required: true })} disabled={!isPlanEditable && !isResultEditable} />
                        </div>

                        {/* Row 1-1: Ref Info (Visible in Result Mode) */}
                        {isResultMode && (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">단계</Label>
                                    <Input value="ACT (실적)" disabled className="bg-slate-50 text-slate-500" />
                                    {/* Hidden input to register value */}
                                    <input type="hidden" {...register('stage')} value="ACT" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">참조 구분</Label>
                                    <Input value="IN (점검)" disabled className="bg-slate-50 text-slate-500" />
                                    {/* Hidden input to register value */}
                                    <input type="hidden" {...register('ref_entity')} value="IN" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">참조 ID</Label>
                                    <Input
                                        {...register('ref_id')}
                                        placeholder={id ? '' : '참조할 계획 ID 입력'}
                                        disabled={!!id} // Read-only if ID exists (navigated from list), Editable if new
                                        className={!!id ? "bg-slate-50" : ""}
                                    />
                                </div>
                            </>
                        )}

                        {/* Row 2: Type, Equipment, Dept, Person */}
                        <div className="space-y-2 lg:col-start-1">
                            <Label>점검 유형 <span className="text-red-500">*</span></Label>
                            <Input {...register('type', { required: true })} placeholder="예: 정기점검" disabled={!isPlanEditable && !isResultEditable} />
                        </div>
                        <div className="space-y-2">
                            <Label>대상 설비 <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                items={equipments.map(e => ({ ...e, id: e.equipment_id }))}
                                value={getValues('equipment_id') || ''}
                                onChange={(id) => {
                                    const equipment = equipments.find(e => e.equipment_id === id);
                                    setValue('equipment_id', id);
                                    setValue('equipment_name', equipment?.name || '');
                                    // Optional: Auto-fill dept if equipment has it
                                    if (equipment?.dept_id) {
                                        setValue('dept_id', equipment.dept_id);
                                        const dept = departments.find(d => d.id === equipment.dept_id);
                                        setValue('dept_name', dept?.name);
                                    }
                                }}
                                placeholder="설비 검색..."
                                displayFormat={(item) => `${item.name} (${item.equipment_id})`}
                                disabled={!isPlanEditable && !isResultEditable}
                            />
                            <input type="hidden" {...register('equipment_name', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>관리 부서</Label>
                            <SearchableSelect
                                items={departments}
                                value={getValues('dept_id') || ''}
                                onChange={(id) => {
                                    const dept = departments.find(d => d.id === id);
                                    setValue('dept_id', id);
                                    setValue('dept_name', dept?.name);
                                }}
                                placeholder="부서 검색..."
                                displayFormat={(item) => item.name}
                                disabled={!isPlanEditable && !isResultEditable}
                            />
                            <input type="hidden" {...register('dept_name')} />
                        </div>
                        <div className="space-y-2">
                            <Label>담당자</Label>
                            <SearchableSelect
                                items={persons.filter(p => !getValues('dept_id') || p.dept_id === getValues('dept_id'))}
                                value={getValues('person_id') || ''}
                                onChange={(id) => {
                                    const person = persons.find(p => p.person_id === id);
                                    setValue('person_id', id);
                                    setValue('person_name', person?.name);
                                }}
                                placeholder="담당자 검색..."
                                displayFormat={(item) => `${item.name} (${item.position || ''})`}
                                disabled={!isPlanEditable && !isResultEditable}
                            />
                            <input type="hidden" {...register('person_name')} />
                        </div>

                        {/* Row 3 - Full Width Description */}
                        <div className="space-y-2 lg:col-span-4">
                            <Label>비고 / 특이사항</Label>
                            <Textarea {...register('description')} placeholder="특이사항 입력" disabled={!isPlanEditable && !isResultEditable} className="min-h-[80px]" />
                        </div>
                    </CardContent>
                </Card>

                {/* Inspection Items Grid */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">점검 항목 및 결과</CardTitle>
                        {isPlanEditable && (
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="mr-1 h-4 w-4" /> 항목 추가
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-16 text-center">No.</th>
                                        <th className="h-10 px-4 font-medium text-slate-500">점검 항목</th>
                                        <th className="h-10 px-4 font-medium text-slate-500">점검 방법</th>
                                        <th className="h-10 px-4 font-medium text-slate-500">판정 기준</th>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-20 text-center">단위</th>
                                        {/* Result columns always visible but disabled in Plan Mode */}
                                        <th className="h-10 px-4 font-medium text-slate-500 w-32 text-center">결과</th>
                                        {isPlanEditable && <th className="h-10 px-4 font-medium text-slate-500 w-16">삭제</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-500">
                                                등록된 점검 항목이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={item.seq} className="hover:bg-slate-50/50">
                                                <td className="p-3 text-center text-slate-500 font-mono">{index + 1}</td>
                                                {/* Item Details - Editable in Plan Mode, Read-only in Result Mode */}
                                                <td className="p-3">
                                                    <Input
                                                        value={item.check_item}
                                                        onChange={(e) => updateItem(item.seq, 'check_item', e.target.value)}
                                                        disabled={!isPlanEditable}
                                                        placeholder="항목 입력"
                                                        className={!isPlanEditable ? "bg-transparent border-none px-0 shadow-none" : ""}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        value={item.method}
                                                        onChange={(e) => updateItem(item.seq, 'method', e.target.value)}
                                                        disabled={!isPlanEditable}
                                                        placeholder="방법 입력"
                                                        className={!isPlanEditable ? "bg-transparent border-none px-0 shadow-none" : ""}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        value={item.criteria}
                                                        onChange={(e) => updateItem(item.seq, 'criteria', e.target.value)}
                                                        disabled={!isPlanEditable}
                                                        placeholder="기준 입력"
                                                        className={!isPlanEditable ? "bg-transparent border-none px-0 shadow-none" : ""}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        value={item.unit || ''}
                                                        onChange={(e) => updateItem(item.seq, 'unit', e.target.value)}
                                                        disabled={!isPlanEditable}
                                                        placeholder="단위"
                                                        className={!isPlanEditable ? "bg-transparent border-none px-0 shadow-none text-center" : "text-center"}
                                                    />
                                                </td>

                                                {/* Result Inputs - Editable in Result Mode */}
                                                <td className="p-3 text-center">
                                                    {isResultEditable ? (
                                                        <Input
                                                            type="number"
                                                            value={item.result_value || ''}
                                                            onChange={(e) => updateItem(item.seq, 'result_value', parseFloat(e.target.value))}
                                                            placeholder="0"
                                                            className="h-8 text-right"
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-slate-700">
                                                            {item.result_value !== undefined ? item.result_value : '-'}
                                                        </span>
                                                    )}
                                                </td>

                                                {isPlanEditable && (
                                                    <td className="p-3 text-center">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                            onClick={() => removeItem(item.seq)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
