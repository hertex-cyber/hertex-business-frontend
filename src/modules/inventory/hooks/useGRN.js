import { useState, useCallback, useEffect } from "react";
import {
  fetchGRNs,
  fetchGRN,
  createGRN as apiCreateGRN,
  updateGRN as apiUpdateGRN,
  deleteGRN as apiDeleteGRN,
  submitGRN as apiSubmitGRN,
  approveGRN as apiApproveGRN,
  receiveGRN as apiReceiveGRN,
  completeGRN as apiCompleteGRN,
  cancelGRN as apiCancelGRN,
  exportGRNs as apiExportGRNs,
  fetchGRNHistory as apiFetchGRNHistory,
  printGRN as apiPrintGRN,
} from "../services/grnService";

export const useGRNs = (filters = {}) => {
  const [grns, setGRNs] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchGRNs(filters);
      setGRNs(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch GRNs",
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { grns, count, loading, error, refetch };
};

export const useGRN = (id) => {
  const [grn, setGRN] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchGRN(id);
      setGRN(response.data.data || response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch GRN",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { grn, loading, error, refetch };
};

export const useGRNActions = () => {
  const [loading, setLoading] = useState(false);

  const createGRN = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await apiCreateGRN(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to create GRN";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGRN = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiUpdateGRN(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to update GRN";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGRN = useCallback(async (id) => {
    setLoading(true);
    try {
      await apiDeleteGRN(id);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to delete GRN";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const submitGRN = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiSubmitGRN(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit GRN";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const approveGRN = useCallback(async (id, notes = "") => {
    setLoading(true);
    try {
      const response = await apiApproveGRN(id, { notes });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to approve GRN";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const receiveGRN = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiReceiveGRN(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to receive GRN";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const completeGRN = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiCompleteGRN(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to complete GRN";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelGRN = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiCancelGRN(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to cancel GRN";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportGRNs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await apiExportGRNs(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "goods_receipts.xlsx";
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
        "Failed to export GRNs";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const printGRN = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiPrintGRN(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `GRN-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to print GRN";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createGRN,
    updateGRN,
    deleteGRN,
    submitGRN,
    approveGRN,
    receiveGRN,
    completeGRN,
    cancelGRN,
    exportGRNs,
    printGRN,
  };
};

export const useGRNHistory = (id) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetchGRNHistory(id)
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [id]);

  return { history, loading };
};
