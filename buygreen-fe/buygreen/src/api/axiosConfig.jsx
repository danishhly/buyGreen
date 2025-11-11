import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30 seconds timeout
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to check if error is retryable
const isRetryableError = (error) => {
    if (!error.response) {
        // Network errors are retryable
        return true;
    }
    const status = error.response?.status;
    // Retry on 5xx errors and 408 (timeout)
    return status >= 500 || status === 408;
};

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

        // Add retry count to config if not present
        if (!config._retryCount) {
            config._retryCount = 0;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const config = error.config;

        // Retry logic for network errors and 5xx errors
        // Don't retry on 400 errors (bad request) - these are validation errors
        if (isRetryableError(error) && config && config._retryCount < MAX_RETRIES && error.response?.status !== 400) {
            config._retryCount += 1;

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config._retryCount));

            // Retry the request
            return api(config);
        }

        // Handle network errors
        if (!error.response) {
            // Check if it's a timeout
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                error.message = 'Request timeout. Please check your internet connection and try again.';
            } else {
                error.message = 'Network error. Please check your internet connection.';
            }
            return Promise.reject(error);
        }

        // Handle specific HTTP status codes
        const status = error.response?.status;
        const data = error.response?.data;

        switch (status) {
            case 401:
                // Unauthorized - clear token and redirect to login
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
                    localStorage.clear();
                    window.location.href = '/login';
                }
                error.message = data?.message || 'Session expired. Please login again.';
                break;
            case 403:
                // Check if it's a token issue
                const token = localStorage.getItem('authToken') || localStorage.getItem('token');
                if (!token) {
                    error.message = 'Please login to continue.';
                } else {
                    error.message = data?.message || 'You do not have permission to perform this action.';
                }
                // Don't clear storage for 403, let the calling code handle it
                break;
            case 404:
                error.message = data?.message || 'Resource not found.';
                break;
            case 408:
                error.message = 'Request timeout. Please try again.';
                break;
            case 500:
                error.message = data?.message || 'Server error. Please try again later.';
                break;
            case 502:
            case 503:
            case 504:
                error.message = 'Service temporarily unavailable. Please try again in a moment.';
                break;
            default:
                error.message = data?.message || error.message || 'An error occurred. Please try again.';
        }

        return Promise.reject(error);
    }
);

export default api;