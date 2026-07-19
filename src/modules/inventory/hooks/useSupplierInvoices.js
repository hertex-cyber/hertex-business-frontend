import { useState, useCallback, useEffect } from "react";
import {
  fetchSupplierInvoices,
  fetchSupplierInvoice,
  createSupplierInvoice as apiCreateInvoice,
  updateSupplierInvoice as apiUpdateInvoice,
  deleteSupplierInvoice as apiDeleteInvoice,
  submitSupplierInvoice as apiSubmitInvoice,
  approveSupplierInvoice as apiApproveInvoice,
  postSupplierInvoice as apiPostInvoice,
  recordPayment as apiRecordPayment,
  cancelSupplierInvoice as apiCancelInvoice,
  voidSupplierInvoice as apiVoidInvoice,
  exportSupplierInvoices as apiExport,
  printSupplierInvoice as apiPrint,
  fetchSupplierInvoiceHistory as apiFetchHistory,
} from "../services/supplierInvoiceService";

export const useSupplierInvoices = (filters = {}) => {
  const [invoices, setInvoices] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchSupplierInvoices(filters);
      setInvoices(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch invoices",
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { invoices, count, loading, error, refetch };
};

export const useSupplierInvoice = (id) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchSupplierInvoice(id);
      setInvoice(response.data.data || response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch invoice",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { invoice, loading, error, refetch };
};

export const useSupplierInvoiceActions = () => {
  const [loading, setLoading] = useState(false);

  const createInvoice = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await apiCreateInvoice(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to create invoice";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInvoice = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiUpdateInvoice(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to update invoice";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInvoice = useCallback(async (id) => {
    setLoading(true);
    try {
      await apiDeleteInvoice(id);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to delete invoice";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const submitInvoice = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiSubmitInvoice(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit invoice";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const approveInvoice = useCallback(async (id, notes = "") => {
    setLoading(true);
    try {
      const response = await apiApproveInvoice(id, { notes });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to approve invoice";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const postInvoice = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiPostInvoice(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to post invoice";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const recordPayment = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiRecordPayment(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to record payment";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelInvoice = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiCancelInvoice(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to cancel invoice";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const voidInvoice = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiVoidInvoice(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to void invoice";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportInvoices = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await apiExport(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "supplier_invoices.xlsx";
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
        "Failed to export invoices";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const printInvoice = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiPrint(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SI-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to print invoice";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    submitInvoice,
    approveInvoice,
    postInvoice,
    recordPayment,
    cancelInvoice,
    voidInvoice,
    exportInvoices,
    printInvoice,
  };
};

export const useSupplierInvoiceHistory = (id) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetchHistory(id)
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [id]);

  return { history, loading };
};
