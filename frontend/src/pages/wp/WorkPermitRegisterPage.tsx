
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
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

export default function WorkPermitRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState<'T' | 'C'>('T');
    const isEditMode = !!id;


    const { register, handleSubmit, setValue, watch } = useForm<WorkPermit>({
        defaultValues: {
            wp_types: [], // Default empty (General is implied/mandatory)
            status: 'T',
            stage: 'PLN'
        }
    });

    const selectedTypes = watch('wp_types') || [];

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
            setValue('wp_types', [...current, type]);
        } else {
            setValue('wp_types', current.filter(t => t !== type));
        }
    };

    const onSubmit = async (data: WorkPermit) => {
        try {
            setLoading(true);
            const payload = {
                ...data,
                status: actionType
            };

            if (isEditMode && id) {
                await workPermitService.update(id, payload);
                toast({ title: "성공", description: actionType === 'C' ? "허가 신청이 확정되었습니다." : "허가 신청이 수정되었습니다." });
            } else {
                await workPermitService.create(payload);
                toast({ title: "성공", description: actionType === 'C' ? "작업허가가 확정 신청되었습니다." : "작업허가 신청이 임시 저장되었습니다." });
            }
            navigate('/wp/work-permit');
        } catch (error: any) {
            console.error(error);
            toast({ title: "오류", description: error.response?.data?.message || "저장 중 오류 발생", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const isConfirmed = watch('status') === 'C';

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
                    {!isConfirmed && (
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
                            <Input {...register('permit_id')} placeholder="자동 생성" disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>작업명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="예: 배관 용접 작업" disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2">
                            <Label>신청일자</Label>
                            <Input type="date" disabled value={new Date().toISOString().split('T')[0]} className="bg-slate-50" />
                        </div>

                        <div className="space-y-2">
                            <Label>대상 설비</Label>
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
                            <input type="hidden" {...register('equipment_name')} />
                        </div>
                        <div className="space-y-2">
                            <Label>신청 부서</Label>
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
                            <Label>신청자</Label>
                            <SearchableSelect
                                items={filteredPersons}
                                value={watch('person_name') || ''}
                                onChange={(val) => setValue('person_name', val)}
                                placeholder="신청자 검색..."
                                displayFormat={(person) => `${person.name} ${person.position || ''} (${person.person_id})`}
                                disabled={isConfirmed}
                            />
                        </div>
                        <div className="space-y-2">
                        </div>

                        {/* Special Work Types Selection */}
                        <div className="col-span-1 md:col-span-4 space-y-3 border rounded-md p-4 bg-slate-50">
                            <Label className="font-semibold">특별 작업 유형 (중복 선택 가능)</Label>
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
                            <Input type="datetime-local" {...register('start_dt')} disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2">
                            <Label>종료 일시</Label>
                            <Input type="datetime-local" {...register('end_dt')} disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>작업 장소</Label>
                            <Input {...register('location')} placeholder="작업 위치 상세" disabled={isConfirmed} />
                        </div>

                        <div className="space-y-2 md:col-span-4">
                            <Label>작업 내용</Label>
                            <Textarea {...register('work_summary')} placeholder="작업 내용을 상세히 기술하세요." disabled={isConfirmed} className={isConfirmed ? "bg-slate-50 min-h-[80px]" : "min-h-[80px]"} />
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
                            <Input {...register('hazard_factor')} placeholder="예: 화재, 추락, 질식" disabled={isConfirmed} />
                        </div>
                        <div className="space-y-2">
                            <Label>안전 대책</Label>
                            <Input {...register('safety_factor')} placeholder="예: 소화기 비치, 안전벨트 착용" disabled={isConfirmed} />
                        </div>
                    </CardContent>
                </Card>

                {/* Common Safety Check */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">공통 안전 점검 (필수)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="com-check1" {...register('checksheet_json_com.check_ppe')} disabled={isConfirmed} />
                            <Label htmlFor="com-check1">1. 개인보호구(안전모, 안전화 등)를 착용하였는가?</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="com-check2" {...register('checksheet_json_com.check_edu')} disabled={isConfirmed} />
                            <Label htmlFor="com-check2">2. 작업 전 안전 교육(TBM)을 실시하였는가?</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Special Work Cards */}
                {selectedTypes.includes('HOT') && (
                    <Card className="border-red-200 bg-red-50/10">
                        <CardHeader className="pb-3 border-b border-red-100">
                            <CardTitle className="text-base text-red-700 flex items-center gap-2">
                                🔥 화기 작업 안전 조치
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="space-y-2">
                                <Label>화재 감시자</Label>
                                <Input {...register('checksheet_json_hot.fire_watcher')} placeholder="성명 입력" disabled={isConfirmed} />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <Checkbox id="hot-check1" {...register('checksheet_json_hot.fire_extinguisher')} disabled={isConfirmed} />
                                <Label htmlFor="hot-check1">소화기 비치 및 이상 유무 확인</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="hot-check2" {...register('checksheet_json_hot.welding_blanket')} disabled={isConfirmed} />
                                <Label htmlFor="hot-check2">불티 비산 방지포 설치 확인</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="hot-check3" {...register('checksheet_json_hot.gas_check')} disabled={isConfirmed} />
                                <Label htmlFor="hot-check3">주변 인화성 물질 제거 확인</Label>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {selectedTypes.includes('CONF') && (
                    <Card className="border-blue-200 bg-blue-50/10">
                        <CardHeader className="pb-3 border-b border-blue-100">
                            <CardTitle className="text-base text-blue-700 flex items-center gap-2">
                                💨 밀폐 공간 작업 안전 조치
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                            <div className="space-y-2">
                                <Label>산소 (O2) %</Label>
                                <Input {...register('checksheet_json_conf.gas_o2')} placeholder="18-23.5%" disabled={isConfirmed} />
                            </div>
                            <div className="space-y-2">
                                <Label>일산화탄소 (CO) ppm</Label>
                                <Input {...register('checksheet_json_conf.gas_co')} placeholder="< 30ppm" disabled={isConfirmed} />
                            </div>
                            <div className="space-y-2">
                                <Label>황화수소 (H2S) ppm</Label>
                                <Input {...register('checksheet_json_conf.gas_h2s')} placeholder="< 10ppm" disabled={isConfirmed} />
                            </div>
                            <div className="space-y-2">
                                <Label>가연성가스 (LEL) %</Label>
                                <Input {...register('checksheet_json_conf.gas_lel')} placeholder="< 25%" disabled={isConfirmed} />
                            </div>
                            <div className="md:col-span-4 flex items-center space-x-2">
                                <Checkbox id="conf-check1" {...register('checksheet_json_conf.ventilation')} disabled={isConfirmed} />
                                <Label htmlFor="conf-check1">환기 설비 가동 및 적정 공기 확인</Label>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </form>
        </div>
    );
}
