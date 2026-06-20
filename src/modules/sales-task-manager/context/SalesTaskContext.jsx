import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const SalesTaskContext = createContext(null);

export const SalesTaskProvider = ({ children }) => {
  // ── Active Selection State ───────────────────────────────────────────────
  const [activeCycleId, setActiveCycleId] = useState(null);
  const [activeTargetId, setActiveTargetId] = useState(null);
  const [activeProgrammeId, setActiveProgrammeId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // ── Filter State ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    programme: null,
    assigned_to: null,
    status: null,
    priority: null,
    task_type: null,
    due_date_gte: null,
    due_date_lte: null,
  });

  // ── UI State ─────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState("kanban"); // kanban | list
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Actions ──────────────────────────────────────────────────────────────

  const clearSelection = useCallback(() => {
    setActiveCycleId(null);
    setActiveTargetId(null);
    setActiveProgrammeId(null);
    setActiveTaskId(null);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      programme: null,
      assigned_to: null,
      status: null,
      priority: null,
      task_type: null,
      due_date_gte: null,
      due_date_lte: null,
    });
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || null }));
  }, []);

  const contextValue = useMemo(
    () => ({
      // State
      activeCycleId,
      activeTargetId,
      activeProgrammeId,
      activeTaskId,
      filters,
      viewMode,
      sidebarCollapsed,

      // Setters
      setActiveCycleId,
      setActiveTargetId,
      setActiveProgrammeId,
      setActiveTaskId,
      setFilters,
      setViewMode,
      setSidebarCollapsed,

      // Actions
      clearSelection,
      clearFilters,
      setFilter,
    }),
    [
      activeCycleId,
      activeTargetId,
      activeProgrammeId,
      activeTaskId,
      filters,
      viewMode,
      sidebarCollapsed,
      clearSelection,
      clearFilters,
      setFilter,
    ]
  );

  return (
    <SalesTaskContext.Provider value={contextValue}>
      {children}
    </SalesTaskContext.Provider>
  );
};

export const useSalesTaskContext = () => {
  const context = useContext(SalesTaskContext);
  if (!context) {
    throw new Error("useSalesTaskContext must be used within a SalesTaskProvider");
  }
  return context;
};

export default SalesTaskContext;
