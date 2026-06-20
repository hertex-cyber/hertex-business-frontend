import { useState, useEffect, useCallback } from "react";
import {
  fetchSalesTargets,
  fetchSalesTarget,
  createSalesTarget as apiCreate,
  updateSalesTarget as apiUpdate,
  deleteSalesTarget as apiDelete,
  generateTasksFromTarget,
  fetchTargetProgress,
} from "../services/salesTaskService";

export const useSalesTargets = (params = {}) => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSalesTargets(params);
      setTargets(response.data.results || response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch targets");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { targets, loading, error, refetch };
};

export const useSalesTarget = (id) => {
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSalesTarget(id);
      setTarget(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch target");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { target, loading, error, refetch };
};

export const useTargetProgress = (id) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetchTargetProgress(id);
      setProgress(response.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { progress, loading, refetch };
};
