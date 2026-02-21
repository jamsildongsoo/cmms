
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { workOrderService } from '@/services/workOrderService';
import { standardService, type Dept, type Person } from '@/services/standardService';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import type { WorkOrder } from '@/types/workOrder';
import { equipmentService } from '@/services/equipmentService';
import type { Equipment } from '@/types/equipment';

interface WorkItem {
    seq: number;
    task_name: string; // 작업명
    method: string; // 방법
    result: string; // 조치결과 (Result Mode only)
    remark: string;
}

export default function WorkOrderRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState<'T' | 'C'>('T');
    const location = useLocation();

    // Mode Detection
    const isEditMode = !!id;
    const isResultMode = location.pathname.includes('/result'); // Detects /wo/work-order/result/new

    // Result Mode Inputs (from Query Params)
    const [searchParams] = useSearchParams();
    const refEntityParam = searchParams.get('ref_entity');
    const refIdParam = searchParams.get('ref_id');

    const { register, handleSubmit, setValue, watch } = useForm<WorkOrder>({
        defaultValues: {
            status: 'T',
            stage: isResultMode ? 'ACT' : 'PLN', // Force stage based on mode
            ref_entity: refEntityParam || undefined,
            ref_id: refIdParam || undefined,
        }
    });

    // Department & User data for SearchableSelect
    const [departments, setDepartments] = useState<Dept[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [equipments, setEquipments] = useState<Equipment[]>([]);

    useEffect(() => {
        standardService.getAll('dept').then(setDepartments);
        standardService.getAll('person').then(setPersons);
        equipmentService.getAll().then(setEquipments);
    }, []);

    const selectedDeptId = watch('dept_id');
    const filteredPersons = useMemo(() => {
        if (!selectedDeptId) return persons;
        return persons.filter(p => p.dept_id === selectedDeptId);
    }, [selectedDeptId, persons]);

    const [workItems, setWorkItems] = useState<WorkItem[]>([
        { seq: 1, task_name: '', method: '', result: '', remark: '' },
    ]);

    useEffect(() => {
        if (isEditMode && id) {
            workOrderService.getById(id).then(data => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof WorkOrder, data[key as keyof WorkOrder]);
                    });
                }
            });
        } else if (isResultMode && refIdParam) {
            // Load Plan data for Result Mode
            workOrderService.getById(refIdParam).then(planData => {
                if (planData) {
                    setValue('name', planData.name + ' (실적)');
                    setValue('equipment_id', planData.equipment_id);
                    setValue('equipment_name', planData.equipment_name);
                    setValue('dept_id', planData.dept_id);
                    setValue('person_id', planData.person_id);
                    setValue('code_item', planData.code_item);
                    setValue('note', planData.note);
                    setValue('stage', 'ACT');
                    setValue('ref_entity', 'WO');
                    setValue('ref_id', refIdParam);

                    if (planData.items && Array.isArray(planData.items)) {
                        setWorkItems(planData.items.map((item: any) => ({
                            seq: item.seq || item.line_no,
                            task_name: item.task_name || item.name,
                            method: item.method,
                            result: '', // Clear result
                            remark: ''
                        })));
                    }
                }
            });
        }
    }, [id, isEditMode, isResultMode, refIdParam, setValue]);

    // Work Items helpers
    const addWorkItem = () => {
        setWorkItems(prev => [...prev, { seq: prev.length + 1, task_name: '', method: '', result: '', remark: '' }]);
    };
    const removeWorkItem = (seq: number) => {
        setWorkItems(prev => prev.filter(i => i.seq !== seq).map((item, idx) => ({ ...item, seq: idx + 1 })));
    };
    const updateWorkItem = (seq: number, field: keyof WorkItem, value: string) => {
        setWorkItems(prev => prev.map(i => i.seq === seq ? { ...i, [field]: value } : i));
    };

    const onSubmit = async (data: WorkOrder) => {
        try {
            setLoading(true);
            const payload = {
                ...data,
                status: actionType,
                items: workItems
            };

            if (isEditMode && id) {
                await workOrderService.update(id, payload);
                toast({ title: "성공", description: actionType === 'C' ? "작업 정보가 확정되었습니다." : "작업 정보가 수정되었습니다." });
            } else {
                await workOrderService.create(payload);
                toast({ title: "성공", description: actionType === 'C' ? "신규 작업이 확정 등록되었습니다." : "신규 작업이 임시 저장되었습니다." });
            }
            navigate('/wo/work-order');
        } catch (error: any) {
            console.error(error);
            toast({ title: "오류", description: error.response?.data?.message || "저장 실패", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const isConfirmed = watch('status') === 'C';

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/wo/work-order')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isResultMode ? '작업 실적 등록' : (isEditMode ? '작업 수정' : '작업 요청 (등록)')}
                        </h1>
                        <p className="text-muted-foreground">
                            {isResultMode ? '작업 결과를 등록합니다.' : '신규 작업 요청을 등록합니다.'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/wo/work-order')}>목록</Button>
                    {!isConfirmed && (
                        <>
                            <Button
                                type="submit"
                                form="wo-form"
                                disabled={loading}
                                variant="secondary"
                                onClick={() => setActionType('T')}
                            >
                                <Save className="mr-2 h-4 w-4" /> 임시 저장
                            </Button>
                            <Button
                                type="submit"
                                form="wo-form"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setActionType('C')}
                            >
                                <Save className="mr-2 h-4 w-4" /> 확정
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <form id="wo-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* 작업 기본 정보 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">작업 요청 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>지시번호</Label>
                            <Input {...register('order_id')} placeholder="자동 생성" disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>작업명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="예: 2호기 모터 소음 조치" disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2">
                            <Label>요청일자</Label>
                            <Input type="date" {...register('date')} disabled={isConfirmed} />
                        </div>

                        {isResultMode && (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">단계</Label>
                                    <Input value="ACT (실적)" disabled className="bg-slate-50 text-slate-500" />
                                    <input type="hidden" {...register('stage')} value="ACT" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-muted-foreground">참조 구분 / ID</Label>
                                    <div className="flex gap-2">
                                        <Input value="WO (지시)" disabled className="bg-slate-50 text-slate-500 w-24" />
                                        <Input
                                            {...register('ref_id')}
                                            placeholder="참조 ID"
                                            className={refIdParam ? "bg-slate-50 flex-1" : "flex-1"}
                                            disabled={!!refIdParam}
                                        />
                                    </div>
                                    <input type="hidden" {...register('ref_entity')} value="WO" />
                                </div>
                            </>
                        )}

                        <div className="space-y-2 md:col-start-1">
                            <Label>대상 설비 <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                items={equipments.map(e => ({ ...e, id: e.equipment_id }))}
                                value={watch('equipment_id') || ''}
                                onChange={(val) => {
                                    const equipment = equipments.find(e => e.equipment_id === val);
                                    setValue('equipment_id', val);
                                    setValue('equipment_name', equipment?.name || '');
                                    if (equipment?.dept_id) {
                                        setValue('dept_id', equipment.dept_id);
                                    }
                                }}
                                placeholder="설비 검색..."
                                displayFormat={(item) => `${item.name} (${item.equipment_id})`}
                                disabled={isConfirmed}
                            />
                            <input type="hidden" {...register('equipment_name', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>작업 유형</Label>
                            <Select onValueChange={(val: string) => setValue('code_item', val)} defaultValue="고장수리" disabled={isConfirmed}>
                                <SelectTrigger>
                                    <SelectValue placeholder="선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="고장수리">고장수리</SelectItem>
                                    <SelectItem value="예방점검">예방점검</SelectItem>
                                    <SelectItem value="설치공사">설치공사</SelectItem>
                                    <SelectItem value="일반작업">일반작업</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>관리 부서</Label>
                            <SearchableSelect
                                items={departments}
                                value={watch('dept_id') || ''}
                                onChange={(val) => setValue('dept_id', val)}
                                placeholder="부서 검색..."
                                displayFormat={(dept) => `${dept.name} (${dept.id})`}
                                disabled={isConfirmed}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>담당자</Label>
                            <SearchableSelect
                                items={filteredPersons}
                                value={watch('person_id') || ''}
                                onChange={(val) => setValue('person_id', val)}
                                placeholder="담당자 검색..."
                                displayFormat={(person) => `${person.name} ${person.position || ''} (${person.person_id})`}
                                disabled={isConfirmed}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>예상 비용 (원)</Label>
                            <Input type="number" {...register('cost', { valueAsNumber: true })} placeholder="0" disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2">
                            <Label>예상 시간 (M/D)</Label>
                            <Input type="number" step="0.1" {...register('time', { valueAsNumber: true })} placeholder="0.0" disabled={isConfirmed} />
                        </div>

                        <div className="space-y-2 md:col-span-4">
                            <Label>요청 내용</Label>
                            <Textarea {...register('note')} placeholder="고장 증상 및 요청 내용을 상세히 입력하세요." disabled={isConfirmed} className={isConfirmed ? "bg-slate-50 min-h-[100px]" : "min-h-[100px]"} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">작업 항목 (계획/실적)</CardTitle>
                        {!isConfirmed && (
                            <Button type="button" variant="outline" size="sm" onClick={addWorkItem}>
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
                                        <th className="h-10 px-4 font-medium text-slate-500">작업명</th>
                                        <th className="h-10 px-4 font-medium text-slate-500">작업 방법</th>
                                        <th className="h-10 px-4 font-medium text-slate-500 w-48">조치 결과 (실적)</th>
                                        {!isConfirmed && <th className="h-10 px-4 font-medium text-slate-500 w-16"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {workItems.map((item, index) => (
                                        <tr key={item.seq} className="hover:bg-slate-50/50">
                                            <td className="p-3 text-center text-slate-500 font-mono">{index + 1}</td>
                                            <td className="p-3">
                                                <Input
                                                    value={item.task_name}
                                                    onChange={(e) => updateWorkItem(item.seq, 'task_name', e.target.value)}
                                                    placeholder="작업명"
                                                    disabled={isConfirmed}
                                                    className={isConfirmed ? "bg-transparent border-none px-0 shadow-none text-slate-500" : "bg-transparent border-none px-0 shadow-none"}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    value={item.method}
                                                    onChange={(e) => updateWorkItem(item.seq, 'method', e.target.value)}
                                                    placeholder="작업 방법"
                                                    disabled={isConfirmed}
                                                    className={isConfirmed ? "bg-transparent border-none px-0 shadow-none text-slate-500" : "bg-transparent border-none px-0 shadow-none"}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    value={item.result}
                                                    onChange={(e) => updateWorkItem(item.seq, 'result', e.target.value)}
                                                    placeholder={isResultMode && !isConfirmed ? "조치 결과 입력" : ""}
                                                    disabled={!isResultMode || isConfirmed}
                                                    className={`h-8 text-sm ${(!isResultMode || isConfirmed) ? 'bg-transparent border-none px-0 shadow-none' : ''}`}
                                                />
                                            </td>
                                            {!isConfirmed && (
                                                <td className="p-3 text-center">
                                                    {workItems.length > 1 && (
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeWorkItem(item.seq)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
