import axios from "axios";

const BASE = "/api/inventory";

// ============================================================================
// STOCK COUNT REASONS
// ============================================================================

export const fetchStockCountReasons = (params = {}) =>
  axios.get(`${BASE}/stock-count-reasons/`, { params });

// ============================================================================
// STOCK COUNTS
// ============================================================================

export const fetchStockCounts = (params = {}) =>
  axios.get(`${BASE}/stock-counts/`, { params });

export const fetchStockCount = (id) =>
  axios.get(`${BASE}/stock-counts/${id}/`);

export const createStockCount = (data) =>
  axios.post(`${BASE}/stock-counts/`, data);

export const updateStockCount = (id, data) =>
  axios.put(`${BASE}/stock-counts/${id}/`, data);

export const patchStockCount = (id, data) =>
  axios.patch(`${BASE}/stock-counts/${id}/`, data);

export const deleteStockCount = (id) =>
  axios.delete(`${BASE}/stock-counts/${id}/`);

export const assignCounters = (id, data) =>
  axios.post(`${BASE}/stock-counts/${id}/assign-counters/`, data);

export const startStockCount = (id) =>
  axios.post(`${BASE}/stock-counts/${id}/start/`);

export const saveCountProgress = (id, data) =>
  axios.post(`${BASE}/stock-counts/${id}/save-progress/`, data);

export const submitStockCount = (id) =>
  axios.post(`${BASE}/stock-counts/${id}/submit/`);

export const approveStockCount = (id, data = {}) =>
  axios.post(`${BASE}/stock-counts/${id}/approve/`, data);

export const completeStockCount = (id) =>
  axios.post(`${BASE}/stock-counts/${id}/complete/`);

export const cancelStockCount = (id) =>
  axios.post(`${BASE}/stock-counts/${id}/cancel/`);

export const fetchStockCountHistory = (id) =>
  axios.get(`${BASE}/stock-counts/${id}/history/`);

export const fetchDifferenceSummary = (id) =>
  axios.get(`${BASE}/stock-counts/${id}/difference-summary/`);

export const lookupBarcode = (id, barcode) =>
  axios.get(`${BASE}/stock-counts/${id}/lookup-barcode/`, {
    params: { barcode },
  });

export const reloadStockCountItems = (id) =>
  axios.post(`${BASE}/stock-counts/${id}/reload-items/`);

export const exportStockCounts = (params = {}) =>
  axios.get(`${BASE}/stock-counts/export/`, {
    params,
    responseType: "blob",
  });

export const printStockCountSheet = (id) =>
  axios.get(`${BASE}/stock-counts/${id}/print/`, {
    responseType: "blob",
  });
