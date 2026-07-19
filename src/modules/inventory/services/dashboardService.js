import axios from "axios";

const DASHBOARD_BASE = "/api/inventory/dashboard";
const REPORTS_BASE = "/api/inventory/dashboard/reports";

export const fetchFullDashboard = (params = {}) =>
  axios.get(`${DASHBOARD_BASE}/`, { params });

export const fetchDashboardCards = () =>
  axios.get(`${DASHBOARD_BASE}/cards/`);

export const fetchDashboardCharts = (params = {}) =>
  axios.get(`${DASHBOARD_BASE}/charts/`, { params });

export const fetchCurrentStockReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/current-stock/`, { params });

export const fetchStockLedgerReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/stock-ledger/`, { params });

export const fetchStockSummaryReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/stock-summary/`, { params });

export const fetchStockMovementReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/stock-movement/`, { params });

export const fetchValuationReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/valuation/`, { params });

export const fetchAdjustmentsReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/adjustments/`, { params });

export const fetchTransfersReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/transfers/`, { params });

export const fetchReservationsReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/reservations/`, { params });

export const fetchPurchaseOrdersReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/purchase-orders/`, { params });

export const fetchGoodsReceiptsReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/goods-receipts/`, { params });

export const fetchPurchaseReturnsReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/purchase-returns/`, { params });

export const fetchStockCountsReport = (params = {}) =>
  axios.get(`${REPORTS_BASE}/stock-counts/`, { params });

export const fetchLowStockReport = () =>
  axios.get(`${REPORTS_BASE}/low-stock/`);

export const fetchOutOfStockReport = () =>
  axios.get(`${REPORTS_BASE}/out-of-stock/`);

export const fetchReorderReport = () =>
  axios.get(`${REPORTS_BASE}/reorder/`);

export const fetchFastMovingReport = () =>
  axios.get(`${REPORTS_BASE}/fast-moving/`);

export const fetchSlowMovingReport = () =>
  axios.get(`${REPORTS_BASE}/slow-moving/`);

export const fetchDeadStockReport = () =>
  axios.get(`${REPORTS_BASE}/dead-stock/`);

export const fetchInventoryAgingReport = () =>
  axios.get(`${REPORTS_BASE}/inventory-aging/`);

export const exportReport = (reportType, params = {}) =>
  axios.get(`${DASHBOARD_BASE}/export/${reportType}/`, {
    params,
    responseType: "blob",
  });
