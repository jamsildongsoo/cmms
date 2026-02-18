import { Bell, Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useNavigate } from "react-router-dom";

export function Header() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-500">{user?.company_id}</span>
                    <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 mr-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {user?.name?.[0] || '?'}
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.dept_id}</p>
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
