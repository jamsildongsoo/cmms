import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { standardService, type Dept, type Person } from '@/services/standardService';
import type { ApprovalStep } from '@/services/approvalService';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/useAuthStore';

interface ApprovalLineModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (steps: ApprovalStep[]) => void;
    isSubmitting?: boolean;
}

interface StepForm {
    id: string;
    personId: string;
    personName?: string;
    deptId: string;
    decision: string; // 01:결재, 02:합의, 03:통보
}

export function ApprovalLineModal({ open, onOpenChange, onSubmit, isSubmitting = false }: ApprovalLineModalProps) {
    const { user } = useAuthStore();
    const [departments, setDepartments] = useState<Dept[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-fill initial state to have one step
    const [steps, setSteps] = useState<StepForm[]>([
        { id: Date.now().toString(), personId: '', deptId: '', decision: '01' }
    ]);

    useEffect(() => {
        if (open && user?.companyId) {
            loadData();
        } else if (!open) {
            // Reset state when closing
            setSteps([{ id: Date.now().toString(), personId: '', deptId: '', decision: '01' }]);
        }
    }, [open, user?.companyId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [deptRes, personRes] = await Promise.all([
                standardService.getAll('dept'),
                standardService.getAll('person')
            ]);
            setDepartments(deptRes.filter((d: Dept) => d.deleteMark !== 'Y'));
            setPersons(personRes.filter((p: Person) => p.deleteMark !== 'Y'));
        } catch (error) {
            console.error('Failed to load standard info:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addStep = () => {
        setSteps([...steps, { id: Date.now().toString(), personId: '', deptId: '', decision: '01' }]);
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const updateStep = (id: string, field: keyof StepForm, value: string) => {
        setSteps(steps.map(s => {
            if (s.id === id) {
                const updated = { ...s, [field]: value };
                if (field === 'personId') {
                    const person = persons.find(p => p.personId === value);
                    if (person) {
                        updated.personName = person.name;
                    }
                }
                if (field === 'deptId') {
                    updated.personId = ''; // Reset person when dept changes
                }
                return updated;
            }
            return s;
        }));
    };

    const handleSubmit = () => {
        // Validate
        const validSteps = steps.filter(s => s.personId && s.decision);
        if (validSteps.length === 0) {
            alert('최소 1명 이상의 결재선(결재/합의/통보)을 지정해주세요.');
            return;
        }

        // Map to ApprovalStep
        const approvalSteps: ApprovalStep[] = validSteps.map((s, idx) => ({
            companyId: user!.companyId,
            approvalId: '', // Filled by backend
            lineNo: idx + 1,
            personId: s.personId,
            decision: s.decision,
            result: 'P' // 미결(Pending)
        }));

        onSubmit(approvalSteps);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>결재선 지정</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-end gap-3 p-3 bg-gray-50 border rounded-lg">
                                    <div className="w-16">
                                        <Label className="text-xs text-gray-500 mb-1 block">순번</Label>
                                        <div className="h-10 flex items-center justify-center bg-gray-200 rounded font-semibold text-gray-600">
                                            {index + 1}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <Label>유형</Label>
                                        <Select value={step.decision} onValueChange={(v: string) => updateStep(step.id, 'decision', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="01">결재(01)</SelectItem>
                                                <SelectItem value="02">합의(02)</SelectItem>
                                                <SelectItem value="03">통보(03)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <Label>부서</Label>
                                        <Select value={step.deptId} onValueChange={(v: string) => updateStep(step.id, 'deptId', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="부서 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((d: Dept) => (
                                                    <SelectItem key={d.deptId} value={d.deptId}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <Label>담당자</Label>
                                        <Select value={step.personId} onValueChange={(v: string) => updateStep(step.id, 'personId', v)} disabled={!step.deptId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="담당자 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {persons.filter((p: Person) => p.deptId === step.deptId).map((p: Person) => (
                                                    <SelectItem key={p.personId} value={p.personId}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => removeStep(step.id)}
                                        disabled={steps.length <= 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button variant="outline" className="w-full border-dashed" onClick={addStep}>
                                <Plus className="w-4 h-4 mr-2" />
                                결재자 추가
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">
                                * 선택한 부서의 담당자만 결재선으로 지정할 수 있습니다.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        취소
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                처리중...
                            </>
                        ) : '상신하기'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
