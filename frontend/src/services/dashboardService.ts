import api from '@/utils/api';
import type { DashboardSummary, CalendarEvent, Top5Equipment } from '../types/dashboard';
import { useAuthStore } from "@/features/auth/useAuthStore";

export const dashboardService = {
    getSummary: async (month: string): Promise<DashboardSummary | null> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) return null;
            const response = await api.get('/api/v1/dashboard/summary', { params: { companyId, month } });
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    getInspectionCalendar: async (month: string): Promise<CalendarEvent[]> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) return [];
            const response = await api.get('/api/v1/dashboard/calendar/inspection', { params: { companyId, month } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getWorkOrderCalendar: async (month: string): Promise<CalendarEvent[]> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) return [];
            const response = await api.get('/api/v1/dashboard/calendar/work-order', { params: { companyId, month } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getWorkPermitCalendar: async (month: string): Promise<CalendarEvent[]> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) return [];
            const response = await api.get('/api/v1/dashboard/calendar/work-permit', { params: { companyId, month } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getWorkOrderTop5: async (year: string, criteria: string = 'count'): Promise<Top5Equipment[]> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) return [];
            const response = await api.get('/api/v1/dashboard/wo-top5', { params: { companyId, year, criteria } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getWorkPermitTop5: async (year: string, criteria: string = 'count'): Promise<Top5Equipment[]> => {
        try {
            const companyId = useAuthStore.getState().user?.companyId;
            if (!companyId) return [];
            const response = await api.get('/api/v1/dashboard/wp-top5', { params: { companyId, year, criteria } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
};
