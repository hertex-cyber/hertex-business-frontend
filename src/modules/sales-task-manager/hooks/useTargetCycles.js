import { useState, useEffect, useCallback } from "react";
import {
  fetchTargetCycles,
  fetchTargetCycle,
  createTargetCycle as apiCreate,
  updateTargetCycle as apiUpdate,
  deleteTargetCycle as apiDelete,
  activateTargetCycle,
  closeTargetCycle,
  fetchTargetCycleSummary,
} from "../services/salesTaskService";

export const useTargetCycles = (params = {}) => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchTargetCycles(params);
      setCycles(response.data.results || response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch target cycles");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { cycles, loading, error, refetch };
};

export const useTargetCycle = (id) => {
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetchTargetCycle(id);
      setCycle(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch target cycle");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { cycle, loading, error, refetch };
};

export const useTargetCycleDetail = (id) => {
  const { cycle, loading, error } = useTargetCycle(id);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setSummaryLoading(true);
        const response = await fetchTargetCycleSummary(id);
        setSummary(response.data);
      } catch {
        // silently fail
      } finally {
        setSummaryLoading(false);
      }
    })();
  }, [id]);

  return { cycle, summary, loading: loading || summaryLoading, error };
};
