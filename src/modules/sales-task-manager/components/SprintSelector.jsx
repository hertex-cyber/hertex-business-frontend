import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SprintSelector — Sprint/week switcher
 * Allows users to navigate between sprints or weeks within a cycle
 *
 * Props:
 *   startDate      — cycle start date (ISO string)
 *   endDate        — cycle end date (ISO string)
 *   sprintDays     — sprint duration in days (default: 14)
 *   selectedStart  — currently selected sprint start
 *   selectedEnd    — currently selected sprint end
 *   onSelect       — callback(sprintStart, sprintEnd)
 *   className      — extra classes
 */
const SprintSelector = ({
  startDate,
  endDate,
  sprintDays = 14,
  selectedStart,
  selectedEnd,
  onSelect,
  className,
}) => {
  const sprints = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = [];
    let current = new Date(start);
    let idx = 1;

    while (current <= end) {
      const sprintEnd = new Date(current);
      sprintEnd.setDate(sprintEnd.getDate() + sprintDays);
      if (sprintEnd > end) sprintEnd.setTime(end.getTime());

      result.push({
        id: idx,
        label: `Sprint ${idx}`,
        start: new Date(current),
        end: new Date(sprintEnd),
      });

      current.setDate(current.getDate() + sprintDays);
      idx++;
    }
    return result;
  }, [startDate, endDate, sprintDays]);

  const currentIdx = sprints.findIndex(
    (s) => selectedStart && new Date(selectedStart).getTime() === s.start.getTime()
  );

  const [viewIdx, setViewIdx] = useState(
    currentIdx >= 0 ? currentIdx : 0
  );

  if (sprints.length === 0) return null;

  const current = sprints[viewIdx];

  const formatShort = (d) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const handlePrev = () => {
    const newIdx = Math.max(0, viewIdx - 1);
    setViewIdx(newIdx);
    onSelect?.(sprints[newIdx].start.toISOString().split("T")[0], sprints[newIdx].end.toISOString().split("T")[0]);
  };

  const handleNext = () => {
    const newIdx = Math.min(sprints.length - 1, viewIdx + 1);
    setViewIdx(newIdx);
    onSelect?.(sprints[newIdx].start.toISOString().split("T")[0], sprints[newIdx].end.toISOString().split("T")[0]);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Calendar size={12} className="text-white/30" />
      <button
        onClick={handlePrev}
        disabled={viewIdx === 0}
        className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition-all"
      >
        <ChevronLeft size={14} />
      </button>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
          {current.label}
        </span>
        <span className="text-[9px] text-white/30 font-mono">
          {formatShort(current.start)} — {formatShort(current.end)}
        </span>
      </div>
      <button
        onClick={handleNext}
        disabled={viewIdx === sprints.length - 1}
        className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition-all"
      >
        <ChevronRight size={14} />
      </button>
      <span className="text-[8px] text-white/20 font-mono">
        {viewIdx + 1}/{sprints.length}
      </span>
    </div>
  );
};

export default SprintSelector;
