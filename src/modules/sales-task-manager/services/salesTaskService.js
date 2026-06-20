/**
 * Sales Task Manager API Service
 * All API calls for targets, programmes, tasks, and dashboards
 *
 * Uses axios directly (matching CRM/HR/Contacts pattern) to avoid
 * baseURL misconfiguration from the shared api instance.
 */
import axios from "axios";

const SALES_BASE = "/api/sales";

// ============================================================================
// TARGET CYCLES
// ============================================================================
export const fetchTargetCycles = (params = {}) =>
  axios.get(`${SALES_BASE}/target-cycles/`, { params });

export const fetchTargetCycle = (id) =>
  axios.get(`${SALES_BASE}/target-cycles/${id}/`);

export const createTargetCycle = (data) =>
  axios.post(`${SALES_BASE}/target-cycles/`, data);

export const updateTargetCycle = (id, data) =>
  axios.patch(`${SALES_BASE}/target-cycles/${id}/`, data);

export const deleteTargetCycle = (id) =>
  axios.delete(`${SALES_BASE}/target-cycles/${id}/`);

export const activateTargetCycle = (id) =>
  axios.post(`${SALES_BASE}/target-cycles/${id}/activate/`);

export const closeTargetCycle = (id) =>
  axios.post(`${SALES_BASE}/target-cycles/${id}/close/`);

export const fetchTargetCycleSummary = (id) =>
  axios.get(`${SALES_BASE}/target-cycles/${id}/summary/`);

// ============================================================================
// SALES TARGETS
// ============================================================================
export const fetchSalesTargets = (params = {}) =>
  axios.get(`${SALES_BASE}/targets/`, { params });

export const fetchSalesTarget = (id) =>
  axios.get(`${SALES_BASE}/targets/${id}/`);

export const createSalesTarget = (data) =>
  axios.post(`${SALES_BASE}/targets/`, data);

export const updateSalesTarget = (id, data) =>
  axios.patch(`${SALES_BASE}/targets/${id}/`, data);

export const deleteSalesTarget = (id) =>
  axios.delete(`${SALES_BASE}/targets/${id}/`);

export const assignSalesTarget = (id, data) =>
  axios.post(`${SALES_BASE}/targets/${id}/assign/`, data);

export const generateTasksFromTarget = (id) =>
  axios.post(`${SALES_BASE}/targets/${id}/generate-tasks/`);

export const fetchTargetProgress = (id) =>
  axios.get(`${SALES_BASE}/targets/${id}/progress/`);

export const bulkCreateSalesTargets = (data) =>
  axios.post(`${SALES_BASE}/targets/bulk-create/`, data);

// ============================================================================
// TARGET LINE ITEMS
// ============================================================================
export const fetchTargetLineItems = (params = {}) =>
  axios.get(`${SALES_BASE}/target-line-items/`, { params });

export const createTargetLineItem = (data) =>
  axios.post(`${SALES_BASE}/target-line-items/`, data);

export const updateTargetLineItem = (id, data) =>
  axios.patch(`${SALES_BASE}/target-line-items/${id}/`, data);

export const deleteTargetLineItem = (id) =>
  axios.delete(`${SALES_BASE}/target-line-items/${id}/`);

// ============================================================================
// SALES PROGRAMMES
// ============================================================================
export const fetchSalesProgrammes = (params = {}) =>
  axios.get(`${SALES_BASE}/programmes/`, { params });

export const fetchSalesProgramme = (id) =>
  axios.get(`${SALES_BASE}/programmes/${id}/`);

export const createSalesProgramme = (data) =>
  axios.post(`${SALES_BASE}/programmes/`, data);

export const updateSalesProgramme = (id, data) =>
  axios.patch(`${SALES_BASE}/programmes/${id}/`, data);

export const deleteSalesProgramme = (id) =>
  axios.delete(`${SALES_BASE}/programmes/${id}/`);

export const addProgrammeMember = (id, userId) =>
  axios.post(`${SALES_BASE}/programmes/${id}/add-member/`, { user_id: userId });

export const removeProgrammeMember = (id, userId) =>
  axios.post(`${SALES_BASE}/programmes/${id}/remove-member/`, { user_id: userId });

export const fetchProgrammeGantt = (id) =>
  axios.get(`${SALES_BASE}/programmes/${id}/gantt/`);

export const fetchProgrammeResourceLoad = (id) =>
  axios.get(`${SALES_BASE}/programmes/${id}/resource-load/`);

// ============================================================================
// PROGRAMME MILESTONES
// ============================================================================
export const fetchMilestones = (params = {}) =>
  axios.get(`${SALES_BASE}/milestones/`, { params });

export const createMilestone = (data) =>
  axios.post(`${SALES_BASE}/milestones/`, data);

export const updateMilestone = (id, data) =>
  axios.patch(`${SALES_BASE}/milestones/${id}/`, data);

