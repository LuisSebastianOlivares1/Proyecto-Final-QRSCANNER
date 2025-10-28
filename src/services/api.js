const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth
  async login(username, password) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Employees
  async getEmployees() {
    return await this.request('/employees');
  }

  async createEmployee(employeeData) {
    return await this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id, employeeData) {
    return await this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(id) {
    return await this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance
  async registerAttendance(attendanceData) {
    return await this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  // Reports
  async getMonthlyReport(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('mes', month);
    if (year) params.append('anio', year);
    
    return await this.request(`/reports/monthly?${params}`);
  }

  // Departments and Positions
  async getDepartments() {
    return await this.request('/departments');
  }

  async getPositions() {
    return await this.request('/positions');
  }
}

export const apiService = new ApiService();