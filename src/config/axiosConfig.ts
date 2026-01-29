import axios from 'axios';

// Base URL của API backend
const BASE_URL = 'http://localhost:8080/api';

// Tạo instance axios với config mặc định
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - xử lý trước khi gửi request
axiosInstance.interceptors.request.use(
    (config) => {
        // Có thể thêm token vào đây nếu cần authentication
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        console.log('Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - xử lý response trước khi trả về component
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('Response Error:', error.response?.data || error.message);

        // Xử lý lỗi chung
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.error('Unauthorized - Redirect to login');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;