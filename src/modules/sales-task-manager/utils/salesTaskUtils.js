/**
 * Sales Task Manager Utility Helpers
 * Shared formatting, styling, and helper functions
 */

// ── Currency Formatting ─────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupee (₹) with locale formatting
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `₹${num.toLocaleString("en-IN")}`;
};

/**
 * Format a number as a compact currency (e.g., ₹1.2Cr, ₹50L)
 */
export const formatCurrencyCompact = (value) => {
  if (!value && value !== 0) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};

/**
 * Format a decimal as a percentage
 */
export const formatPercent = (value) => {
  if (!value && value !== 0) return "0%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${Math.round(num)}%`;
};

/**
 * Format hours (e.g., 2.5 → "2h 30m")
 */
export const formatHours = (hours) => {
  if (!hours && hours !== 0) return "—";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Format a date string for display
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/**
 * Get relative time description (today, tomorrow, overdue, etc.)
 */
export const getRelativeDate = (dateStr) => {
  if (!dateStr) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  return `In ${diffDays} days`;
};

// ── Theme / Styling Maps ───────────────────────────────────────────────────

export const STATUS_STYLES = {
  BACKLOG: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  TODO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  IN_REVIEW: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DONE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  BLOCKED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export const PRIORITY_STYLES = {
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export const CYCLE_STATUS_STYLES = {
  DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ARCHIVED: "bg-white/5 text-white/30 border-white/10",
};

export const TARGET_STATUS_STYLES = {
  NOT_STARTED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ACHIEVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  EXCEEDED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  MISSED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const PROGRAMME_STATUS_STYLES = {
  PLANNING: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ON_HOLD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const MILESTONE_STATUS_STYLES = {
  PENDING: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ACHIEVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MISSED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const HEALTH_STYLES = {
  on_track: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  at_risk: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  behind: "text-red-400 bg-red-500/10 border-red-500/20",
};

export const TASK_TYPE_LABELS = {
  CALL: "Call",
  MEETING: "Meeting",
  DEMO: "Demo",
  PROPOSAL: "Proposal",
  QUOTE: "Quote",
  FOLLOW_UP: "Follow Up",
  EMAIL: "Email",
  RESEARCH: "Research",
  NEGOTIATION: "Negotiation",
  CONTRACT_REVIEW: "Contract Review",
  INTERNAL_REVIEW: "Internal Review",
  CLOSING: "Closing",
  OTHER: "Other",
};

// ── Helper Functions ──────────────────────────────────────────────────────

/**
 * Calculate attainment percentage safely
 */
export const calcAttainment = (achieved, target) => {
  if (!target) return 0;
  return Math.min(Math.round((achieved || 0) / target * 100), 100);
};

/**
 * Get the health status (on_track, at_risk, behind) based on a percentage
 */
export const getHealthStatus = (pct) => {
  if (pct >= 80) return "on_track";
  if (pct >= 50) return "at_risk";
  return "behind";
};

/**
 * Get the health label for display
 */
export const getHealthLabel = (status) => {
  const labels = {
    on_track: "On Track",
    at_risk: "At Risk",
    behind: "Behind",
  };
  return labels[status] || status;
};

/**
 * Extract user full name from user object
 */
export const getUserName = (user) => {
  if (!user) return "Unassigned";
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return name || user.email || "Unassigned";
};

/**
 * Build a URL search params string from an object
 */
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.set(key, value);
    }
  });
  return searchParams.toString();
};
