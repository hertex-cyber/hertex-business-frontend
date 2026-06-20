import React from "react";
import { cn } from "@/lib/utils";

/**
 * WeightedProgressIndicator — Circular or linear progress with ₹ weight
 *
 * Props:
 *   value       — progress percentage (0-100)
 *   revenue     — revenue amount displayed in center
 *   achieved    — achieved amount
 *   target      — target amount
 *   variant     — "circular" | "linear"
 *   size        — "sm" | "md" | "lg"
 *   className   — extra classes
 */
const WeightedProgressIndicator = ({
  value = 0,
  revenue = null,
  achieved = null,
  target = null,
  variant = "circular",
  size = "md",
  className,
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);

  const getColor = (pct) => {
    if (pct >= 100) return "text-purple-400";
    if (pct >= 80) return "text-emerald-400";
    if (pct >= 50) return "text-amber-400";
    return "text-red-400";
  };

  const getBarColor = (pct) => {
    if (pct >= 100) return "bg-purple-500";
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const formatRevenue = (val) => {
    if (val == null) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
  };

  if (variant === "circular") {
    const sizes = { sm: 48, md: 72, lg: 96 };
    const s = sizes[size] || sizes.md;
    const strokeWidth = size === "sm" ? 3 : size === "lg" ? 5 : 4;
    const radius = (s - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <svg width={s} height={s} className="-rotate-90">
          <circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-800"
          />
          <circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-700", getBarColor(clamped).replace("bg-", "text-"))}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className={cn("font-bold font-mono leading-none", getColor(clamped), {
            "text-[10px]": size === "sm",
            "text-sm": size === "md",
            "text-lg": size === "lg",
          })}>
            {Math.round(clamped)}%
          </p>
          {(revenue != null || achieved != null) && (
            <p className="text-[8px] text-white/30 font-mono mt-0.5">
              {formatRevenue(revenue || achieved)}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Linear variant
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {target != null && achieved != null && (
          <p className="text-xs text-white/50 font-mono">
            {formatRevenue(achieved)} / {formatRevenue(target)}
          </p>
        )}
        <p className={cn("text-xs font-bold font-mono", getColor(clamped))}>
          {Math.round(clamped)}%
        </p>
      </div>
      <div className={cn("rounded-full bg-zinc-800 overflow-hidden", {
        "h-1.5": size === "sm",
        "h-2.5": size === "md",
        "h-3.5": size === "lg",
      })}>
        <div
          className={cn("h-full rounded-full transition-all duration-700", getBarColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default WeightedProgressIndicator;
