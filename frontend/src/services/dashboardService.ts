import api from '@/utils/api';
import type { DashboardSummary, CalendarEvent, Top5Equipment } from '../types/dashboard';

export const dashboardService = {
    getSummary: async (month: string): Promise<DashboardSummary | null> => {
        try {
            const response = await api.get('/api/v1/dashboard/summary', { params: { month } });
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    getInspectionCalendar: async (month: string): Promise<CalendarEvent[]> => {
        try {
            const response = await api.get('/api/v1/dashboard/calendar/inspection', { params: { month } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getWorkOrderCalendar: async (month: string): Promise<CalendarEvent[]> => {
        try {
            const response = await api.get('/api/v1/dashboard/calendar/work-order', { params: { month } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getWorkPermitCalendar: async (month: string): Promise<CalendarEvent[]> => {
        try {
            const response = await api.get('/api/v1/dashboard/calendar/work-permit', { params: { month } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getWorkOrderTop5: async (year: string, criteria: string = 'count'): Promise<Top5Equipment[]> => {
        try {
            const response = await api.get('/api/v1/dashboard/wo-top5', { params: { year, criteria } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getWorkPermitTop5: async (year: string, criteria: string = 'count'): Promise<Top5Equipment[]> => {
        try {
            const response = await api.get('/api/v1/dashboard/wp-top5', { params: { year, criteria } });
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
};
