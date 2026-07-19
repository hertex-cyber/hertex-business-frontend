import { useState, useCallback, useEffect } from "react";
import {
  fetchStockCounts,
  fetchStockCount,
  createStockCount as apiCreateStockCount,
  updateStockCount as apiUpdateStockCount,
  patchStockCount as apiPatchStockCount,
  deleteStockCount as apiDeleteStockCount,
  assignCounters as apiAssignCounters,
  startStockCount as apiStartStockCount,
  saveCountProgress as apiSaveCountProgress,
  submitStockCount as apiSubmitStockCount,
  approveStockCount as apiApproveStockCount,
  completeStockCount as apiCompleteStockCount,
  cancelStockCount as apiCancelStockCount,
  exportStockCounts as apiExportStockCounts,
  fetchStockCountReasons,
  fetchStockCountHistory,
  fetchDifferenceSummary,
  lookupBarcode as apiLookupBarcode,
} from "../services/stockCountService";

export const useStockCountReasons = (params = {}) => {
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchStockCountReasons(params);
      setReasons(response.data.results || response.data.data || response.data || []);
    } catch {
      setReasons([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);
  useEffect(() => { refetch(); }, [refetch]);
  return { reasons, loading, refetch };
};

export const useStockCounts = (filters = {}) => {
  const [stockCounts, setStockCounts] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchStockCounts(filters);
      setStockCounts(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch stock counts");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);
  useEffect(() => { refetch(); }, [refetch]);
  return { stockCounts, count, loading, error, refetch };
};

export const useStockCountActions = () => {
  const [loading, setLoading] = useState(false);

  const createStockCount = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await apiCreateStockCount(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to create stock count";
      return { success: false, error: msg, errors: err.response?.data };
    } finally { setLoading(false); }
  }, []);

  const updateStockCount = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiUpdateStockCount(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to update stock count";
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const assignCounters = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiAssignCounters(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to assign counters";
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const startCounting = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiStartStockCount(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to start counting";
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const saveProgress = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiSaveCountProgress(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to save progress";
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const submitStockCount = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiSubmitStockCount(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to submit";
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const approveStockCount = useCallback(async (id, notes = "") => {
    setLoading(true);
    try {
      const response = await apiApproveStockCount(id, { notes });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to approve";
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const completeStockCount = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiCompleteStockCount(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to complete";
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const cancelStockCount = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiCancelStockCount(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to cancel";
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const exportStockCounts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await apiExportStockCounts(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "stock_counts.xlsx";
      if (disposition) { const match = disposition.match(/filename="?(.+)"?/); if (match) filename = match[1]; }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Failed to export" };
    } finally { setLoading(false); }
  }, []);

  const lookupBarcode = useCallback(async (id, barcode) => {
    setLoading(true);
    try {
      const response = await apiLookupBarcode(id, barcode);
      return { success: true, data: response.data };
    } catch (err) {
      if (err.response?.status === 404) {
        return { success: false, error: "Barcode not found", notFound: true };
      }
      return { success: false, error: err.message || "Failed to look up barcode" };
    } finally { setLoading(false); }
  }, []);

  return {
    loading,
    createStockCount,
    updateStockCount,
    assignCounters,
    startCounting,
    saveProgress,
    submitStockCount,
    approveStockCount,
    completeStockCount,
    cancelStockCount,
    exportStockCounts,
    lookupBarcode,
  };
};
