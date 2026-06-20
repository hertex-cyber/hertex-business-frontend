import { useState, useEffect, useCallback } from "react";
import {
  fetchSalesProgrammes,
  fetchSalesProgramme,
  fetchProgrammeGantt,
  fetchProgrammeResourceLoad,
  createSalesProgramme as apiCreate,
  updateSalesProgramme as apiUpdate,
  deleteSalesProgramme as apiDelete,
} from "../services/salesTaskService";

export const useSalesProgrammes = (params = {}) => {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSalesProgrammes(params);
      setProgrammes(response.data.results || response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch programmes");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { programmes, loading, error, refetch };
};

export const useSalesProgramme = (id) => {
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSalesProgramme(id);
      setProgramme(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch programme");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { programme, loading, error, refetch };
};

export const useProgrammeGantt = (id) => {
  const [ganttData, setGanttData] = useState(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetchProgrammeGantt(id);
      setGanttData(response.data);
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { ganttData, loading, refetch };
};

export const useProgrammeResourceLoad = (id) => {
  const [resourceLoad, setResourceLoad] = useState([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetchProgrammeResourceLoad(id);
      setResourceLoad(response.data || []);
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { resourceLoad, loading, refetch };
};
