import { useState, useEffect, useCallback } from "react";
import {
  fetchSalesTasks,
  fetchSalesTask,
  fetchMyTasks,
  createSalesTask as apiCreateTask,
  updateSalesTask as apiUpdateTask,
  deleteSalesTask as apiDeleteTask,
} from "../services/salesTaskService";

export const useSalesTasks = (params = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSalesTasks(params);
      setTasks(response.data.results || response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tasks, loading, error, refetch };
};

export const useSalesTask = (id) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSalesTask(id);
      setTask(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch task");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { task, loading, error, refetch };
};

export const useMyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchMyTasks();
      setTasks(response.data.results || response.data.data || response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch my tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tasks, loading, error, refetch };
};
