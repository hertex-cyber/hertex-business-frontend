import React from "react";
import { cn } from "@/lib/utils";

/**
 * ProgressBar — Reusable weighted progress bar component
 * Displays a horizontal bar with label and percentage
 *
 * Props:
 *   value       — current progress (0-100)
 *   label       — text label above the bar
 *   color       — bar color: "blue" | "emerald" | "amber" | "red" | "purple"
 *   size        — "sm" | "md" | "lg"
 *   showLabel   — show percentage text
 *   className   — extra classes
 */
const COLOR_MAP = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

const SIZE_MAP = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const ProgressBar = ({
  value = 0,
  label,
  color = "blue",
  size = "md",
  showLabel = true,
  className,
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  const barColor = COLOR_MAP[color] || COLOR_MAP.blue;
  const barSize = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showLabel) && (
        <div className="flex items-center justify-between">
          {label && (
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">
              {label}
            </p>
          )}
          {showLabel && (
            <p className="text-[10px] text-white/40 font-mono">{Math.round(clamped)}%</p>
          )}
        </div>
      )}
      <div className={cn("rounded-full bg-zinc-800 overflow-hidden", barSize)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
