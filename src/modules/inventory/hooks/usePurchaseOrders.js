import { useState, useEffect, useCallback } from "react";
import purchaseOrderService from "../services/purchaseOrderService";

export function usePurchaseOrders(initialParams = {}) {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await purchaseOrderService.list(params);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch, setParams };
}

export function usePurchaseOrder(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    purchaseOrderService
      .get(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

export function usePurchaseOrderActions() {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const execute = useCallback(async (action, ...args) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await purchaseOrderService[action](...args);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setActionError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  }, []);

  return { execute, actionLoading, actionError };
}

export function usePurchaseOrderHistory(id) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    purchaseOrderService
      .getHistory(id)
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
}

export function usePurchaseOrderReceipts(id) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    purchaseOrderService
      .getReceipts(id)
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
}
