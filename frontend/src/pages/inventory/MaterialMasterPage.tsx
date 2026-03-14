import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileUp, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { inventoryService } from '@/services/inventoryService';
import type { Material } from '@/services/inventoryService';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ExcelUploadModal } from '@/components/common/ExcelUploadModal';
import { STATUS_INFO } from '@/constants/status';

export default function MaterialMasterPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const loadMaterials = async () => {
        inventoryService.getAllMaterials().then(setMaterials);
    };

    useEffect(() => {
        loadMaterials();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("정말로 이 자재를 삭제하시겠습니까?")) return;

        try {
            await inventoryService.deleteMaterial(id);
            toast({ title: "성공", description: "자재가 삭제되었습니다." });
            loadMaterials();
        } catch (error) {
            console.error("Failed to delete material", error);
            toast({ title: "오류", description: "자재 삭제 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    const filteredList = materials.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.inventoryId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status?: string) => {
        const info = STATUS_INFO[status as keyof typeof STATUS_INFO] || { label: status || '임시', variant: 'secondary' };
        return <Badge variant={info.variant}>{info.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">자재 마스터</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                        <FileUp className="mr-2 h-4 w-4" /> 가져오기
                    </Button>
                    <Button variant="outline" onClick={() => inventoryService.downloadExcel(filteredList)}>
                        <Download className="mr-2 h-4 w-4" /> 다운로드
                    </Button>
                    <Button onClick={() => navigate('/master/material/new')} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> 자재 등록
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>자재 목록</CardTitle>
                    <div className="flex items-center space-x-2 pt-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="자재명 또는 코드 검색..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재코드</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재명</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">상태</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">규격</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">단위</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">자재유형</th>
                                    <th className="h-12 px-4 font-medium text-slate-500">제조사</th>
                                    <th className="h-12 px-4 text-center font-medium text-slate-500">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-4 text-slate-500">데이터가 없습니다.</td></tr>
                                ) : (
                                    filteredList.map((item) => (
                                        <tr
                                            key={item.inventoryId}
                                            className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/master/material/${item.inventoryId}`)}
                                        >
                                            <td className="h-12 px-4 font-mono text-xs">{item.inventoryId}</td>
                                            <td className="h-12 px-4 font-medium">{item.name}</td>
                                            <td className="h-12 px-4">{getStatusBadge(item.status)}</td>
                                            <td className="h-12 px-4 text-slate-600">{item.spec || '-'}</td>
                                            <td className="h-12 px-4">{item.unit}</td>
                                            <td className="h-12 px-4">{item.codeItem || '-'}</td>
                                            <td className="h-12 px-4">{item.makerName || '-'}</td>
                                            <td className="h-12 px-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => handleDelete(e, item.inventoryId!)}
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

            <ExcelUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                title="자재"
                validateUrl="/api/master/inventory/validate"
                uploadUrl="/api/master/inventory/upload"
                templateUrl="/api/master/inventory/template"
                columns={[
                    { name: '자재명', required: true },
                    { name: '자재유형', required: false },
                    { name: '부서', required: false },
                    { name: '단위', required: false },
                    { name: '제조사', required: false },
                    { name: '규격', required: false },
                    { name: '모델', required: false },
                ]}
                onSuccess={loadMaterials}
            />
        </div>
    );
}
