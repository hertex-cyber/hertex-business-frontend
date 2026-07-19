import axios from "axios";

const BASE = "/api/inventory/purchase-returns";

export const fetchPurchaseReturns = (params = {}) =>
  axios.get(`${BASE}/`, { params });

export const fetchPurchaseReturn = (id) =>
  axios.get(`${BASE}/${id}/`);

export const createPurchaseReturn = (data) =>
  axios.post(`${BASE}/`, data);

export const updatePurchaseReturn = (id, data) =>
  axios.put(`${BASE}/${id}/`, data);

export const partialUpdatePurchaseReturn = (id, data) =>
  axios.patch(`${BASE}/${id}/`, data);

export const deletePurchaseReturn = (id) =>
  axios.delete(`${BASE}/${id}/`);

export const submitPurchaseReturn = (id) =>
  axios.post(`${BASE}/${id}/submit/`);

export const approvePurchaseReturn = (id, data = {}) =>
  axios.post(`${BASE}/${id}/approve/`, data);

export const rejectPurchaseReturn = (id, data = {}) =>
  axios.post(`${BASE}/${id}/reject/`, data);

export const returnToSupplier = (id) =>
  axios.post(`${BASE}/${id}/return-to-supplier/`);

export const completePurchaseReturn = (id) =>
  axios.post(`${BASE}/${id}/complete/`);

export const cancelPurchaseReturn = (id, data = {}) =>
  axios.post(`${BASE}/${id}/cancel/`, data);

export const fetchPurchaseReturnHistory = (id) =>
  axios.get(`${BASE}/${id}/history/`);

export const exportPurchaseReturns = (fmt = "csv") =>
  axios.get(`${BASE}/export/`, {
    params: { export_format: fmt },
    responseType: fmt === "csv" ? "text" : "blob",
  });

export const purchaseReturnService = {
  list: fetchPurchaseReturns,
  get: fetchPurchaseReturn,
  create: createPurchaseReturn,
  update: updatePurchaseReturn,
  partialUpdate: partialUpdatePurchaseReturn,
  delete: deletePurchaseReturn,
  submit: submitPurchaseReturn,
  approve: approvePurchaseReturn,
  reject: rejectPurchaseReturn,
  returnToSupplier,
  complete: completePurchaseReturn,
  cancel: cancelPurchaseReturn,
  getHistory: fetchPurchaseReturnHistory,
  export: exportPurchaseReturns,
};
