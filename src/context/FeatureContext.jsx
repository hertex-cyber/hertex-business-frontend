import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { fetchCompanyFeatures } from "@/modules/inventory/services/featureService";

const FeatureContext = createContext();

export const useFeatureContext = () => {
  const ctx = useContext(FeatureContext);
  if (!ctx) {
    return { enabledFeatures: {}, loading: true, refreshFeatures: () => {} };
  }
  return ctx;
};

export const FeatureProvider = ({ children }) => {
  const [enabledFeatures, setEnabledFeatures] = useState(null);
  const [loading, setLoading] = useState(true);

  // Shared fetch logic — calls API and updates state
  const fetchAndSetFeatures = useCallback(async () => {
    const res = await fetchCompanyFeatures();
    const featureMap = {};
    (res.data?.features || []).forEach((f) => {
      featureMap[f.code] = f.enabled;
    });
    return featureMap;
  }, []);

  // Initial load (shows loading state in sidebar)
  const initialLoad = useCallback(async () => {
    try {
      const featureMap = await fetchAndSetFeatures();
      setEnabledFeatures(featureMap);
    } catch {
      setEnabledFeatures({});
    } finally {
      setLoading(false);
    }
  }, [fetchAndSetFeatures]);

  // Refresh (silent update — no loading flash)
  const refreshFeatures = useCallback(async () => {
    try {
      const featureMap = await fetchAndSetFeatures();
      setEnabledFeatures(featureMap);
    } catch {
      // Keep last known state on error
    }
  }, [fetchAndSetFeatures]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  return (
    <FeatureContext.Provider
      value={{
        enabledFeatures,
        loading,
        refreshFeatures,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
};
