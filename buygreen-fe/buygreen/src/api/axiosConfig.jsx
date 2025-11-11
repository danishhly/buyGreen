import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Don't add token for public endpoints
        const publicEndpoints = ['/login', '/signup', '/auth/google', '/forgot-password', '/reset-password'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (!isPublicEndpoint) {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for better error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle network errors
        if (!error.response) {
            error.message = 'Network error. Please check your internet connection.';
            return Promise.reject(error);
        }

        // Handle specific HTTP status codes
        const status = error.response?.status;
        const data = error.response?.data;

        switch (status) {
            case 401:
                // Unauthorized - clear token and redirect to login
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    localStorage.clear();
                    window.location.href = '/login';
                }
                error.message = data?.message || 'Session expired. Please login again.';
                break;
            case 403:
                // Only show permission error if there's a specific message, otherwise use generic
                error.message = data?.message || 'You do not have permission to perform this action.';
                // Don't clear storage for 403, let the calling code handle it
                break;
            case 404:
                error.message = data?.message || 'Resource not found.';
                break;
            case 500:
                error.message = data?.message || 'Server error. Please try again later.';
                break;
            default:
                error.message = data?.message || error.message || 'An error occurred. Please try again.';
        }

        return Promise.reject(error);
    }
);

export default api;