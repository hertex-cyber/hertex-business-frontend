/**
 * Custom hook for user management
 */

import { useState, useCallback, useEffect } from "react";
import UserService from "../services/userService";

/**
 * useUsers hook - Manages users list with filtering and pagination
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: 20,
  });

  const fetchUsers = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const result = await UserService.getUsers({
          page: pagination.page,
          page_size: pagination.pageSize,
          ...params,
        });

        setUsers(result.results || []);
        setPagination((prev) => ({
          ...prev,
          count: result.count,
          next: result.next,
          previous: result.previous,
        }));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.pageSize],
  );

  const createUser = useCallback(
    async (userData) => {
      setError(null);
      try {
        const result = await UserService.createUser(userData);
        // Refresh list
        await fetchUsers();
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchUsers],
  );

  const updateUser = useCallback(
    async (userId, userData) => {
      setError(null);
      try {
        const result = await UserService.updateUser(userId, userData);
        // Refresh list
        await fetchUsers();
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchUsers],
  );

  const deleteUser = useCallback(
    async (userId) => {
      setError(null);
      try {
        const result = await UserService.deleteUser(userId);
        // Refresh list
        await fetchUsers();
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchUsers],
  );

  const bulkUpdateUsers = useCallback(
    async (userIds, updates) => {
      setError(null);
      try {
        const result = await UserService.bulkUpdateUsers(userIds, updates);
        // Refresh list
        await fetchUsers();
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchUsers],
  );

  return {
    users,
    loading,
    error,
    pagination,
    setPagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkUpdateUsers,
  };
};

/**
 * useAuditLog hook - Manages audit log viewing
 */
export const useAuditLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: 20,
  });

  const fetchUserActivities = useCallback(
    async (userId, params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const result = await UserService.getUserActivities(userId, {
          page: pagination.page,
          page_size: pagination.pageSize,
          ...params,
        });

        setActivities(result.results || result.data || []);
        if (result.results) {
          setPagination((prev) => ({
            ...prev,
            count: result.count,
            next: result.next,
            previous: result.previous,
          }));
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.pageSize],
  );

  const fetchAllActivities = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const result = await UserService.getAllActivities({
          page: pagination.page,
          page_size: pagination.pageSize,
          ...params,
        });

        setActivities(result.results || []);
        setPagination((prev) => ({
          ...prev,
          count: result.count,
          next: result.next,
          previous: result.previous,
        }));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.pageSize],
  );

  return {
    activities,
    loading,
    error,
    pagination,
    setPagination,
    fetchUserActivities,
    fetchAllActivities,
  };
};

/**
 * useUserDetail hook - Get single user with activities
 */
export const useUserDetail = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const result = await UserService.getUserById(userId);
      setUser(result.data || result);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [userId, fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
};
/**
 * useDepartments hook - Manages department list
 */
export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await UserService.getDepartments({ page_size: 100 });
      setDepartments(result.results || result.data || result || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments,
  };
};
