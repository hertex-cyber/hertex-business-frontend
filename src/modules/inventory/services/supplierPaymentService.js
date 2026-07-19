import axios from "axios";

const BASE = "/api/inventory/supplier-payments";

export const fetchSupplierPayments = (params = {}) =>
  axios.get(`${BASE}/`, { params });

export const fetchSupplierPayment = (id) =>
  axios.get(`${BASE}/${id}/`);

export const createSupplierPayment = (data) =>
  axios.post(`${BASE}/`, data);

export const updateSupplierPayment = (id, data) =>
  axios.put(`${BASE}/${id}/`, data);

export const partialUpdateSupplierPayment = (id, data) =>
  axios.patch(`${BASE}/${id}/`, data);

export const deleteSupplierPayment = (id) =>
  axios.delete(`${BASE}/${id}/`);

export const submitSupplierPayment = (id) =>
  axios.post(`${BASE}/${id}/submit/`);

export const approveSupplierPayment = (id, data = {}) =>
  axios.post(`${BASE}/${id}/approve/`, data);

export const postSupplierPayment = (id) =>
  axios.post(`${BASE}/${id}/post/`);

export const allocateSupplierPayment = (id, data) =>
  axios.post(`${BASE}/${id}/allocate/`, data);

export const cancelSupplierPayment = (id, data = {}) =>
  axios.post(`${BASE}/${id}/cancel/`, data);

export const voidSupplierPayment = (id, data = {}) =>
  axios.post(`${BASE}/${id}/void/`, data);

export const fetchSupplierPaymentHistory = (id) =>
  axios.get(`${BASE}/${id}/history/`);

export const exportSupplierPayments = (fmt = "csv") =>
  axios.get(`${BASE}/export/`, {
    params: { export_format: fmt },
    responseType: fmt === "csv" ? "text" : "blob",
  });

export const fetchOutstandingReport = (params = {}) =>
  axios.get(`${BASE}/reports/outstanding/`, { params });

export const fetchCashFlowReport = (params = {}) =>
  axios.get(`${BASE}/reports/cash-flow/`, { params });

export const supplierPaymentService = {
  list: fetchSupplierPayments,
  get: fetchSupplierPayment,
  create: createSupplierPayment,
  update: updateSupplierPayment,
  partialUpdate: partialUpdateSupplierPayment,
  delete: deleteSupplierPayment,
  submit: submitSupplierPayment,
  approve: approveSupplierPayment,
  post: postSupplierPayment,
  allocate: allocateSupplierPayment,
  cancel: cancelSupplierPayment,
  void: voidSupplierPayment,
  getHistory: fetchSupplierPaymentHistory,
  export: exportSupplierPayments,
  getOutstandingReport: fetchOutstandingReport,
  getCashFlowReport: fetchCashFlowReport,
};
