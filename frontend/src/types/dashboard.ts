export interface DashboardSummary {
    inspection: {
        completedCount: number;
    };
    workOrder: {
        planCount: number;
        completedCount: number;
        completionRate: number;
    };
    workPermit: {
        totalCount: number;
        approvedCount: number;
    };
}

export interface CalendarEvent {
    id: string;
    type: 'PM' | 'WO' | 'WP';
    title: string;
    start: string;
    end: string;
    color: string;
    status: string;
    url?: string;
}

export interface Top5Equipment {
    equipmentId: string;
    equipmentName: string;
    totalCount: number;
    totalCost?: number;
    totalTime?: number;
    typeCountInfo?: string;
}
