import axios from "axios";

const API_BASE = "/api/inventory";

/**
 * Fetch all available inventory features.
 */
export const fetchFeatures = async (showInactive = false) => {
  const params = showInactive ? "?show_inactive=true" : "";
  return axios.get(`${API_BASE}/features/${params}`);
};

/**
 * Fetch enabled features for the current company.
 */
export const fetchCompanyFeatures = async () => {
  return axios.get(`${API_BASE}/company-features/`);
};

/**
 * Fetch features for a specific company (admin only).
 */
export const fetchCompanyFeaturesById = async (companyId) => {
  return axios.get(`${API_BASE}/company-features/${companyId}/`);
};

/**
 * Enable/disable features for the current company.
 * @param {string[]} featureIds - Array of feature IDs to enable. Others will be disabled.
 * @param {string|null} companyId - Optional company ID (admin only)
 */
export const updateCompanyFeatures = async (featureIds, companyId = null) => {
  const payload = { features: featureIds };
  if (companyId) {
    payload.company = companyId;
  }
  return axios.put(`${API_BASE}/company-features/`, payload);
};
