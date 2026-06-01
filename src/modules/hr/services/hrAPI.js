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

// ============================================================================
// RECRUITMENT ENDPOINTS
// ============================================================================

export const recruitmentAPI = {
  // Job Requisitions
  getRequisitions: (filters = {}) =>
    hrClient.get("/job-requisitions/", { params: filters }),
  createRequisition: (data) => hrClient.post("/job-requisitions/", data),
  updateRequisition: (id, data) => hrClient.patch(`/job-requisitions/${id}/`, data),

  // Candidates
  getCandidates: (filters = {}) =>
    hrClient.get("/candidates/", { params: filters }),
  createCandidate: (data) => hrClient.post("/candidates/", data),

  // Job Applications (ATS Pipeline)
  getJobApplications: (filters = {}) =>
    hrClient.get("/job-applications/", { params: filters }),
  createJobApplication: (data) => hrClient.post("/job-applications/", data),
  updateApplicationStage: (id, stage) =>
    hrClient.patch(`/job-applications/${id}/`, { stage }),
};

// ============================================================================
// PERFORMANCE MANAGEMENT ENDPOINTS
// ============================================================================

export const performanceAPI = {
  // Appraisal Cycles
  getAppraisalCycles: () => hrClient.get("/appraisal-cycles/"),
  createAppraisalCycle: (data) => hrClient.post("/appraisal-cycles/", data),

  // Performance Goals
  getGoals: (filters = {}) =>
    hrClient.get("/performance-goals/", { params: filters }),
  createGoal: (data) => hrClient.post("/performance-goals/", data),

  // Performance Reviews
  getReviews: (filters = {}) =>
    hrClient.get("/performance-reviews/", { params: filters }),
  createReview: (data) => hrClient.post("/performance-reviews/", data),
};

// ============================================================================
// TRAINING ENDPOINTS
// ============================================================================

export const trainingAPI = {
  // Training Programs
  getPrograms: (filters = {}) =>
    hrClient.get("/training-programs/", { params: filters }),
  createProgram: (data) => hrClient.post("/training-programs/", data),

  // Training Nominations
  getNominations: (filters = {}) =>
    hrClient.get("/training-nominations/", { params: filters }),
  createNomination: (data) => hrClient.post("/training-nominations/", data),
};

// ============================================================================
// EXIT MANAGEMENT ENDPOINTS
// ============================================================================

export const exitAPI = {
  // Resignations
  getResignations: (filters = {}) =>
    hrClient.get("/resignations/", { params: filters }),
  createResignation: (data) => hrClient.post("/resignations/", data),

  // Exit Clearances
  getExitClearances: (filters = {}) =>
    hrClient.get("/exit-clearances/", { params: filters }),
  updateClearance: (id, data) => hrClient.patch(`/exit-clearances/${id}/`, data),
};

// ============================================================================
// STATUTORY COMPLIANCE ENDPOINTS
// ============================================================================

export const complianceAPI = {
  // PF Configuration
  getPFConfigs: () => hrClient.get("/pf-configurations/"),
  createPFConfig: (data) => hrClient.post("/pf-configurations/", data),
  updatePFConfig: (id, data) => hrClient.patch(`/pf-configurations/${id}/`, data),

  // PF Contributions
  getPFContributions: (filters = {}) =>
    hrClient.get("/pf-contributions/", { params: filters }),

  // ESI Configuration
  getESIConfigs: () => hrClient.get("/esi-configurations/"),
  createESIConfig: (data) => hrClient.post("/esi-configurations/", data),
  updateESIConfig: (id, data) => hrClient.patch(`/esi-configurations/${id}/`, data),

  // ESI Contributions
  getESIContributions: (filters = {}) =>
    hrClient.get("/esi-contributions/", { params: filters }),

  // Professional Tax Slabs
  getPTSlabs: (filters = {}) =>
    hrClient.get("/professional-tax-slabs/", { params: filters }),
  createPTSlab: (data) => hrClient.post("/professional-tax-slabs/", data),
  updatePTSlab: (id, data) => hrClient.patch(`/professional-tax-slabs/${id}/`, data),

  // PT Deductions
  getPTDeductions: (filters = {}) =>
    hrClient.get("/pt-deductions/", { params: filters }),

  // TDS Configuration
  getTDSConfigs: () => hrClient.get("/tds-configurations/"),
  createTDSConfig: (data) => hrClient.post("/tds-configurations/", data),
  updateTDSConfig: (id, data) => hrClient.patch(`/tds-configurations/${id}/`, data),

  // Investment Declarations
  getInvestmentDeclarations: (filters = {}) =>
    hrClient.get("/investment-declarations/", { params: filters }),
  createInvestmentDeclaration: (data) => hrClient.post("/investment-declarations/", data),
  approveInvestmentDeclaration: (id) =>
    hrClient.post(`/investment-declarations/${id}/approve/`),

  // TDS Calculations
  getTDSCalculations: (filters = {}) =>
    hrClient.get("/tds-calculations/", { params: filters }),

  // Gratuity Configuration
  getGratuityConfigs: () => hrClient.get("/gratuity-configurations/"),

  // Gratuity Calculations
  getGratuityCalculations: (filters = {}) =>
    hrClient.get("/gratuity-calculations/", { params: filters }),

  // Bonus Configuration
  getBonusConfigs: () => hrClient.get("/bonus-configurations/"),

  // Bonus Calculations
  getBonusCalculations: (filters = {}) =>
    hrClient.get("/bonus-calculations/", { params: filters }),

  // Compliance Calendar
  getComplianceCalendar: (filters = {}) =>
    hrClient.get("/compliance-calendar/", { params: filters }),
  getUpcomingCompliance: (days = 30) =>
    hrClient.get("/compliance-calendar/upcoming/", { params: { days } }),
  getOverdueCompliance: () =>
    hrClient.get("/compliance-calendar/overdue/"),
  markComplianceCompleted: (id, reference = "") =>
    hrClient.post(`/compliance-calendar/${id}/mark_completed/`, { reference_number: reference }),
  createComplianceEntry: (data) => hrClient.post("/compliance-calendar/", data),
};

export default hrClient;
