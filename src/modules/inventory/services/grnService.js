import axios from "axios";

const BASE = "/api/inventory/goods-receipts";

export const fetchGRNs = (params = {}) =>
  axios.get(`${BASE}/`, { params });

export const fetchGRN = (id) =>
  axios.get(`${BASE}/${id}/`);

export const createGRN = (data) =>
  axios.post(`${BASE}/`, data);

export const updateGRN = (id, data) =>
  axios.put(`${BASE}/${id}/`, data);

export const partialUpdateGRN = (id, data) =>
  axios.patch(`${BASE}/${id}/`, data);

export const deleteGRN = (id) =>
  axios.delete(`${BASE}/${id}/`);

export const submitGRN = (id) =>
  axios.post(`${BASE}/${id}/submit/`);

export const approveGRN = (id, data = {}) =>
  axios.post(`${BASE}/${id}/approve/`, data);

export const receiveGRN = (id) =>
  axios.post(`${BASE}/${id}/receive/`);

export const completeGRN = (id) =>
  axios.post(`${BASE}/${id}/complete/`);

export const cancelGRN = (id) =>
  axios.post(`${BASE}/${id}/cancel/`);

export const fetchGRNHistory = (id) =>
  axios.get(`${BASE}/${id}/history/`);

export const printGRN = (id) =>
  axios.get(`${BASE}/${id}/print/`, { responseType: "blob" });

export const exportGRNs = (params = {}) =>
  axios.get(`${BASE}/export/`, {
    params,
    responseType: "blob",
  });
