import { useState, useEffect } from "react";
import { format, formatISO, subMonths, addMonths } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { dashboardService } from "@/services/dashboardService";
import type { DashboardSummary, CalendarEvent } from "@/types/dashboard";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentTab, setCurrentTab] = useState("PM"); // PM, WO, WP
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    const monthStr = format(currentDate, "yyyy-MM");

    useEffect(() => {
        loadSummary();
    }, [currentDate]);

    useEffect(() => {
        loadEvents();
    }, [currentDate, currentTab]);

    const loadSummary = async () => {
        const data = await dashboardService.getSummary(monthStr);
        setSummary(data);
    };

    const loadEvents = async () => {
        let data: CalendarEvent[] = [];
        if (currentTab === "PM") {
            data = await dashboardService.getInspectionCalendar(monthStr);
        } else if (currentTab === "WO") {
            data = await dashboardService.getWorkOrderCalendar(monthStr);
        } else if (currentTab === "WP") {
            data = await dashboardService.getWorkPermitCalendar(monthStr);
        }
        setEvents(data);
    };

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleEventClick = (clickInfo: any) => {
        const { id, extendedProps } = clickInfo.event;
        const type = extendedProps.type;
        if (type === "PM") navigate(`/pm/inspection/${id}`);
        else if (type === "WO") navigate(`/wo/work-order/${id}`);
        else if (type === "WP") navigate(`/wp/work-permit/${id}`);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
            {/* Header / Month Selector */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">대시보드</h1>
                    <p className="text-slate-500 text-sm">설비 관리 현황을 한눈에 확인하세요.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold w-32 text-center text-slate-700">
                        {format(currentDate, "yyyy년 MM월")}
                    </h2>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* PM Summary */}
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">당월 예방점검 실적</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">
                            {summary?.inspection?.completedCount || 0} <span className="text-lg text-slate-500 font-normal">건</span>
                        </div>
                    </CardContent>
                </Card>

                {/* WO Summary */}
                <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">당월 작업지시 실적</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-3xl font-bold text-slate-800">
                                    {summary?.workOrder?.completedCount || 0} <span className="text-lg text-slate-500 font-normal">/ {summary?.workOrder?.planCount || 0} 건</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm text-slate-500 mb-1">조치율</span>
                                <span className={`text-xl font-bold ${summary?.workOrder?.completionRate && summary.workOrder.completionRate >= 100 ? 'text-green-600' : 'text-indigo-600'}`}>
                                    {summary?.workOrder?.completionRate || 0}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* WP Summary */}
                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">당월 작업허가 건수</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-3xl font-bold text-slate-800">
                                    {summary?.workPermit?.totalCount || 0} <span className="text-lg text-slate-500 font-normal">건</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm text-slate-500 mb-1">승인 완료</span>
                                <span className="text-xl font-bold text-orange-600">
                                    {summary?.workPermit?.approvedCount || 0} 건
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                {/* Calendar Section */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b pb-4 mb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg text-slate-800">일정 캘린더</CardTitle>
                        {/* @ts-ignore - radix-ui types might not expose value correctly */}
                        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-[300px]">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="PM">예방점검</TabsTrigger>
                                <TabsTrigger value="WO">작업지시</TabsTrigger>
                                <TabsTrigger value="WP">작업허가</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent>
                        <div className="calendar-wrapper bg-white rounded-lg" style={{ height: "600px" }}>
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                initialDate={formatISO(currentDate)}
                                headerToolbar={false}
                                events={events}
                                eventClick={handleEventClick}
                                height="100%"
                                eventTimeFormat={{
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    meridiem: false,
                                    hour12: false
                                }}
                                dayMaxEvents={3}
                                eventClassNames="cursor-pointer font-semibold shadow-sm hover:opacity-90 transition-opacity"
                            />
                        </div>
                        <div className="mt-4 flex gap-4 text-xs text-slate-500 justify-end">
                            {currentTab === 'PM' && (
                                <>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> 계획</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span> 실적 (완료)</div>
                                </>
                            )}
                            {currentTab === 'WO' && (
                                <>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#94a3b8]"></span> 계획</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> 실적 (완료)</div>
                                </>
                            )}
                            {currentTab === 'WP' && (
                                <>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#f97316]"></span> 신청</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> 승인/완료</div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style>{`.fc-h-event { border: none !important; margin: 1px 0 !important; border-radius: 4px; } .fc-daygrid-event { font-size: 0.75rem; padding: 2px 4px; } .fc-toolbar-title { font-size: 1.125rem !important; color: #1e293b; }`}</style>
        </div>
    );
}
