import React from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesTaskContext } from "../context/SalesTaskContext";

/**
 * FilterBar — Advanced multi-filter component for tasks
 * Reads/writes filters directly from SalesTaskContext.
 * No onFilter callback needed — context drives re-renders automatically.
 *
 * Props:
 *   programmes  — array of { id, name } for programme filter
 *   users       — array of { id, name } for assignee filter (optional)
 */
const FilterBar = ({ programmes = [], users = [] }) => {
  const { filters, setFilter, clearFilters } = useSalesTaskContext();

  const hasActiveFilters = Object.values(filters).some((v) => v != null && v !== "");

  const handleChange = (key, value) => {
    setFilter(key, value);
  };

  const selectClass =
    "bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-[10px] text-white outline-none focus:border-blue-500/50 uppercase tracking-wider";

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-white/30">
        <Filter size={12} />
        <span className="text-[9px] uppercase tracking-wider font-semibold">Filters</span>
      </div>

      {/* Programme Filter */}
      <select
        value={filters.programme || ""}
        onChange={(e) => handleChange("programme", e.target.value)}
        className={selectClass}
      >
        <option value="">All Programmes</option>
        {programmes.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {/* Assignee Filter */}
      {users.length > 0 && (
        <select
          value={filters.assigned_to || ""}
          onChange={(e) => handleChange("assigned_to", e.target.value)}
          className={selectClass}
        >
          <option value="">All Assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      )}

      {/* Status Filter */}
      <select
        value={filters.status || ""}
        onChange={(e) => handleChange("status", e.target.value)}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED", "CANCELLED"].map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>

      {/* Priority Filter */}
      <select
        value={filters.priority || ""}
        onChange={(e) => handleChange("priority", e.target.value)}
        className={selectClass}
      >
        <option value="">All Priorities</option>
        {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Task Type Filter */}
      <select
        value={filters.task_type || ""}
        onChange={(e) => handleChange("task_type", e.target.value)}
        className={selectClass}
      >
        <option value="">All Types</option>
        {["CALL", "MEETING", "DEMO", "PROPOSAL", "QUOTE", "FOLLOW_UP", "EMAIL", "RESEARCH", "NEGOTIATION", "CONTRACT_REVIEW", "INTERNAL_REVIEW", "CLOSING", "OTHER"].map((t) => (
          <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
        ))}
      </select>

      {/* Due Date Range */}
      <input
        type="date"
        value={filters.due_date_gte || ""}
        onChange={(e) => handleChange("due_date_gte", e.target.value)}
        placeholder="From"
        className={cn(selectClass, "w-28")}
      />
      <input
        type="date"
        value={filters.due_date_lte || ""}
        onChange={(e) => handleChange("due_date_lte", e.target.value)}
        placeholder="To"
        className={cn(selectClass, "w-28")}
      />

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={() => clearFilters()}
          className="flex items-center gap-1 px-2 py-1.5 rounded bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white text-[9px] uppercase tracking-wider transition-all"
        >
          <X size={10} /> Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
