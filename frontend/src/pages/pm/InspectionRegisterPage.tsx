
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { inspectionService } from '@/services/inspectionService';
import type { Inspection, InspectionItem } from '@/types/inspection';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { standardService, type Dept, type Person, type CodeItem } from '@/services/standardService';
import { equipmentService } from '@/services/equipmentService';
import type { Equipment } from '@/types/equipment';
import { ApprovalLineModal } from '@/components/approval/ApprovalLineModal';
import { approvalService, type ApprovalStep } from '@/services/approvalService';
import { useAuthStore } from '@/features/auth/useAuthStore';

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
    const refEntityParam = searchParams.get('refEntity');
    const refIdParam = searchParams.get('refId');

    // Data for SearchableSelect
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [departments, setDepartments] = useState<Dept[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [inspTypes, setInspTypes] = useState<CodeItem[]>([]);

    useEffect(() => {
        equipmentService.getAll().then(setEquipments);
        standardService.getAll('dept').then(setDepartments);
        standardService.getAll('person').then(setPersons);
        standardService.getCodeItems('INSP_TYPE').then(setInspTypes).catch(() => console.error("INSP_TYPE fetch error"));
    }, []);

    // Approval Modal State
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [pendingApprovalData, setPendingApprovalData] = useState<any>(null);
    const { user } = useAuthStore();

    // Local state for items
    const [items, setItems] = useState<InspectionItem[]>([
        { seq: 1, name: '', method: '', stdVal: undefined, unit: '' },
    ]);

    const { register, setValue, getValues, watch } = useForm<Inspection>({
        defaultValues: {
            status: 'T',
            stage: isResultMode ? 'ACT' : 'PLN', // Force stage based on mode
            date: new Date().toISOString().split('T')[0],
            refEntity: refEntityParam || undefined,
            refId: refIdParam || undefined,
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
                }
            });
        }
        // Load Plan data if in Result Mode (creating new result from plan)
        else if (isResultMode && refIdParam && !id) {
            inspectionService.getById(refIdParam).then(planData => {
                if (planData) {
                    // Pre-fill from plan
                    setValue('name', planData.name + ' (실적)');
                    setValue('equipmentId', planData.equipmentId);
                    setValue('equipmentName', planData.equipmentName);
                    setValue('deptId', planData.deptId);
                    setValue('deptName', planData.deptName);
                    setValue('personId', planData.personId);
                    setValue('personName', planData.personName);
                    setValue('codeItem', planData.codeItem);
                    setValue('note', planData.note);

                    // Copy items (reset results for new entry)
                    const planItems = (planData.items || []).map(item => ({
                        ...item,
                        resultVal: undefined
                    }));
                    setItems(planItems);
                }
            });
        }
    }, [id, isEditMode, isResultMode, refIdParam, setValue]);

    const addItem = () => {
        setItems(prev => [...prev, { seq: prev.length + 1, name: '', method: '', stdVal: undefined, unit: '' }]);
    };

    const removeItem = (seq: number) => {
        setItems(prev => prev.filter(i => i.seq !== seq).map((item, idx) => ({ ...item, seq: idx + 1 })));
    };

    const updateItem = (seq: number, field: keyof InspectionItem, value: any) => {
        setItems(prev => prev.map(i => i.seq === seq ? { ...i, [field]: value } : i));
    };

    // Save/Submit Logic
    const onSave = async (targetStatus: 'T' | 'A' | 'C') => {
        if (targetStatus === 'C' && !window.confirm("확정된 데이터는 수정할 수 없습니다. 확정하시겠습니까?")) return;
        if (targetStatus === 'A' && !window.confirm("상신하시겠습니까? 이후 수정이 불가능합니다.")) return;
        const formData = getValues();

        if (!formData.equipmentId) {
            toast({ title: "필수 항목 누락", description: "대상 설비를 선택해주세요.", variant: "destructive" });
            return;
        }
        if (!formData.deptId) {
            toast({ title: "필수 항목 누락", description: "관리 부서를 선택해주세요.", variant: "destructive" });
            return;
        }
        if (!formData.personId) {
            toast({ title: "필수 항목 누락", description: "담당자를 선택해주세요.", variant: "destructive" });
            return;
        }
        if (!formData.codeItem) {
            toast({ title: "필수 항목 누락", description: "점검 유형을 선택해주세요.", variant: "destructive" });
            return;
        }

        const dataToSave: Inspection = {
            ...formData,
            status: targetStatus,
            items: items,
        };

        try {
            let savedInspection: any;
            // When submitting for approval, first save as Temporary ('T')
            const saveStatus = targetStatus === 'A' ? 'T' : targetStatus;
            const payload = { ...dataToSave, status: saveStatus };

            if (isEditMode && id) {
                savedInspection = await inspectionService.update(id, payload);
            } else {
                savedInspection = await inspectionService.create(payload);
            }

            if (targetStatus === 'A') {
                // If it was an Approval request, save the temp data and open the modal
                setPendingApprovalData({
                    refId: savedInspection.inspectionId || id,
                    title: `[점검] ${dataToSave.name}`
                });
                setIsApprovalModalOpen(true);
                return;
            }

            let message = "정보가 저장되었습니다.";
            if (targetStatus === 'C') message = "정보가 확정되었습니다.";

            toast({ title: "성공", description: message });
            navigate('/pm/inspection');

        } catch (error: any) {
            console.error(error);
            toast({
                title: "오류",
                description: error.response?.data?.message || "저장 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        }
    };

    const onDelete = async () => {
        if (!id) return;
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await inspectionService.delete(id);
            toast({ title: "성공", description: "삭제되었습니다." });
            navigate('/pm/inspection');
        } catch (error: any) {
            toast({ title: "오류", description: "삭제 중 오류 발생", variant: "destructive" });
        }
    };

    const handleApprovalSubmit = async (steps: ApprovalStep[]) => {
        if (!pendingApprovalData) return;
        try {
            await approvalService.save({
                title: pendingApprovalData.title,
                status: 'A',
                refEntity: 'INSPECTION',
                refId: pendingApprovalData.refId,
                requesterId: user?.personId || ''
            }, steps, 'A');

            toast({ title: "성공", description: "결재 상신이 완료되었습니다." });
            setIsApprovalModalOpen(false);
            navigate('/pm/inspection');
        } catch (error: any) {
            console.error(error);
            toast({ title: "오류", description: "결재 상신 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    // UI State Logic
    const currentStatus = watch('status');
    const isConfirmed = currentStatus === 'C';
    const isApproval = currentStatus === 'A';
    const isReadOnly = isConfirmed || isApproval;

    const isPlanEditable = !isResultMode && !isReadOnly;
    const isResultEditable = isResultMode && !isReadOnly;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/pm/inspection')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {isResultMode ? '점검 실적 등록' : (isEditMode ? '점검 계획 수정' : '점검 계획 등록')}
                            </h1>
                            <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded text-sm">
                                {isResultMode ? '실적' : '계획'}
                            </span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {isResultMode ? '점검 결과를 입력하고 완료합니다.' : '예방 점검 계획을 수립하고 확정합니다.'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/pm/inspection')}>목록</Button>
                    {isEditMode && !isReadOnly && (
                        <Button variant="destructive" type="button" onClick={onDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </Button>
                    )}
                    {!isReadOnly && (
                        <>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => onSave('T')}
                            >
                                <Save className="mr-2 h-4 w-4" /> 임시 저장
                            </Button>
                            <Button
                                type="button"
                                onClick={() => onSave('A')}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                <Send className="mr-2 h-4 w-4" /> 상신
                            </Button>
                            <Button
                                type="button"
                                onClick={() => onSave('C')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> 확정
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
                            <Input type="date" {...register('date', { required: true })} disabled={!isPlanEditable && !isResultEditable} />
                        </div>

                        {/* Row 1-1: Ref Info (Visible in Result Mode) */}
                        {isResultMode && (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">단계</Label>
                                    <Input value="ACT (실적)" disabled className="bg-slate-50 text-slate-500" />
                                    <input type="hidden" {...register('stage')} value="ACT" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">참조 구분</Label>
                                    <Input value="IN (점검)" disabled className="bg-slate-50 text-slate-500" />
                                    <input type="hidden" {...register('refEntity')} value="IN" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">참조 ID</Label>
                                    <Input
                                        {...register('refId')}
                                        placeholder={id ? '' : '참조할 계획 ID 입력'}
                                        disabled={!!id}
                                        className={!!id ? "bg-slate-50" : ""}
                                    />
                                </div>
                            </>
                        )}

                        {/* Row 2: Type, Equipment, Dept, Person */}
                        <div className="space-y-2 lg:col-start-1">
                            <Label>대상 설비 <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                items={equipments.filter(e => e.status === 'C').map(e => ({ ...e, id: e.equipmentId }))}
                                value={watch('equipmentId') || ''}
                                onChange={(val) => {
                                    const equipment = equipments.find(e => e.equipmentId === val);
                                    setValue('equipmentId', val);
                                    setValue('equipmentName', equipment?.name || '');
                                    if (equipment?.deptId) {
                                        setValue('deptId', equipment.deptId);
                                        const dept = departments.find(d => d.deptId === equipment.deptId);
                                        setValue('deptName', dept?.name);
                                    }
                                }}
                                placeholder="설비 검색..."
                                displayFormat={(item) => `${item.name} (${item.equipmentId})`}
                                disabled={!isPlanEditable && !isResultEditable}
                            />
                            <input type="hidden" {...register('equipmentName', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>점검 유형 <span className="text-red-500">*</span></Label>
                            <Select
                                value={watch('codeItem') || ''}
                                onValueChange={(val: string) => setValue('codeItem', val)}
                                disabled={!isPlanEditable && !isResultEditable}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="점검 유형 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {inspTypes.map(type => (
                                        <SelectItem key={type.itemId} value={type.itemId}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <input type="hidden" {...register('codeItem', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>관리 부서 <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                items={departments.map((d: any) => ({ ...d, id: d.deptId }))}
                                value={watch('deptId') || ''}
                                onChange={(val) => {
                                    const dept = departments.find(d => d.deptId === val);
                                    setValue('deptId', val);
                                    setValue('deptName', dept?.name);
                                }}
                                placeholder="부서 검색..."
                                displayFormat={(item) => item.name}
                                disabled={!isPlanEditable && !isResultEditable}
                            />
                            <input type="hidden" {...register('deptName')} />
                        </div>
                        <div className="space-y-2">
                            <Label>담당자 <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                items={persons.filter(p => !watch('deptId') || p.deptId === watch('deptId')).map(p => ({ ...p, id: p.personId }))}
                                value={watch('personId') || ''}
                                onChange={(val) => {
                                    const person = persons.find(p => p.personId === val);
                                    setValue('personId', val);
                                    setValue('personName', person?.name);
                                }}
                                placeholder="담당자 검색..."
                                displayFormat={(item) => `${item.name} (${item.position || ''})`}
                                disabled={!isPlanEditable && !isResultEditable}
                            />
                            <input type="hidden" {...register('personName')} />
                        </div>

                        {/* Row 3 - Full Width Description */}
                        <div className="space-y-2 lg:col-span-4">
                            <Label>비고 / 특이사항</Label>
                            <Textarea {...register('note')} placeholder="특이사항 입력" disabled={!isPlanEditable && !isResultEditable} className="min-h-[80px]" />
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
                                                <td className="p-3">
                                                    <Input
                                                        value={item.name}
                                                        onChange={(e) => updateItem(item.seq, 'name', e.target.value)}
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
                                                        type="number"
                                                        value={item.stdVal || ''}
                                                        onChange={(e) => updateItem(item.seq, 'stdVal', parseFloat(e.target.value))}
                                                        disabled={!isPlanEditable}
                                                        placeholder="0.0"
                                                        className={!isPlanEditable ? "bg-transparent border-none px-0 shadow-none text-right" : "text-right"}
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
                                                <td className="p-3 text-center">
                                                    {isResultEditable ? (
                                                        <Input
                                                            type="number"
                                                            value={item.resultVal || ''}
                                                            onChange={(e) => updateItem(item.seq, 'resultVal', parseFloat(e.target.value))}
                                                            placeholder="0"
                                                            className="h-8 text-right"
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-slate-700">
                                                            {item.resultVal !== undefined ? item.resultVal : '-'}
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

            <ApprovalLineModal
                open={isApprovalModalOpen}
                onOpenChange={setIsApprovalModalOpen}
                onSubmit={handleApprovalSubmit}
            />
        </div>
    );
}
