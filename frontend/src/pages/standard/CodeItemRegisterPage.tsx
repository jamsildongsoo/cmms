
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { standardService } from '@/services/standardService';
import type { CodeItem } from '@/services/standardService';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function CodeItemRegisterPage() {
    const navigate = useNavigate();
    const { groupId, itemId } = useParams<{ groupId: string; itemId: string }>();
    const { toast } = useToast();
    const isEditMode = !!itemId;

    const { register, handleSubmit, setValue } = useForm<CodeItem>();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (groupId) {
            setValue('group_id', groupId);
        }

        if (isEditMode && groupId && itemId) {
            standardService.getCodeItem(groupId, itemId).then((data) => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof CodeItem, data[key as keyof CodeItem]);
                    });
                }
            });
        }
    }, [groupId, itemId, isEditMode, setValue]);

    const onSubmit = async (data: CodeItem) => {
        try {
            await standardService.saveCodeItem({ ...data, group_id: groupId! });
            toast({ title: "성공", description: isEditMode ? "코드 상세가 수정되었습니다." : "코드 상세가 등록되었습니다." });
            navigate(`/standard/code/${groupId}/edit`);
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/standard/code/${groupId}/edit`)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '상세 코드 수정' : '상세 코드 등록'}</h1>
                        <p className="text-muted-foreground">{isEditMode ? '기존 상세 코드 정보를 수정합니다.' : '신규 상세 코드를 등록합니다.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate(`/standard/code/${groupId}/edit`)}>취소</Button>
                    <Button type="submit" form="code-item-form" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <form id="code-item-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">상세 코드 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>회사 ID</Label>
                            <Input value={user?.company_id || ''} disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>코드 그룹 ID</Label>
                            <Input {...register('group_id')} disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>상세 코드 ID <span className="text-red-500">*</span></Label>
                            <Input {...register('id', { required: !isEditMode })} placeholder="PUMP" disabled={isEditMode} className={isEditMode ? 'bg-slate-50' : ''} />
                        </div>
                        <div className="space-y-2">
                            <Label>상세 코드명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="코드명 입력" />
                        </div>
                        <div className="space-y-2">
                            <Label>사용 여부</Label>
                            <Select onValueChange={(val: string) => setValue('is_active', val as 'Y' | 'N')} defaultValue="Y">
                                <SelectTrigger>
                                    <SelectValue placeholder="사용 여부 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Y">사용</SelectItem>
                                    <SelectItem value="N">미사용</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
