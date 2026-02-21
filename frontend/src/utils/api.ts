import axios from 'axios';
import { useAuthStore } from '@/features/auth/useAuthStore';

// Create a custom axios instance
const api = axios.create({
    // baseURL: 'http://localhost:8080', // Configure if different from '/api' proxy
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure Request Interceptor
api.interceptors.request.use(
    (config) => {
        // Read token directly from Zustand state
        const token = useAuthStore.getState().token;

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Configure Response Interceptor (Optional: Handle 401 globally)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If unauthorized (invalid or expired token)
        if (error.response && error.response.status === 401) {
            useAuthStore.getState().logout();
            // Automatically redirect to login page by state change or window.location
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
