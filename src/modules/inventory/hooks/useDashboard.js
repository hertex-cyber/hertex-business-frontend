import { useState, useCallback, useEffect } from "react";
import {
  fetchFullDashboard,
  fetchDashboardCards,
  fetchDashboardCharts,
  fetchCurrentStockReport,
  fetchStockLedgerReport,
  fetchStockSummaryReport,
  fetchStockMovementReport,
  fetchValuationReport,
  fetchAdjustmentsReport,
  fetchTransfersReport,
  fetchReservationsReport,
  fetchPurchaseOrdersReport,
  fetchGoodsReceiptsReport,
  fetchPurchaseReturnsReport,
  fetchStockCountsReport,
  fetchLowStockReport,
  fetchOutOfStockReport,
  fetchReorderReport,
  fetchFastMovingReport,
  fetchSlowMovingReport,
  fetchDeadStockReport,
  fetchInventoryAgingReport,
  exportReport,
} from "../services/dashboardService";

export const useDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFullDashboard();
      setDashboard(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { dashboard, loading, error, refetch };
};

export const useDashboardCards = () => {
  const [cards, setCards] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchDashboardCards();
      setCards(response.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { cards, loading, refetch };
};

export const useDashboardCharts = () => {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchDashboardCharts();
      setCharts(response.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { charts, loading, refetch };
};

const reportHooks = {
  useCurrentStockReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchCurrentStockReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);

    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },

  useStockLedgerReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchStockLedgerReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);

    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },

  useStockSummaryReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchStockSummaryReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);

    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },

  useStockMovementReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchStockMovementReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);

    useEffect(() => { refetch(); }, [refetch]);
    return { data, loading, refetch };
  },

  useAdjustmentsReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchAdjustmentsReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);
    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },

  useTransfersReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchTransfersReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);
    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },

  useReservationsReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchReservationsReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);
    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },

  usePurchaseOrdersReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchPurchaseOrdersReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);
    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },

  useGoodsReceiptsReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchGoodsReceiptsReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);
    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },

  usePurchaseReturnsReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchPurchaseReturnsReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);
    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },

  useStockCountsReport: (filters = {}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const refetch = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchStockCountsReport(filters);
        setData(response.data.results || response.data.data || response.data || []);
        setCount(response.data.count || 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(filters)]);
    useEffect(() => { refetch(); }, [refetch]);
    return { data, count, loading, refetch };
  },
};

export const useLowStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchLowStockReport();
      setData(response.data.results || response.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
};

export const useOutOfStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchOutOfStockReport();
      setData(response.data.results || response.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
};

export const useReorderReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchReorderReport();
      setData(response.data.results || response.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
};

export const useFastMoving = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchFastMovingReport();
      setData(response.data.results || response.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
};

export const useSlowMoving = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchSlowMovingReport();
      setData(response.data.results || response.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
};

export const useDeadStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchDeadStockReport();
      setData(response.data.results || response.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
};

export const useInventoryAging = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchInventoryAgingReport();
      setData(response.data.results || response.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
};

export const useReportExport = () => {
  const [loading, setLoading] = useState(false);

  const doExport = useCallback(async (reportType, params = {}) => {
    setLoading(true);
    try {
      const response = await exportReport(reportType, { ...params, export_format: params.export_format || "xlsx" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = `${reportType}.${params.export_format || "xlsx"}`;
      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, exportReport: doExport };
};

export const {
  useCurrentStockReport,
  useStockLedgerReport,
  useStockSummaryReport,
  useStockMovementReport,
  useAdjustmentsReport,
  useTransfersReport,
  useReservationsReport,
  usePurchaseOrdersReport,
  useGoodsReceiptsReport,
  usePurchaseReturnsReport,
  useStockCountsReport,
} = reportHooks;
