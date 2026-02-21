
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, X, ArrowLeft, Save,
    UserPlus, ChevronLeft, ChevronRight, ArrowRight,
    FileText, Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { standardService, type Person } from '@/services/standardService';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { FileAttachment, type AttachedFile } from '@/components/common/FileAttachment';

import { approvalService, type Approval, type ApprovalStep, type DecisionType } from '@/services/approvalService';
import { useAuthStore } from '@/features/auth/useAuthStore';

// UI Helper for Decision Type
const DECISION_TYPE_MAP: Record<DecisionType, string> = {
    '00': '기안',
    '01': '결재',
    '02': '합의',
    '03': '참조',
    '04': '반려'
};

interface ApprovalLineItem {
    id: number;
    user: Person;
    type: DecisionType; // Use DB code
    order: number;
}

export default function ApprovalRegisterPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // State
    const [approvalLine, setApprovalLine] = useState<ApprovalLineItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState<string>('');
    const [selectedType, setSelectedType] = useState<DecisionType>('01'); // Default to Approval
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [loading, setLoading] = useState(false);

    // Auth User
    const { user: currentUser } = useAuthStore();

    // Load persons from standardService
    const [persons, setPersons] = useState<Person[]>([]);
    useEffect(() => {
        standardService.getAll('person').then(setPersons);
    }, []);

    // Current User (Fallbacks)
    const currentUserName = currentUser?.name || 'Unknown';
    const currentUserDept = currentUser?.dept_id || 'Unknown';

    const handleAddApprover = () => {
        if (!selectedPersonId) return;

        const person = persons.find(p => p.person_id === selectedPersonId);
        if (!person) return;

        // Check for duplicates
        if (approvalLine.some(item => item.user.person_id === person.person_id)) {
            toast({
                title: "중복 선택",
                description: "이미 결재선에 포함된 사용자입니다.",
                variant: "destructive"
            });
            return;
        }

        const newItem: ApprovalLineItem = {
            id: Date.now(),
            user: person,
            type: selectedType,
            order: approvalLine.length + 1
        };

        setApprovalLine([...approvalLine, newItem]);
        setSelectedPersonId('');
        setIsModalOpen(false);
    };

    const handleRemove = (id: number) => {
        setApprovalLine(approvalLine.filter(item => item.id !== id));
    };

    const handleMove = (index: number, direction: 'up' | 'down', list: ApprovalLineItem[]) => {
        if (direction === 'up' && index > 0) {
            const newList = [...list];
            [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
            newList.forEach((item, idx) => item.order = idx + 1);
            setApprovalLine(newList);
        } else if (direction === 'down' && index < list.length - 1) {
            const newList = [...list];
            [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
            newList.forEach((item, idx) => item.order = idx + 1);
            setApprovalLine(newList);
        }
    };

    const onSave = async (status: 'T' | 'A') => {
        if (!titleRef.current?.value || !contentRef.current?.value) {
            toast({ title: "입력 오류", description: "제목과 내용을 입력해 주세요.", variant: "destructive" });
            return;
        }

        if (status === 'A' && approvalLine.length === 0) {
            toast({ title: "결재선 미지정", description: "최소 1명 이상의 결재자를 지정해야 합니다.", variant: "destructive" });
            return;
        }

        try {
            setLoading(true);
            const approvalData: Partial<Approval> = {
                title: titleRef.current.value,
                content: contentRef.current.value,
                requester_id: currentUser?.id,
            };

            const steps: Partial<ApprovalStep>[] = approvalLine.map((item, index) => ({
                person_id: item.user.person_id,
                decision: item.type,
                line_no: index + 1,
                result: '00'
            }));

            await approvalService.save(approvalData, steps, status);

            toast({
                title: status === 'A' ? "기안 상신 완료" : "임시 저장 완료",
                description: status === 'A' ? "결재 문서가 성공적으로 상신되었습니다." : "문서가 임시 저장되었습니다.",
            });
            navigate('/approval/outbox');
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "처리 중 오류가 발생했습니다.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10 relative">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">기안 작성</h1>
                        <p className="text-muted-foreground">새로운 결재 문서를 작성합니다.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>취소</Button>
                    <Button variant="secondary" onClick={() => onSave('T')} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" /> 임시 저장
                    </Button>
                    <Button onClick={() => onSave('A')} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        <FileText className="mr-2 h-4 w-4" /> 상신
                    </Button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-lg w-[400px] p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">결재자 추가</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label>사용자 선택</Label>
                                <SearchableSelect
                                    items={persons}
                                    value={selectedPersonId}
                                    onChange={setSelectedPersonId}
                                    placeholder="이름 검색..."
                                    displayFormat={(p) => `${p.name} ${p.position || ''} (${p.person_id})`}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>구분</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div
                                        onClick={() => setSelectedType('01')}
                                        className={`flex flex-col items-center justify-center p-2 border rounded cursor-pointer ${selectedType === '01' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-slate-50'}`}
                                    >
                                        <span className="text-sm font-medium">결재</span>
                                    </div>
                                    <div
                                        onClick={() => setSelectedType('02')}
                                        className={`flex flex-col items-center justify-center p-2 border rounded cursor-pointer ${selectedType === '02' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'hover:bg-slate-50'}`}
                                    >
                                        <span className="text-sm font-medium">합의</span>
                                    </div>
                                    <div
                                        onClick={() => setSelectedType('03')}
                                        className={`flex flex-col items-center justify-center p-2 border rounded cursor-pointer ${selectedType === '03' ? 'bg-slate-100 border-slate-500 text-slate-700' : 'hover:bg-slate-50'}`}
                                    >
                                        <span className="text-sm font-medium">참조</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleAddApprover} disabled={!selectedPersonId}>추가</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="h-5 w-5" /> 결재선 지정
                        </CardTitle>
                        <Button size="sm" onClick={() => setIsModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> 결재자 추가
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 overflow-x-auto p-4 border rounded-lg bg-slate-50 min-h-[120px]">
                            <div className="flex flex-col items-center min-w-[100px] bg-white p-2 rounded-lg border shadow-sm relative opacity-70">
                                <Badge variant="outline" className="mb-1 text-xs bg-slate-100 text-slate-500 border-none px-2 py-0.5">기안</Badge>
                                <div className="text-sm font-bold">{currentUserName}</div>
                                <div className="text-xs text-muted-foreground">{currentUserDept}</div>
                            </div>
                            <ArrowRight className="text-slate-300" />
                            {approvalLine.map((item, index) => (
                                <div key={item.id} className="flex items-center">
                                    <div className="flex flex-col items-center min-w-[100px] bg-white p-2 rounded-lg border shadow-sm relative group hover:border-blue-400 transition-colors">
                                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-md rounded-full p-1 border z-10">
                                            <button onClick={() => handleMove(index, 'up', approvalLine)} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="h-3 w-3 text-slate-500" /></button>
                                            <button onClick={() => handleMove(index, 'down', approvalLine)} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight className="h-3 w-3 text-slate-500" /></button>
                                            <button onClick={() => handleRemove(item.id)} className="p-1 hover:bg-red-50 rounded-full"><X className="h-3 w-3 text-red-500" /></button>
                                        </div>
                                        <Badge variant="outline" className={`mb-1 text-xs border-none px-2 py-0.5 ${item.type === '01' ? 'bg-blue-100 text-blue-700' : item.type === '02' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {DECISION_TYPE_MAP[item.type]}
                                        </Badge>
                                        <div className="text-sm font-bold">{item.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.user.dept_id || ''} {item.user.position || ''}</div>
                                    </div>
                                    {index < approvalLine.length - 1 && <ArrowRight className="text-slate-300 mx-1" />}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" /> 문서 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>제목 <span className="text-red-500">*</span></Label>
                            <Input ref={titleRef} placeholder="기안 제목을 입력하세요" />
                        </div>
                        <div className="space-y-2">
                            <Label>내용 <span className="text-red-500">*</span></Label>
                            <Textarea ref={contentRef} className="min-h-[400px]" placeholder="상세 내용을 입력하세요." />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4" /> 첨부파일
                            </Label>
                            <FileAttachment files={attachedFiles} onChange={setAttachedFiles} maxFiles={5} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
