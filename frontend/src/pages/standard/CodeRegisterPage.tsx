
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { standardService } from '@/services/standardService';
import type { Code, CodeItem } from '@/services/standardService';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function CodeRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const isEditMode = !!id;
    const [items, setItems] = useState<CodeItem[]>([]);
    const user = useAuthStore((state) => state.user);

    const { register, handleSubmit, setValue } = useForm<Code>();

    useEffect(() => {
        // Auto-fill company_id from logged-in user
        if (user?.company_id) {
            setValue('company_id', user.company_id);
        }
    }, [user, setValue]);

    const fetchItems = () => {
        if (id) standardService.getCodeItems(id).then(setItems);
    };

    useEffect(() => {
        if (isEditMode && id) {
            standardService.getById('code', id).then((data: Code) => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof Code, data[key as keyof Code]);
                    });
                }
            });
            fetchItems();
        }
    }, [id, isEditMode, setValue]);

    const handleDeleteCodeItem = async (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation();
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await standardService.deleteCodeItem(id!, itemId);
            toast({ title: "성공", description: "상세 코드가 삭제되었습니다." });
            fetchItems();
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "삭제 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    const onSubmit = async (data: Code) => {
        try {
            if (isEditMode && id) {
                await standardService.update('code', id, data);
                toast({ title: "성공", description: "코드가 수정되었습니다." });
            } else {
                await standardService.create('code', data);
                toast({ title: "성공", description: "코드가 등록되었습니다." });
            }
            navigate('/standard/code');
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/standard/code')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '코드 수정' : '코드 등록'}</h1>
                        <p className="text-muted-foreground">{isEditMode ? '기존 코드 정보를 수정합니다.' : '신규 코드를 등록합니다.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/standard/code')}>취소</Button>
                    <Button type="submit" form="code-form" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <form id="code-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">코드 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>코드 ID <span className="text-red-500">*</span></Label>
                            <Input {...register('id', { required: !isEditMode })} placeholder="EQUIP_TYPE" disabled={isEditMode} className={isEditMode ? 'bg-slate-50' : ''} />
                        </div>
                        <div className="space-y-2">
                            <Label>코드명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="코드명 입력" disabled={isEditMode} className={isEditMode ? 'bg-slate-50' : ''} />
                        </div>
                        <div className="space-y-2">
                            <Label>회사 ID <span className="text-red-500">*</span></Label>
                            <Input {...register('company_id', { required: true })} disabled className="bg-slate-50" />
                        </div>
                    </CardContent>
                </Card>
            </form>

            {isEditMode && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">상세 코드 관리</CardTitle>
                        <Button size="sm" onClick={() => navigate(`/standard/code/${id}/item/new`)} className="bg-green-600 hover:bg-green-700">
                            <Plus className="mr-2 h-4 w-4" /> 상세 코드 추가
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-slate-500">코드ID</th>
                                        <th className="px-4 py-3 font-medium text-slate-500">코드명</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 text-center">작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">등록된 상세 코드가 없습니다.</td></tr>
                                    ) : (
                                        items.map((item) => (
                                            <tr
                                                key={item.item_id}
                                                className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/standard/code/${id}/item/${item.item_id}`)}
                                            >
                                                <td className="px-4 py-3 font-medium">{item.item_id}</td>
                                                <td className="px-4 py-3">{item.name}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={(e) => handleDeleteCodeItem(e, item.item_id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
