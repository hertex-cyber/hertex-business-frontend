/**
 * Media API layer — CRUD for dynamic collections and asset uploads.
 */
import axios from 'axios';

const BASE = '/api/media';

export const mediaApi = {
  // -----------------------------------------------------------------------
  // Collections
  // -----------------------------------------------------------------------
  collections: {
    /** List all collections for current user */
    list: () => axios.get(`${BASE}/collections/`),

    /** Get single collection */
    get: (id) => axios.get(`${BASE}/collections/${id}/`),

    /** Create a new collection */
    create: (data) => axios.post(`${BASE}/collections/`, data),

    /** Full update */
    update: (id, data) => axios.put(`${BASE}/collections/${id}/`, data),

    /** Partial update (rename, etc.) */
    patch: (id, data) => axios.patch(`${BASE}/collections/${id}/`, data),

    /** Delete collection and all its assets */
    remove: (id) => axios.delete(`${BASE}/collections/${id}/`),
  },

  // -----------------------------------------------------------------------
  // Assets
  // -----------------------------------------------------------------------
  assets: {
    /** List assets, optionally filtered by collection_id and file_type */
    list: (params = {}) => axios.get(`${BASE}/assets/`, { params }),

    /** Get single asset details */
    get: (id) => axios.get(`${BASE}/assets/${id}/`),

    /** Upload a file to a collection (multipart/form-data) */
    upload: (formData) =>
      axios.post(`${BASE}/assets/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),

    /** Delete an asset */
    remove: (id) => axios.delete(`${BASE}/assets/${id}/`),
  },
};
