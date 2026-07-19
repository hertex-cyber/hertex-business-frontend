import axios from "axios";

const BASE = "/api/inventory";

// ============================================================================
// RESERVATIONS
// ============================================================================

export const fetchReservations = (params = {}) =>
  axios.get(`${BASE}/reservations/`, { params });

export const fetchReservation = (id) =>
  axios.get(`${BASE}/reservations/${id}/`);

export const createReservation = (data) =>
  axios.post(`${BASE}/reservations/`, data);

export const updateReservation = (id, data) =>
  axios.put(`${BASE}/reservations/${id}/`, data);

export const deleteReservation = (id) =>
  axios.delete(`${BASE}/reservations/${id}/`);

export const activateReservation = (id) =>
  axios.post(`${BASE}/reservations/${id}/activate/`);

export const fulfillReservation = (id, data = {}) =>
  axios.post(`${BASE}/reservations/${id}/fulfill/`, data);

export const cancelReservation = (id) =>
  axios.post(`${BASE}/reservations/${id}/cancel/`);

export const expireReservation = (id) =>
  axios.post(`${BASE}/reservations/${id}/expire/`);

export const exportReservations = (params = {}) =>
  axios.get(`${BASE}/reservations/export/`, {
    params,
    responseType: "blob",
  });

export const fetchReservationHistory = (id) =>
  axios.get(`${BASE}/reservations/${id}/history/`);

export const bulkCancelReservations = (ids) =>
  axios.post(`${BASE}/reservations/bulk-cancel/`, { reservation_ids: ids });
