import axios from 'axios';

// Use environment variable if available (Vercel), otherwise fallback to proxy (Local)
// const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_URL = '/api'; // Use Relative Path for Vercel Proxy
console.log('🔌 Connecting to Backend API:', API_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 300000, // 5 minutes
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('teacher');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
};

// Analysis API
export const analysisAPI = {
    analyze: (data) => api.post('/analyze', data),
    getIncidents: () => api.get('/analyze/incidents'),
    getIncident: (id) => api.get(`/analyze/incidents/${id}`),
    getStudentHistory: (studentId) => api.get(`/analyze/student/${studentId}`),
    analyzePattern: (data) => api.post('/analyze/pattern', data),
    generateLetter: (data) => api.post('/analyze/letter', data),
    // Script Generation
    generateScript: (data) => api.post('/analyze/script', data),

    // Attendance & Mileage
    getStudents: () => api.get('/attendance/students'),
    addStudent: (data) => api.post('/attendance/students', data),
    addStudentsBulk: (students) => api.post('/attendance/students/bulk', { students }),
    updateStudent: (id, data) => api.put(`/attendance/students/${id}`, data),
    deleteStudent: (id) => api.delete(`/attendance/students/${id}`),
    deleteStudentsBulk: (studentIds) => api.post('/attendance/students/bulk-delete', { studentIds }),
    promoteStudentsBulk: (promotions) => api.post('/attendance/students/bulk-promote', { promotions }),
    markAttendance: (data) => api.post('/attendance', data),
    getAttendanceHistory: (studentId) => api.get(`/attendance/history/${studentId}`),

    // 누가기록 조회
    getStudentHistory: (studentId) => api.get(`/analyze/student/${studentId}`),

    // 누가기록 수정/삭제
    updateIncident: (id, data) => api.put(`/analyze/incidents/${id}`, data),
    deleteIncident: (id) => api.delete(`/analyze/incidents/${id}`),

    uploadFiles: (formData) => api.post('/upload', formData, {
        headers: {
            'Content-Type': undefined
        }
    })
};

// Admin API
export const adminAPI = {
    getTeachers: () => api.get('/admin/teachers'),
    deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
    resetTeacherPassword: (id) => api.post(`/admin/teachers/${id}/reset-password`)
};

export default api;
