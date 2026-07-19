import { useState, useCallback, useEffect } from "react";
import {
  fetchSupplierPayments,
  fetchSupplierPayment,
  createSupplierPayment as apiCreatePayment,
  updateSupplierPayment as apiUpdatePayment,
  deleteSupplierPayment as apiDeletePayment,
  submitSupplierPayment as apiSubmitPayment,
  approveSupplierPayment as apiApprovePayment,
  postSupplierPayment as apiPostPayment,
  allocateSupplierPayment as apiAllocatePayment,
  cancelSupplierPayment as apiCancelPayment,
  voidSupplierPayment as apiVoidPayment,
  fetchSupplierPaymentHistory as apiFetchHistory,
  exportSupplierPayments as apiExport,
  fetchOutstandingReport as apiOutstanding,
  fetchCashFlowReport as apiCashFlow,
} from "../services/supplierPaymentService";

export const useSupplierPayments = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSupplierPayments(filters);
      setData(res.data.results || res.data);
      setTotal(res.data.count || (res.data.results || res.data).length);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, total, refetch: fetch };
};

export const useSupplierPayment = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    fetchSupplierPayment(id)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || err.message || "Failed to fetch payment")
      )
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

export const useSupplierPaymentActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPayment = useCallback(async (data) => {
    setLoading(true); setError(null);
    try { const res = await apiCreatePayment(data); return res.data; }
    catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to create";
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const updatePayment = useCallback(async (id, data) => {
    setLoading(true); setError(null);
    try { const res = await apiUpdatePayment(id, data); return res.data; }
    catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to update";
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const deletePayment = useCallback(async (id) => {
    setLoading(true); setError(null);
    try { await apiDeletePayment(id); }
    catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to delete";
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const submit = useCallback(async (id) => {
    setLoading(true); setError(null);
    try { const res = await apiSubmitPayment(id); return res.data; }
    catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to submit";
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const approve = useCallback(async (id, notes = "") => {
    setLoading(true); setError(null);
    try { const res = await apiApprovePayment(id, { notes }); return res.data; }
    catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to approve";
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const post = useCallback(async (id) => {
    setLoading(true); setError(null);
    try { const res = await apiPostPayment(id); return res.data; }
    catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to post";
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const allocate = useCallback(async (id, allocations) => {
    setLoading(true); setError(null);
    try { const res = await apiAllocatePayment(id, { allocations }); return res.data; }
    catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to allocate";
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const cancel = useCallback(async (id, remarks = "") => {
    setLoading(true); setError(null);
    try { const res = await apiCancelPayment(id, { remarks }); return res.data; }
    catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to cancel";
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const voidPayment = useCallback(async (id, remarks = "") => {
    setLoading(true); setError(null);
    try { const res = await apiVoidPayment(id, { remarks }); return res.data; }
    catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to void";
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  return {
    createPayment, updatePayment, deletePayment,
    submit, approve, post, allocate, cancel,
    void: voidPayment, loading, error,
  };
};

export const useSupplierPaymentHistory = (id) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    apiFetchHistory(id)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || err.message || "Failed to fetch history")
      )
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};
