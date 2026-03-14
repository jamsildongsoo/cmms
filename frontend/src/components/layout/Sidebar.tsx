import {
    LayoutDashboard,
    Settings,
    Wrench,
    StickyNote,
    Database,
    CalendarCheck,
    ShieldCheck,
    Package,
    FileSignature,
    ChevronDown,
    ChevronRight,
    X
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import { useState, useEffect } from "react";

interface SubMenuItem {
    title: string;
    href: string;
}

interface MenuItem {
    title: string;
    href?: string;
    icon: any;
    submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
    {
        title: "대시보드",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "TM 메모",
        href: "/memo",
        icon: StickyNote,
    },
    {
        title: "기준정보",
        icon: Settings,
        submenu: [
            { title: "회사 관리", href: "/standard/company" },
            { title: "사업장 관리", href: "/standard/plant" },
            { title: "부서 관리", href: "/standard/dept" },
            { title: "사용자 관리", href: "/standard/user" },
            { title: "저장소 관리", href: "/standard/storage" },
            { title: "권한 관리", href: "/standard/role" },
            { title: "공통코드", href: "/standard/code" },
        ],
    },
    {
        title: "마스터 정보",
        icon: Database,
        submenu: [
            { title: "설비 마스터", href: "/master/equipment" },
            { title: "자재 마스터", href: "/master/inventory" },
        ],
    },
    {
        title: "예방점검",
        icon: CalendarCheck,
        submenu: [
            { title: '점검 계획', href: '/pm/inspection/new' },
            { title: '점검 실적', href: '/pm/inspection/result/new' },
            { title: '점검 목록', href: '/pm/inspection' },
        ],
    },
    {
        title: "작업지시",
        icon: Wrench,
        submenu: [
            { title: "작업 계획", href: "/wo/work-order/new" },
            { title: "작업 실적", href: "/wo/work-order/result/new" },
            { title: "작업 목록", href: "/wo/work-order" },
        ],
    },
    {
        title: "작업허가",
        icon: ShieldCheck,
        submenu: [
            { title: "허가 신청", href: "/wp/work-permit/new" },
            { title: "허가 목록", href: "/wp/work-permit" },
        ],
    },
    {
        title: "재고관리",
        icon: Package,
        submenu: [
            { title: "재고 처리", href: "/inventory/processing" },
            { title: "재고 현황", href: "/inventory/status" },
            { title: "재고 수불", href: "/inventory/transaction" },
        ],
    },
    {
        title: "결재관리",
        icon: FileSignature,
        submenu: [
            { title: "기안 작성", href: "/approval/new" },
            { title: "상신함", href: "/approval/outbox" },
            { title: "결재함", href: "/approval/inbox" },
        ],
    },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Automatically open the menu that contains the active route
    useEffect(() => {
        menuItems.forEach((item) => {
            if (item.submenu) {
                const hasActiveSubItem = item.submenu.some((sub) => location.pathname.startsWith(sub.href));
                if (hasActiveSubItem && !openMenus.includes(item.title)) {
                    setOpenMenus((prev) => [...prev, item.title]);
                }
            }
        });
    }, [location.pathname]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        onClose();
    }, [location.pathname]);

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    return (
        <>
            {/* Overlay for mobile */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-sm print:hidden transition-transform duration-200 ease-in-out",
                "lg:static lg:translate-x-0",
                open ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CMMS</h1>
                    <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-slate-100">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {menuItems.map((item) => {
                            const hasSubmenu = !!item.submenu;
                            const isOpen = openMenus.includes(item.title);
                            const isActive = item.href ? location.pathname === item.href : false;

                            return (
                                <div key={item.title}>
                                    {hasSubmenu ? (
                                        <button
                                            onClick={() => toggleMenu(item.title)}
                                            className={cn(
                                                "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                                isOpen
                                                    ? "bg-slate-50 text-slate-900"
                                                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={cn("h-4 w-4", isOpen ? "text-blue-600" : "text-slate-500")} />
                                                {item.title}
                                            </div>
                                            {isOpen ? (
                                                <ChevronDown className="h-4 w-4 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-slate-400" />
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            to={item.href!}
                                            className={cn(
                                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <item.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-500")} />
                                            {item.title}
                                        </Link>
                                    )}

                                    {hasSubmenu && isOpen && (
                                        <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100 pl-2">
                                            {item.submenu!.map((sub) => {
                                                const isSubActive = location.pathname.startsWith(sub.href);
                                                return (
                                                    <Link
                                                        key={sub.href}
                                                        to={sub.href}
                                                        className={cn(
                                                            "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                                                            isSubActive
                                                                ? "bg-blue-50 font-medium text-blue-600"
                                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                        )}
                                                    >
                                                        {sub.title}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
}
