import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, FileUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { equipmentService } from "@/services/equipmentService";
import type { Equipment } from "@/types/equipment";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ExcelUploadModal } from "@/components/common/ExcelUploadModal";
import { STATUS_INFO } from "@/constants/status";

export default function EquipmentListPage() {
    const { toast } = useToast();
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        setIsLoading(true);
        try {
            const data = await equipmentService.getAll();
            setEquipmentList(data);
        } catch (error) {
            console.error("Failed to load equipment", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("정말로 이 설비를 삭제하시겠습니까?")) return;

        try {
            await equipmentService.delete(id);
            toast({ title: "성공", description: "설비가 삭제되었습니다." });
            loadEquipment();
        } catch (error) {
            console.error("Failed to delete equipment", error);
            toast({ title: "오류", description: "설비 삭제 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    const filteredList = equipmentList.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipmentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status?: string) => {
        const info = STATUS_INFO[status as keyof typeof STATUS_INFO] || { label: status || '임시', variant: 'secondary' };
        return <Badge variant={info.variant}>{info.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">설비 목록</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                        <FileUp className="mr-2 h-4 w-4" /> 가져오기
                    </Button>
                    <Button variant="outline" onClick={() => equipmentService.downloadExcel(filteredList)}>
                        <Download className="mr-2 h-4 w-4" /> 다운로드
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link to="/master/equipment/new">
                            <Plus className="mr-2 h-4 w-4" /> 설비 등록
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>설비 현황</CardTitle>
                    <div className="flex items-center space-x-2 pt-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="설비명 또는 코드 검색..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr className="border-b">
                                    <th className="h-12 px-4 text-left font-medium text-slate-500">코드</th>
                                    <th className="h-12 px-4 text-left font-medium text-slate-500">설비명</th>
                                    <th className="h-12 px-4 text-left font-medium text-slate-500">상태</th>
                                    <th className="h-12 px-4 text-left font-medium text-slate-500">유형</th>
                                    <th className="h-12 px-4 text-left font-medium text-slate-500">위치</th>
                                    <th className="h-12 px-4 text-left font-medium text-slate-500">메이커</th>
                                    <th className="h-12 px-4 text-left font-medium text-slate-500">마지막 점검일</th>
                                    <th className="h-12 px-4 text-left font-medium text-slate-500">설치일자</th>
                                    <th className="h-12 px-4 text-center font-medium text-slate-500">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={9} className="h-24 text-center">
                                            로딩 중...
                                        </td>
                                    </tr>
                                ) : filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="h-24 text-center text-slate-500">
                                            등록된 설비가 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((item) => (
                                        <tr key={item.equipmentId} className="border-b transition-colors hover:bg-slate-50/50 cursor-pointer" onClick={() => navigate(`/master/equipment/${item.equipmentId}`)}>
                                            <td className="p-4 font-medium">{item.equipmentId}</td>
                                            <td className="p-4">{item.name}</td>
                                            <td className="p-4">{getStatusBadge(item.status)}</td>
                                            <td className="p-4">{item.codeItem}</td>
                                            <td className="p-4">{item.installLocation || '-'}</td>
                                            <td className="p-4">{item.makerName || '-'}</td>
                                            <td className="p-4">{item.lastInspection || '-'}</td>
                                            <td className="p-4">{item.installDate}</td>
                                            <td className="p-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => handleDelete(e, item.equipmentId)}
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
                title="설비"
                validateUrl="/api/master/equipment/validate"
                uploadUrl="/api/master/equipment/upload"
                templateUrl="/api/master/equipment/template"
                columns={[
                    { name: '설비명', required: true },
                    { name: '플랜트', required: true },
                    { name: '설치위치', required: false },
                    { name: '설비유형', required: false },
                    { name: '부서', required: false },
                    { name: '제조사', required: false },
                    { name: '모델', required: false },
                    { name: '시리얼', required: false },
                    { name: '설치일자', required: false },
                ]}
                onSuccess={loadEquipment}
            />
        </div>
    );
}
