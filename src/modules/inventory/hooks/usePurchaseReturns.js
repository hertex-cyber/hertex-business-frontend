import { useState, useCallback, useEffect } from "react";
import {
  fetchPurchaseReturns,
  fetchPurchaseReturn,
  createPurchaseReturn as apiCreateReturn,
  updatePurchaseReturn as apiUpdateReturn,
  deletePurchaseReturn as apiDeleteReturn,
  submitPurchaseReturn as apiSubmitReturn,
  approvePurchaseReturn as apiApproveReturn,
  rejectPurchaseReturn as apiRejectReturn,
  returnToSupplier as apiReturnToSupplier,
  completePurchaseReturn as apiCompleteReturn,
  cancelPurchaseReturn as apiCancelReturn,
  fetchPurchaseReturnHistory as apiFetchHistory,
  exportPurchaseReturns as apiExport,
} from "../services/purchaseReturnService";

export const usePurchaseReturns = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPurchaseReturns(filters);
      setData(res.data.results || res.data);
      setTotal(res.data.count || (res.data.results || res.data).length);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch purchase returns");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, total, refetch: fetch };
};

export const usePurchaseReturn = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    fetchPurchaseReturn(id)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || err.message || "Failed to fetch purchase return")
      )
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

export const usePurchaseReturnActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReturn = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCreateReturn(data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to create";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReturn = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiUpdateReturn(id, data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to update";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReturn = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteReturn(id);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to delete";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiSubmitReturn(id);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to submit";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approve = useCallback(async (id, notes = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiApproveReturn(id, { notes });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to approve";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectReturn = useCallback(async (id, notes = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRejectReturn(id, { notes });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to reject";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const returnGoods = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiReturnToSupplier(id);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to process return";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const complete = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCompleteReturn(id);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to complete";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (id, remarks = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCancelReturn(id, { remarks });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to cancel";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createReturn, updateReturn, deleteReturn,
    submit, approve, reject: rejectReturn,
    returnGoods, complete, cancel, loading, error,
  };
};

export const usePurchaseReturnHistory = (id) => {
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
