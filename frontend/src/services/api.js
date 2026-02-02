/**
 * Centralized API service for HRMS Lite (Axios).
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// --- Employees ---
export const employeesApi = {
  list: () => api.get('/employees/'),
  create: (data) => api.post('/employees/', data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// --- Attendance ---
export const attendanceApi = {
  mark: (data) => api.post('/attendance/', data),
  history: (employeeId, params) =>
    api.get(`/attendance/${employeeId}`, { params }),
};

// --- Dashboard ---
export const dashboardApi = {
  stats: () => {
    const today = new Date().toLocaleDateString('en-CA');
    return api.get(`/dashboard/stats?query_date=${today}`);
  },
};