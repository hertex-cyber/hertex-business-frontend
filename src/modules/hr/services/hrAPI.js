import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const HR_API_URL = `${API_BASE_URL}/hr`;

// Create axios instance
const hrClient = axios.create({
  baseURL: HR_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
hrClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// EMPLOYEE ENDPOINTS
// ============================================================================

export const employeeAPI = {
  // Get all employees
  getEmployees: (filters = {}) =>
    hrClient.get("/employees/", { params: filters }),

  // Get employee by ID
  getEmployeeDetail: (id) => hrClient.get(`/employees/${id}/`),

  // Create new employee
  createEmployee: (data) =>
    hrClient.post("/employees/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Update employee
  updateEmployee: (id, data) =>
    hrClient.patch(`/employees/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Get employees by department
  getByDepartment: (departmentId) =>
    hrClient.get("/employees/by_department/", {
      params: { department_id: departmentId },
    }),

  // Get employees by location
  getByLocation: (locationId) =>
    hrClient.get("/employees/by_location/", {
      params: { location_id: locationId },
    }),

  // Get active employee count
  getActiveCount: () => hrClient.get("/employees/active_count/"),

  // Confirm probation
  confirmProbation: (id) =>
    hrClient.post(`/employees/${id}/confirm_probation/`),

  // Initiate separation
  initiateSeparation: (id, data) =>
    hrClient.post(`/employees/${id}/initiate_separation/`, data),
};

// ============================================================================
// ATTENDANCE ENDPOINTS
// ============================================================================

export const attendanceAPI = {
  // Get attendance records
  getAttendance: (filters = {}) =>
    hrClient.get("/attendance/", { params: filters }),

  // Get specific attendance record
  getAttendanceDetail: (id) => hrClient.get(`/attendance/${id}/`),

  // Create attendance record (check-in)
  checkIn: (data) => hrClient.post("/attendance/", data),

  // Update attendance record (check-out)
  checkOut: (id, data) => hrClient.patch(`/attendance/${id}/`, data),

  // Get today's attendance
  getTodayAttendance: () => hrClient.get("/attendance/today/"),

  // Get monthly report
  getMonthlyReport: (month, year) =>
    hrClient.get("/attendance/monthly_report/", { params: { month, year } }),

  // Regularize attendance
  regularizeAttendance: (id, data) =>
    hrClient.post(`/attendance/${id}/regularize/`, data),
};

// ============================================================================
// LEAVE ENDPOINTS
// ============================================================================

export const leaveAPI = {
  // Get leave types
  getLeaveTypes: () => hrClient.get("/leave-types/"),

  // Get leave balance
  getLeaveBalance: (filters = {}) =>
    hrClient.get("/leave-balances/", { params: filters }),

  // Get current year leave balance
  getCurrentYearBalance: () => hrClient.get("/leave-balances/current_year/"),

  // Get leave applications
  getLeaveApplications: (filters = {}) =>
    hrClient.get("/leave-applications/", { params: filters }),

  // Get specific leave application
  getLeaveApplicationDetail: (id) => hrClient.get(`/leave-applications/${id}/`),

  // Apply for leave
  applyLeave: (data) => hrClient.post("/leave-applications/", data),

  // Approve leave
  approveLeave: (id, comment = "") =>
    hrClient.post(`/leave-applications/${id}/approve/`, { comment }),

  // Reject leave
  rejectLeave: (id, comment = "") =>
    hrClient.post(`/leave-applications/${id}/reject/`, { comment }),

  // Cancel leave
  cancelLeave: (id, reason = "") =>
    hrClient.post(`/leave-applications/${id}/cancel/`, { reason }),
};

// ============================================================================
// PAYROLL ENDPOINTS
// ============================================================================

export const payrollAPI = {
  // Get employee salary
  getEmployeeSalary: (filters = {}) =>
    hrClient.get("/employee-salary/", { params: filters }),

  // Get payroll records
  getPayroll: (filters = {}) => hrClient.get("/payroll/", { params: filters }),

  // Get payroll detail
  getPayrollDetail: (id) => hrClient.get(`/payroll/${id}/`),

  // Process payroll
  processPayroll: (month, year) =>
    hrClient.post("/payroll/process_payroll/", { month, year }),

  // Approve payroll
  approvePayroll: (id) => hrClient.post(`/payroll/${id}/approve/`),
};

// ============================================================================
// MASTER DATA ENDPOINTS
// ============================================================================

export const masterDataAPI = {
  // Designations
  getDesignations: () => hrClient.get("/designations/"),

  // Work Locations
  getWorkLocations: () => hrClient.get("/work-locations/"),

  // Cost Centers
  getCostCenters: () => hrClient.get("/cost-centers/"),

  // Shifts
  getShifts: () => hrClient.get("/shifts/"),

  // Holidays
  getHolidays: (filters = {}) =>
    hrClient.get("/holidays/", { params: filters }),

  // Current year holidays
  getCurrentYearHolidays: () => hrClient.get("/holidays/current_year/"),
};

// ============================================================================
// DOCUMENT ENDPOINTS
// ============================================================================

export const documentAPI = {
  // Get employee documents
  getDocuments: (employeeId) =>
    hrClient.get("/employee-documents/", { params: { employee: employeeId } }),

  // Upload document
  uploadDocument: (data) =>
    hrClient.post("/employee-documents/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Verify document
  verifyDocument: (id) => hrClient.post(`/employee-documents/${id}/verify/`),
};

// ============================================================================
// COMPENSATORY OFF ENDPOINTS
// ============================================================================

export const compOffAPI = {
  // Get comp-offs
  getCompOffs: (filters = {}) =>
    hrClient.get("/comp-offs/", { params: filters }),

  // Create comp-off
  createCompOff: (data) => hrClient.post("/comp-offs/", data),
};

export default hrClient;
