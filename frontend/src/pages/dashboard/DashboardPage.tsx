import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">총 설비 수</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-slate-500">+2 from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">가동 중</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <p className="text-xs text-slate-500">67% operational</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">정비 중</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <p className="text-xs text-slate-500">Scheduled maintenance</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">고장/정지</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">2</div>
                    <p className="text-xs text-slate-500">Requires attention</p>
                </CardContent>
            </Card>
        </div>
    );
}
