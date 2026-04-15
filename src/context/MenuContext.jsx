/**
 * Menu Context
 * Manages dynamic menu loading based on user role, organization, and product purchases
 *
 * Usage:
 *   const { menus, sections, loading, error, refreshMenus } = useMenu();
 */
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

export const MenuContext = createContext({
  menus: [],
  sections: {},
  loading: true,
  error: null,
  refreshMenus: async () => {},
});

/**
 * MenuProvider Component
 * Wraps the application and provides menu data to all child components
 */
export function MenuProvider({ children }) {
  const { user } = useAuth();
  const [menus, setMenus] = useState([]);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshMenus = useCallback(async (force = false) => {
    if (!user) {
      setMenus([]);
      setSections({});
      setLoading(false);
      return;
    }

    // Use cached data if available and not forcing refresh
    const cacheKey = `menus_${user.id || user.username}`;
    if (!force) {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          // Cache valid for 5 minutes
          if (Date.now() - ts < 5 * 60 * 1000) {
            setMenus(data.all_menus || []);
            setSections(data.sections || {});
            setLoading(false);
            return;
          }
        }
      } catch (_) {}
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/menus/my_menus/");

      if (response.data?.success) {
        const data = response.data.data;
        setMenus(data.all_menus || []);
        setSections(data.sections || {});
        // Cache the result
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
        } catch (_) {}
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("[MenuContext] Failed to load menus:", err);
      }
      setError(err.response?.data?.error || err.message || "Failed to load menus");
      setMenus([]);
      setSections({});
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load menus when user changes
  useEffect(() => {
    refreshMenus();
  }, [user, refreshMenus]);

  const value = {
    menus,
    sections,
    loading,
    error,
    refreshMenus,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

/**
 * useMenu Hook
 * Use this hook to access menu data in any component
 *
 * @returns {Object} Menu context with menus, sections, loading, error, refreshMenus
 * @throws {Error} If used outside MenuProvider
 */
export function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }

  return context;
}
