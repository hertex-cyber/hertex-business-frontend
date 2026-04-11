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

  const refreshMenus = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!user) {
      setMenus([]);
      setSections({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call backend endpoint to get user's visible menus
      const response = await axios.get("/api/menus/my-menus/");

      if (response.data?.success) {
        const data = response.data.data;
        setMenus(data.all_menus || []);
        setSections(data.sections || {});
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("[MenuContext] Failed to load menus:", err);

      // Set user-friendly error message
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to load menus";
      setError(errorMsg);

      // Set fallback empty state
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
