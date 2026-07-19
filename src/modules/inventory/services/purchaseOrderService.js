import api from "../../../lib/api";

const BASE = "/api/inventory/purchase-orders";
const RECEIPTS_BASE = "/api/inventory/purchase-receipts";

export const purchaseOrderService = {
  // List / Fetch
  list: (params = {}) => api.get(BASE, { params }),
  get: (id) => api.get(`${BASE}/${id}/`),
  getReceipts: (id) => api.get(`${BASE}/${id}/receipts/`),
  getHistory: (id) => api.get(`${BASE}/${id}/history/`),

  // CRUD
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`${BASE}/${id}/`, data),
  delete: (id) => api.delete(`${BASE}/${id}/`),

  // Workflow
  send: (id, data = {}) => api.post(`${BASE}/${id}/send/`, data),
  receive: (id, data) => api.post(`${BASE}/${id}/receive/`, data),
  close: (id, data = {}) => api.post(`${BASE}/${id}/close/`, data),
  cancel: (id, data = {}) => api.post(`${BASE}/${id}/cancel/`, data),

  // Export / Print
  export: (format = "csv", params = {}) =>
    api.get(`${BASE}/export/`, {
      params: { export_format: format, ...params },
      responseType: "blob",
    }),
  printPO: (id) =>
    api.get(`${BASE}/${id}/print-po/`, { responseType: "blob" }),
  printGRN: (id, receiptId) =>
    api.get(`${BASE}/${id}/print-grn/`, {
      params: { receipt_id: receiptId },
      responseType: "blob",
    }),

  // Receipts
  listReceipts: (params = {}) => api.get(RECEIPTS_BASE, { params }),
  getReceipt: (id) => api.get(`${RECEIPTS_BASE}/${id}/`),
};

export default purchaseOrderService;
