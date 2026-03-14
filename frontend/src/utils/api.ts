import axios from 'axios';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useUiStore } from '@/store/useUiStore';

// Create a custom axios instance
const api = axios.create({
    withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Configure Request Interceptor
api.interceptors.request.use(
    (config) => {
        const state = useAuthStore.getState();
        const token = state.token;

        // Show global loading
        useUiStore.getState().setLoading(true);

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        useUiStore.getState().setLoading(false);
        return Promise.reject(error);
    }
);

// Configure Response Interceptor with Silent Refresh and Global Error Handling
api.interceptors.response.use(
    (response) => {
        // Hide global loading
        useUiStore.getState().setLoading(false);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 1. Handle Token Refresh (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
                useUiStore.getState().setLoading(false);
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { token } = await useAuthStore.getState().refreshToken();
                processQueue(null, token);
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
                // Note: We don't call setLoading(false) here because the retried request (api(originalRequest)) 
                // will have its own loading cycle.
            }
        }

        // Hide global loading for other errors
        useUiStore.getState().setLoading(false);

        // 2. Global Error Logging/Handling (Non-401)
        if (error.response) {
            console.error(`API Error (${error.response.status}):`, error.response.data?.message || error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
