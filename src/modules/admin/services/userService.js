/**
 * User Management API Service
 * Handles all API calls for user management operations
 */

import API from "../../../lib/api";

class UserService {
  /**
   * Get list of users with pagination and filters
   */
  static async getUsers(params = {}) {
    try {
      const response = await API.get("/users/", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single user details
   */
  static async getUserById(userId) {
    try {
      const response = await API.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new user
   */
  static async createUser(userData) {
    try {
      const response = await API.post("/users/", userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user
   */
  static async updateUser(userId, userData) {
    try {
      const response = await API.patch(`/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete (deactivate) user
   */
  static async deleteUser(userId) {
    try {
      const response = await API.delete(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user activities/audit log
   */
  static async getUserActivities(userId, params = {}) {
    try {
      const response = await API.get(`/users/${userId}/activities/`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update users
   */
  static async bulkUpdateUsers(userIds, updates) {
    try {
      const response = await API.patch("/users/bulk-update/", {
        user_ids: userIds,
        updates,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all activities (global audit log)
   */
  static async getAllActivities(params = {}) {
    try {
      const response = await API.get("/activities/", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific activity details
   */
  static async getActivityById(activityId) {
    try {
      const response = await API.get(`/activities/${activityId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all departments
   */
  static async getDepartments(params = {}) {
    try {
      const response = await API.get("/departments/", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  static handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      let message = data?.message || data?.detail;
      if (!message && data && typeof data === "object") {
        message = Object.entries(data)
          .map(([field, errors]) => {
            const msgs = Array.isArray(errors) ? errors.join(", ") : String(errors);
            return `${field}: ${msgs}`;
          })
          .join(" | ");
      }
      return new Error(`${status} - ${message || "An error occurred"}`);
    }
    return error;
  }
}

export default UserService;
