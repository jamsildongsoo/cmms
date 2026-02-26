
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, ArrowDownCircle, ArrowUpCircle, ArrowRightCircle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { inventoryService } from '@/services/inventoryService';
import type { Material, TransactionType, TransactionItem } from '@/services/inventoryService';
import { standardService, type Warehouse } from '@/services/standardService';

interface ProcessingForm {
    type: TransactionType;
    items: TransactionItem[];
}

export default function InventoryProcessingPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    const { register, control, handleSubmit, setValue, watch } = useForm<ProcessingForm>({
        defaultValues: {
            type: 'IN',
            items: [{ inventory_id: '', storage_id: '', current_stock: 0, qty: 0, ref: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const watchType = watch('type');

    useEffect(() => {
        inventoryService.getAllMaterials().then(setMaterials);
        standardService.getAll('warehouse').then(setWarehouses);
    }, []);

    const handleMaterialChange = (index: number, inventoryId: string) => {
        const material = materials.find(m => m.inventory_id === inventoryId);
        if (material) {
            // We use standard 'update' from useFieldArray, or just setValue
            // However, update replaces the whole item. Let's use setValue for specific fields to avoid resetting unrelated ones if we want, 
            // but here we are initializing the row with material data, so replacing is fine or just setting the ID.
            // Actually, we should just set the value.
            setValue(`items.${index}.inventory_id`, inventoryId);
        }
    };

    const onSubmit = async (data: ProcessingForm) => {
        try {
            const validItems = data.items.filter(item => item.inventory_id && item.qty > 0);
            if (validItems.length === 0) {
                toast({ title: "경고", description: "처리할 품목을 입력해주세요.", variant: "destructive" });
                return;
            }

            await inventoryService.processTransaction(data.type, validItems);
            toast({ title: "성공", description: "재고 처리가 완료되었습니다." });
            navigate('/inventory/status');
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "처리 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/status')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">재고 처리</h1>
                        <p className="text-muted-foreground">입고, 출고, 이동, 재고조사 결과를 등록합니다.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/inventory/status')}>취소</Button>
                    <Button onClick={handleSubmit(onSubmit)} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">처리 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Header: Transaction Type - Radio Style */}
                    <div className="space-y-3">
                        <Label>처리 유형</Label>
                        <div className="grid grid-cols-4 gap-4">
                            <div
                                onClick={() => setValue('type', 'IN')}
                                className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-slate-50 transition-all ${watchType === 'IN' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200'
                                    }`}
                            >
                                <ArrowDownCircle className={`h-6 w-6 mb-2 ${watchType === 'IN' ? 'text-blue-600' : 'text-slate-500'}`} />
                                <span className={`font-medium ${watchType === 'IN' ? 'text-blue-700' : 'text-slate-700'}`}>입고</span>
                            </div>

                            <div
                                onClick={() => setValue('type', 'OUT')}
                                className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-slate-50 transition-all ${watchType === 'OUT' ? 'border-red-600 bg-red-50 ring-1 ring-red-600' : 'border-slate-200'
                                    }`}
                            >
                                <ArrowUpCircle className={`h-6 w-6 mb-2 ${watchType === 'OUT' ? 'text-red-600' : 'text-slate-500'}`} />
                                <span className={`font-medium ${watchType === 'OUT' ? 'text-red-700' : 'text-slate-700'}`}>출고</span>
                            </div>

                            <div
                                onClick={() => setValue('type', 'MOVE')}
                                className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-slate-50 transition-all ${watchType === 'MOVE' ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600' : 'border-slate-200'
                                    }`}
                            >
                                <ArrowRightCircle className={`h-6 w-6 mb-2 ${watchType === 'MOVE' ? 'text-amber-600' : 'text-slate-500'}`} />
                                <span className={`font-medium ${watchType === 'MOVE' ? 'text-amber-700' : 'text-slate-700'}`}>이동</span>
                            </div>

                            <div
                                onClick={() => setValue('type', 'ADJUST')}
                                className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-slate-50 transition-all ${watchType === 'ADJUST' ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-slate-200'
                                    }`}
                            >
                                <ClipboardCheck className={`h-6 w-6 mb-2 ${watchType === 'ADJUST' ? 'text-purple-600' : 'text-slate-500'}`} />
                                <span className={`font-medium ${watchType === 'ADJUST' ? 'text-purple-700' : 'text-slate-700'}`}>재고조사</span>
                            </div>
                        </div>
                    </div>

                    {/* Table: Items */}
                    <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[30%]">자재 번호</th>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[20%]">창고</th>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[15%] text-right">수량</th>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[25%]">참조 번호</th>
                                    <th className="h-10 px-4 font-medium text-slate-500 w-[10%]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {fields.map((field, index) => (
                                    <tr key={field.id} className="hover:bg-slate-50/50">
                                        <td className="p-2">
                                            <Select
                                                value={watch(`items.${index}.inventory_id`)}
                                                onValueChange={(val: string) => handleMaterialChange(index, val)}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="자재 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {materials.map(m => (
                                                        <SelectItem key={m.inventory_id} value={m.inventory_id || ''}>
                                                            [{m.inventory_id}] {m.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-2">
                                            <Select
                                                value={watch(`items.${index}.storage_id`)}
                                                onValueChange={(val: string) => setValue(`items.${index}.storage_id`, val)}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="창고 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map(w => (
                                                        <SelectItem key={w.id} value={w.id}>
                                                            {w.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                {...register(`items.${index}.qty`, { valueAsNumber: true })}
                                                className="h-9 text-right font-bold"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input {...register(`items.${index}.ref`)} className="h-9" placeholder="PO/WO No." />
                                        </td>
                                        <td className="p-2 text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-2 bg-slate-50 border-t flex justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed"
                                onClick={() => append({ inventory_id: '', storage_id: '', current_stock: 0, qty: 0, ref: '' })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> 품목 추가
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
