import { useState, useCallback, useEffect } from "react";
import {
  fetchAdjustments,
  fetchAdjustment,
  createAdjustment as apiCreateAdjustment,
  updateAdjustment as apiUpdateAdjustment,
  submitAdjustment as apiSubmitAdjustment,
  approveAdjustment as apiApproveAdjustment,
  rejectAdjustment as apiRejectAdjustment,
  applyAdjustment as apiApplyAdjustment,
  cancelAdjustment as apiCancelAdjustment,
  exportAdjustments as apiExportAdjustments,
  fetchAdjustmentReasons,
} from "../services/adjustmentService";

/**
 * useAdjustmentReasons hook - Fetch adjustment reasons for dropdown
 */
export const useAdjustmentReasons = (params = {}) => {
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAdjustmentReasons(params);
      setReasons(response.data.results || response.data.data || response.data || []);
    } catch {
      setReasons([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reasons, loading, refetch };
};

/**
 * useAdjustments hook - Fetch paginated adjustment list
 */
export const useAdjustments = (filters = {}) => {
  const [adjustments, setAdjustments] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAdjustments(filters);
      setAdjustments(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch adjustments",
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { adjustments, count, loading, error, refetch };
};

/**
 * useAdjustmentActions hook - All adjustment workflow actions
 */
export const useAdjustmentActions = () => {
  const [loading, setLoading] = useState(false);

  const createAdjustment = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await apiCreateAdjustment(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to create adjustment";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAdjustment = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiUpdateAdjustment(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to update adjustment";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAdjustment = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiSubmitAdjustment(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit adjustment";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const approveAdjustment = useCallback(async (id, notes = "") => {
    setLoading(true);
    try {
      const response = await apiApproveAdjustment(id, { notes });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to approve adjustment";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectAdjustment = useCallback(async (id, notes = "") => {
    setLoading(true);
    try {
      const response = await apiRejectAdjustment(id, { notes });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to reject adjustment";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const applyAdjustment = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiApplyAdjustment(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to apply adjustment";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAdjustment = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiCancelAdjustment(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to cancel adjustment";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAdjustments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await apiExportAdjustments(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "adjustments.xlsx";
      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to export adjustments";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createAdjustment,
    updateAdjustment,
    submitAdjustment,
    approveAdjustment,
    rejectAdjustment,
    applyAdjustment,
    cancelAdjustment,
    exportAdjustments,
  };
};
