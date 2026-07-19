import axios from "axios";

const BASE = "/api/inventory";

// ============================================================================
// ADJUSTMENT REASONS
// ============================================================================

export const fetchAdjustmentReasons = (params = {}) =>
  axios.get(`${BASE}/adjustment-reasons/`, { params });

// ============================================================================
// ADJUSTMENTS
// ============================================================================

export const fetchAdjustments = (params = {}) =>
  axios.get(`${BASE}/adjustments/`, { params });

export const fetchAdjustment = (id) =>
  axios.get(`${BASE}/adjustments/${id}/`);

export const createAdjustment = (data) =>
  axios.post(`${BASE}/adjustments/`, data);

export const updateAdjustment = (id, data) =>
  axios.put(`${BASE}/adjustments/${id}/`, data);

export const deleteAdjustment = (id) =>
  axios.delete(`${BASE}/adjustments/${id}/`);

export const submitAdjustment = (id) =>
  axios.post(`${BASE}/adjustments/${id}/submit/`);

export const approveAdjustment = (id, data = {}) =>
  axios.post(`${BASE}/adjustments/${id}/approve/`, data);

export const rejectAdjustment = (id, data = {}) =>
  axios.post(`${BASE}/adjustments/${id}/reject/`, data);

export const applyAdjustment = (id) =>
  axios.post(`${BASE}/adjustments/${id}/apply/`);

export const cancelAdjustment = (id) =>
  axios.post(`${BASE}/adjustments/${id}/cancel/`);

export const fetchAdjustmentHistory = (id) =>
  axios.get(`${BASE}/adjustments/${id}/history/`);

export const exportAdjustments = (params = {}) =>
  axios.get(`${BASE}/adjustments/export/`, {
    params,
    responseType: "blob",
  });
