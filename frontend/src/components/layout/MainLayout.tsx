import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function MainLayout() {
    return (
        <div className="flex h-screen bg-slate-50 print:bg-white print:h-auto print:block">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
