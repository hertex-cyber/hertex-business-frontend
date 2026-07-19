import axios from "axios";

const BASE = "/api/inventory/supplier-invoices";

export const fetchSupplierInvoices = (params = {}) =>
  axios.get(`${BASE}/`, { params });

export const fetchSupplierInvoice = (id) =>
  axios.get(`${BASE}/${id}/`);

export const createSupplierInvoice = (data) =>
  axios.post(`${BASE}/`, data);

export const updateSupplierInvoice = (id, data) =>
  axios.put(`${BASE}/${id}/`, data);

export const partialUpdateSupplierInvoice = (id, data) =>
  axios.patch(`${BASE}/${id}/`, data);

export const deleteSupplierInvoice = (id) =>
  axios.delete(`${BASE}/${id}/`);

export const submitSupplierInvoice = (id) =>
  axios.post(`${BASE}/${id}/submit/`);

export const approveSupplierInvoice = (id, data = {}) =>
  axios.post(`${BASE}/${id}/approve/`, data);

export const postSupplierInvoice = (id) =>
  axios.post(`${BASE}/${id}/post/`);

export const recordPayment = (id, data) =>
  axios.post(`${BASE}/${id}/payment/`, data);

export const cancelSupplierInvoice = (id) =>
  axios.post(`${BASE}/${id}/cancel/`);

export const voidSupplierInvoice = (id) =>
  axios.post(`${BASE}/${id}/void/`);

export const fetchSupplierInvoiceHistory = (id) =>
  axios.get(`${BASE}/${id}/history/`);

export const printSupplierInvoice = (id) =>
  axios.get(`${BASE}/${id}/print/`, { responseType: "blob" });

export const exportSupplierInvoices = (params = {}) =>
  axios.get(`${BASE}/export/`, {
    params,
    responseType: "blob",
  });
