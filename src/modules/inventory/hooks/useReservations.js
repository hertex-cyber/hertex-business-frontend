import { useState, useCallback, useEffect } from "react";
import {
  fetchReservations,
  fetchReservation,
  createReservation as apiCreateReservation,
  updateReservation as apiUpdateReservation,
  deleteReservation as apiDeleteReservation,
  activateReservation as apiActivateReservation,
  fulfillReservation as apiFulfillReservation,
  cancelReservation as apiCancelReservation,
  expireReservation as apiExpireReservation,
  exportReservations as apiExportReservations,
  bulkCancelReservations as apiBulkCancelReservations,
} from "../services/reservationService";

/**
 * useReservations hook - Fetch paginated reservation list
 */
export const useReservations = (filters = {}) => {
  const [reservations, setReservations] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchReservations(filters);
      setReservations(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch reservations",
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reservations, count, loading, error, refetch };
};

/**
 * useReservation hook - Fetch single reservation detail
 */
export const useReservation = (id) => {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchReservation(id);
      setReservation(response.data.data || response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch reservation",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reservation, loading, error, refetch };
};

/**
 * useReservationActions hook - All reservation workflow actions
 */
export const useReservationActions = () => {
  const [loading, setLoading] = useState(false);

  const createReservation = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await apiCreateReservation(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to create reservation";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReservation = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiUpdateReservation(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to update reservation";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReservation = useCallback(async (id) => {
    setLoading(true);
    try {
      await apiDeleteReservation(id);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to delete reservation";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const activateReservation = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiActivateReservation(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to activate reservation";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const fulfillReservation = useCallback(async (id, items = null) => {
    setLoading(true);
    try {
      const payload = items ? { items } : {};
      const response = await apiFulfillReservation(id, payload);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to fulfill reservation";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiCancelReservation(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to cancel reservation";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const expireReservation = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiExpireReservation(id);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to expire reservation";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReservations = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await apiExportReservations(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "reservations.xlsx";
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
        "Failed to export reservations";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkCancelReservations = useCallback(async (ids) => {
    setLoading(true);
    try {
      const response = await apiBulkCancelReservations(ids);
      return { success: true, data: response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to cancel reservations";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createReservation,
    updateReservation,
    deleteReservation,
    activateReservation,
    fulfillReservation,
    cancelReservation,
    expireReservation,
    exportReservations,
    bulkCancelReservations,
  };
};
