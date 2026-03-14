
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { standardService, type Storage, type Plant, type Bin, type Location } from '@/services/standardService';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function StorageRegisterPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const isEditMode = !!id;

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Storage>();
    const [plants, setPlants] = useState<Plant[]>([]);
    const user = useAuthStore((state) => state.user);

    // Bin / Location 관리
    const [bins, setBins] = useState<Bin[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [newBinId, setNewBinId] = useState('');
    const [newBinName, setNewBinName] = useState('');
    const [newLocId, setNewLocId] = useState('');
    const [newLocName, setNewLocName] = useState('');
    const [newLocBinId, setNewLocBinId] = useState('');

    useEffect(() => {
        standardService.getAll('plant').then(setPlants);
    }, []);

    useEffect(() => {
        if (user?.companyId) {
            setValue('companyId', user.companyId);
        }
    }, [user, setValue]);

    useEffect(() => {
        if (isEditMode && id) {
            standardService.getById('storage', id).then((data: Storage) => {
                if (data) {
                    Object.keys(data).forEach(key => {
                        setValue(key as keyof Storage, data[key as keyof Storage]);
                    });
                }
            });
            loadBinsAndLocations();
        }
    }, [id, isEditMode, setValue]);

    const loadBinsAndLocations = async () => {
        if (!id) return;
        const [allBins, allLocations] = await Promise.all([
            standardService.getAll('bin'),
            standardService.getAll('location'),
        ]);
        setBins(allBins.filter((b: Bin) => b.storageId === id));
        setLocations(allLocations.filter((l: Location) => l.storageId === id));
    };

    const onSubmit = async (data: Storage) => {
        try {
            if (isEditMode && id) {
                await standardService.update('storage', id, data);
                toast({ title: "성공", description: "저장소 정보가 수정되었습니다." });
            } else {
                await standardService.create('storage', data);
                toast({ title: "성공", description: "저장소가 등록되었습니다." });
            }
            navigate('/standard/storage');
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    // Bin 추가
    const handleAddBin = async () => {
        if (!newBinId.trim()) {
            toast({ title: "경고", description: "BIN ID를 입력해주세요.", variant: "destructive" });
            return;
        }
        if (!newBinName.trim()) {
            toast({ title: "경고", description: "BIN명을 입력해주세요.", variant: "destructive" });
            return;
        }
        try {
            await standardService.create('bin', {
                binId: newBinId.trim(),
                storageId: id,
                name: newBinName.trim(),
            } as Partial<Bin>);
            setNewBinId('');
            setNewBinName('');
            toast({ title: "성공", description: "BIN이 추가되었습니다." });
            loadBinsAndLocations();
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "BIN 추가 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    // Bin 삭제
    const handleDeleteBin = async (binId: string) => {
        const hasLocations = locations.some(l => l.binId === binId);
        if (hasLocations) {
            toast({ title: "경고", description: "해당 BIN에 위치가 존재합니다. 위치를 먼저 삭제해주세요.", variant: "destructive" });
            return;
        }
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await standardService.delete('bin', binId);
            toast({ title: "성공", description: "BIN이 삭제되었습니다." });
            loadBinsAndLocations();
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "삭제 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    // Location 추가
    const handleAddLocation = async () => {
        if (!newLocId.trim()) {
            toast({ title: "경고", description: "위치 ID를 입력해주세요.", variant: "destructive" });
            return;
        }
        if (!newLocBinId) {
            toast({ title: "경고", description: "BIN을 선택해주세요.", variant: "destructive" });
            return;
        }
        if (!newLocName.trim()) {
            toast({ title: "경고", description: "위치명을 입력해주세요.", variant: "destructive" });
            return;
        }
        try {
            await standardService.create('location', {
                locationId: newLocId.trim(),
                storageId: id,
                binId: newLocBinId,
                name: newLocName.trim(),
            } as Partial<Location>);
            setNewLocId('');
            setNewLocName('');
            setNewLocBinId('');
            toast({ title: "성공", description: "위치가 추가되었습니다." });
            loadBinsAndLocations();
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "위치 추가 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    // Location 삭제
    const handleDeleteLocation = async (locationId: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await standardService.delete('location', locationId);
            toast({ title: "성공", description: "위치가 삭제되었습니다." });
            loadBinsAndLocations();
        } catch (error) {
            console.error(error);
            toast({ title: "오류", description: "삭제 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    const getBinName = (binId: string) => bins.find(b => b.binId === binId)?.name || binId;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/standard/storage')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? '저장소 수정' : '저장소 등록'}</h1>
                        <p className="text-muted-foreground">{isEditMode ? '기존 저장소 정보를 수정합니다.' : '신규 저장소를 등록합니다.'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/standard/storage')}>취소</Button>
                    <Button type="submit" form="storage-form" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
                    </Button>
                </div>
            </div>

            <form id="storage-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">저장소 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="storageId">저장소 코드 (ID) <span className="text-red-500">*</span></Label>
                            <Input
                                id="storageId"
                                {...register('storageId', { required: '저장소 코드는 필수입니다.' })}
                                placeholder="예: STR01"
                                disabled={isEditMode}
                                className={isEditMode ? "bg-slate-50" : ""}
                            />
                            {errors.storageId && <span className="text-xs text-red-500">{errors.storageId.message}</span>}
                            <input type="hidden" {...register('companyId')} />
                        </div>
                        <div className="space-y-2">
                            <Label>저장소명 <span className="text-red-500">*</span></Label>
                            <Input {...register('name', { required: true })} placeholder="저장소명 입력" />
                            {errors.name && <span className="text-red-500 text-xs">저장소명은 필수입니다.</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>사업장 <span className="text-red-500">*</span></Label>
                            <Select
                                value={watch('plantId') || ''}
                                onValueChange={(val: string) => setValue('plantId', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="사업장 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plants.map(plant => (
                                        <SelectItem key={plant.plantId} value={plant.plantId}>{plant.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>위치 상세</Label>
                            <Input {...register('location')} placeholder="예: 본관 1층" />
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* BIN / Location 관리 — 수정 모드에서만 표시 */}
            {isEditMode ? (
                <>
                    {/* BIN 관리 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">BIN 관리</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-medium text-slate-500 w-[25%]">BIN ID</th>
                                            <th className="px-4 py-3 font-medium text-slate-500">BIN명</th>
                                            <th className="px-4 py-3 font-medium text-slate-500 w-[80px] text-center">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {bins.length === 0 && (
                                            <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">등록된 BIN이 없습니다.</td></tr>
                                        )}
                                        {bins.map(bin => (
                                            <tr key={bin.binId} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-mono text-slate-600">{bin.binId}</td>
                                                <td className="px-4 py-3">{bin.name}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                                                        onClick={() => handleDeleteBin(bin.binId)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-3 bg-slate-50 border-t space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            value={newBinId}
                                            onChange={e => setNewBinId(e.target.value)}
                                            placeholder="BIN ID"
                                            className="h-9"
                                        />
                                        <Input
                                            value={newBinName}
                                            onChange={e => setNewBinName(e.target.value)}
                                            placeholder="BIN명 입력"
                                            className="h-9"
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddBin())}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full border-dashed" onClick={handleAddBin}>
                                        <Plus className="mr-1 h-4 w-4" /> BIN 추가
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location 관리 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">위치(Location) 관리</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-medium text-slate-500 w-[20%]">위치 ID</th>
                                            <th className="px-4 py-3 font-medium text-slate-500 w-[25%]">BIN</th>
                                            <th className="px-4 py-3 font-medium text-slate-500">위치명</th>
                                            <th className="px-4 py-3 font-medium text-slate-500 w-[80px] text-center">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {locations.length === 0 && (
                                            <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">등록된 위치가 없습니다.</td></tr>
                                        )}
                                        {locations.map(loc => (
                                            <tr key={loc.locationId} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-mono text-slate-600">{loc.locationId}</td>
                                                <td className="px-4 py-3">{getBinName(loc.binId || '')}</td>
                                                <td className="px-4 py-3">{loc.name}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                                                        onClick={() => handleDeleteLocation(loc.locationId)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-3 bg-slate-50 border-t space-y-2">
                                    <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-2">
                                        <Input
                                            value={newLocId}
                                            onChange={e => setNewLocId(e.target.value)}
                                            placeholder="위치 ID"
                                            className="h-9"
                                        />
                                        <Select value={newLocBinId} onValueChange={setNewLocBinId}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="BIN 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bins.map(b => (
                                                    <SelectItem key={b.binId} value={b.binId}>{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={newLocName}
                                            onChange={e => setNewLocName(e.target.value)}
                                            placeholder="위치명 입력"
                                            className="h-9"
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full border-dashed" onClick={handleAddLocation}>
                                        <Plus className="mr-1 h-4 w-4" /> 위치 추가
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center text-slate-400">
                        저장소를 먼저 등록한 후, 수정 화면에서 BIN과 위치를 관리할 수 있습니다.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
