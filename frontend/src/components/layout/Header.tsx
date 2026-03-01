import { useEffect, useState } from "react";
import { Bell, Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useNavigate } from "react-router-dom";
import { standardService, type Plant } from "@/services/standardService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Header() {
    const user = useAuthStore((state) => state.user);
    const { currentPlantId, setPlantId, logout } = useAuthStore();
    const navigate = useNavigate();
    const [plants, setPlants] = useState<Plant[]>([]);

    useEffect(() => {
        if (user?.companyId) {
            standardService.getAll('plant').then(data => {
                const myPlants = data.filter(p => p.companyId === user.companyId);
                setPlants(myPlants);
                // If currentPlantId is null but we have plants, set the first one
                if (!currentPlantId && myPlants.length > 0) {
                    setPlantId(myPlants[0].id);
                }
            });
        }
    }, [user, currentPlantId, setPlantId]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 print:hidden">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-500">{user?.companyId}</span>
                    <span className="text-sm font-bold text-slate-900 ml-1">{user?.name} 님</span>
                </div>

                {plants.length > 0 && (
                    <div className="flex items-center gap-2 ml-8">
                        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">플랜트 (근무장소 선택):</span>
                        <Select value={currentPlantId || undefined} onValueChange={setPlantId}>
                            <SelectTrigger className="w-[180px] h-8 text-sm border-none shadow-none focus:ring-0 bg-transparent font-semibold text-blue-700">
                                <SelectValue placeholder="플랜트 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {plants.map(p => (
                                    <SelectItem key={p.plantId} value={p.plantId}>
                                        {p.name} ({p.plantId})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 mr-2 cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors"
                    onClick={() => navigate('/profile')}
                    title="정보 수정 및 비밀번호 변경">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {user?.name?.[0] || '?'}
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.deptId || '부서 미지정'}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 text-slate-500" />
                </Button>
            </div>
        </header>
    );
}