export const achieveMilestone = (id) =>
  axios.post(`${SALES_BASE}/milestones/${id}/achieve/`);

// ============================================================================
// SALES TASKS
// ============================================================================
export const fetchSalesTasks = (params = {}) =>
  axios.get(`${SALES_BASE}/tasks/`, { params });

export const fetchSalesTask = (id) =>
  axios.get(`${SALES_BASE}/tasks/${id}/`);

export const createSalesTask = (data) =>
  axios.post(`${SALES_BASE}/tasks/`, data);

export const updateSalesTask = (id, data) =>
  axios.patch(`${SALES_BASE}/tasks/${id}/`, data);

export const deleteSalesTask = (id) =>
  axios.delete(`${SALES_BASE}/tasks/${id}/`);

export const assignSalesTask = (id, userId) =>
  axios.post(`${SALES_BASE}/tasks/${id}/assign/`, { assigned_to: userId });

export const startSalesTask = (id) =>
  axios.post(`${SALES_BASE}/tasks/${id}/start/`);

export const completeSalesTask = (id) =>
  axios.post(`${SALES_BASE}/tasks/${id}/complete/`);

export const blockSalesTask = (id, reason) =>
  axios.post(`${SALES_BASE}/tasks/${id}/block/`, { reason });

export const bulkReorderTasks = (items) =>
  axios.post(`${SALES_BASE}/tasks/bulk-reorder/`, { items });

export const bulkUpdateTaskStatus = (taskIds, status) =>
  axios.post(`${SALES_BASE}/tasks/bulk-update-status/`, { task_ids: taskIds, status });

export const fetchMyTasks = () =>
  axios.get(`${SALES_BASE}/tasks/my-tasks/`);

export const fetchTasksByDeal = (dealId) =>
  axios.get(`${SALES_BASE}/tasks/by-deal/`, { params: { deal_id: dealId } });

// ============================================================================
// TASK DEPENDENCIES
// ============================================================================
export const fetchTaskDependencies = (params = {}) =>
  axios.get(`${SALES_BASE}/task-dependencies/`, { params });

export const createTaskDependency = (data) =>
  axios.post(`${SALES_BASE}/task-dependencies/`, data);

export const deleteTaskDependency = (id) =>
  axios.delete(`${SALES_BASE}/task-dependencies/${id}/`);

// ============================================================================
// TIME LOGS
// ============================================================================
export const fetchTimeLogs = (params = {}) =>
  axios.get(`${SALES_BASE}/time-logs/`, { params });

export const createTimeLog = (data) =>
  axios.post(`${SALES_BASE}/time-logs/`, data);

export const updateTimeLog = (id, data) =>
  axios.patch(`${SALES_BASE}/time-logs/${id}/`, data);

export const deleteTimeLog = (id) =>
  axios.delete(`${SALES_BASE}/time-logs/${id}/`);

export const fetchTimeLogSummary = (params = {}) =>
  axios.get(`${SALES_BASE}/time-logs/summary/`, { params });

// ============================================================================
// RESOURCE ALLOCATIONS
// ============================================================================
export const fetchResourceAllocations = (params = {}) =>
  axios.get(`${SALES_BASE}/resource-allocations/`, { params });

export const createResourceAllocation = (data) =>
  axios.post(`${SALES_BASE}/resource-allocations/`, data);

export const updateResourceAllocation = (id, data) =>
  axios.patch(`${SALES_BASE}/resource-allocations/${id}/`, data);

export const deleteResourceAllocation = (id) =>
  axios.delete(`${SALES_BASE}/resource-allocations/${id}/`);

// ============================================================================
// ASSIGNMENT RULES
// ============================================================================
export const fetchAssignmentRules = (params = {}) =>
  axios.get(`${SALES_BASE}/assignment-rules/`, { params });

export const createAssignmentRule = (data) =>
  axios.post(`${SALES_BASE}/assignment-rules/`, data);

export const updateAssignmentRule = (id, data) =>
  axios.patch(`${SALES_BASE}/assignment-rules/${id}/`, data);

export const deleteAssignmentRule = (id) =>
  axios.delete(`${SALES_BASE}/assignment-rules/${id}/`);

// ============================================================================
// ACTIVITY LOGS
// ============================================================================
export const fetchActivityLogs = (params = {}) =>
  axios.get(`${SALES_BASE}/activity-logs/`, { params });

// ============================================================================
// DASHBOARDS
// ============================================================================
export const fetchExecutiveDashboard = () =>
  axios.get(`${SALES_BASE}/dashboard/executive/`);

export const fetchManagerDashboard = () =>
  axios.get(`${SALES_BASE}/dashboard/manager/`);

export const fetchMyTargetDashboard = () =>
  axios.get(`${SALES_BASE}/dashboard/my-target/`);
