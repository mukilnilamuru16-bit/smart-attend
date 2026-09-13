const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('smartattend_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Metadata
  async getMeta() {
    const res = await fetch(`${API_BASE}/meta/all`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Students
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/students?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getStudentProfile(id) {
    const res = await fetch(`${API_BASE}/students/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createStudent(payload) {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async deleteStudent(id) {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Attendance
  async saveAttendance(payload) {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async getClassAttendance(className, date, subjectId) {
    const query = new URLSearchParams({ className, date, ...(subjectId ? { subjectId } : {}) }).toString();
    const res = await fetch(`${API_BASE}/attendance/class?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getContinuousAbsent(minStreak = 2) {
    const res = await fetch(`${API_BASE}/attendance/continuous-absent?minStreak=${minStreak}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getStudentAttendance(studentId) {
    const res = await fetch(`${API_BASE}/attendance/student/${studentId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Analytics
  async getDashboardAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getLeaderboard() {
    const res = await fetch(`${API_BASE}/analytics/leaderboard`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getAbsencePattern(studentId) {
    const query = studentId ? `?studentId=${studentId}` : '';
    const res = await fetch(`${API_BASE}/analytics/pattern${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getRiskList() {
    const res = await fetch(`${API_BASE}/analytics/risk`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Prediction
  async getPrediction(studentId, futureClasses = 20) {
    const res = await fetch(`${API_BASE}/prediction/${studentId}?futureClasses=${futureClasses}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Leave Management
  async getLeaveRequests() {
    const res = await fetch(`${API_BASE}/leave`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async submitLeaveRequest(payload) {
    const res = await fetch(`${API_BASE}/leave`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async approveLeave(id, comments) {
    const res = await fetch(`${API_BASE}/leave/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ comments })
    });
    return handleResponse(res);
  },

  async rejectLeave(id, comments) {
    const res = await fetch(`${API_BASE}/leave/${id}/reject`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ comments })
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
