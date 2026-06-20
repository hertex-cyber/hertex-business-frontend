import React from "react";
import { GanttChartSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ProgrammeGantt — Gantt chart timeline component
 * Extracted from SalesProgrammeDetail for reuse
 *
 * Props:
 *   ganttData   — { tasks: [...], milestones: [...] }
 *   loading     — boolean
 */
const ProgrammeGantt = ({ ganttData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!ganttData || (!ganttData.tasks?.length && !ganttData.milestones?.length)) {
    return (
      <div className="p-8 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
        <GanttChartSquare size={32} className="text-white/10 mx-auto mb-2" />
        <p className="text-sm text-white/30">No data available for Gantt view</p>
      </div>
    );
  }

  const allDates = [
    ...ganttData.tasks.map((t) => t.due_date).filter(Boolean),
    ...ganttData.milestones.map((m) => m.target_date),
  ].sort();

  const startDate = allDates.length > 0 ? new Date(allDates[0]) : new Date();
  const endDate = allDates.length > 1 ? new Date(allDates[allDates.length - 1]) : new Date(Date.now() + 90 * 86400000);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 86400)) || 1;
  const weeks = Math.ceil(daysDiff / 7);

  const formatDateShort = (d) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const getTaskPosition = (dueDate) => {
    if (!dueDate) return { left: 0, width: 0 };
    const d = new Date(dueDate);
    const diff = (d - startDate) / (1000 * 86400);
    const left = (diff / daysDiff) * 100;
    return { left: Math.max(0, left), width: 8 };
  };

  const getMilestonePosition = (targetDate) => {
    if (!targetDate) return 0;
    const d = new Date(targetDate);
    const diff = (d - startDate) / (1000 * 86400);
    return Math.max(0, (diff / daysDiff) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Timeline View</h2>
        <p className="text-[10px] text-white/30 font-mono">
          {formatDateShort(startDate)} — {formatDateShort(endDate)} ({daysDiff} days)
        </p>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] space-y-3">
          {/* Week Headers */}
          <div className="flex border-b border-zinc-800 pb-2">
            <div className="w-48 shrink-0" />
            <div className="flex-1 flex">
              {Array.from({ length: Math.min(weeks, 26) }).map((_, i) => {
                const weekDate = new Date(startDate);
                weekDate.setDate(weekDate.getDate() + i * 7);
                return (
                  <div key={i} className="flex-1 text-[8px] text-white/20 font-mono text-center">
                    {formatDateShort(weekDate)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestones */}
          {ganttData.milestones?.length > 0 && (
            <div>
              <p className="text-[9px] text-purple-400 uppercase tracking-wider font-semibold mb-2">Milestones</p>
              <div className="relative h-8 mb-4">
                {ganttData.milestones.map((ms) => {
                  const pos = getMilestonePosition(ms.target_date);
                  return (
                    <div
                      key={ms.id}
                      className="absolute top-0 flex flex-col items-center"
                      style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
                    >
                      <div className={cn("w-3 h-3 rounded-full border-2", {
                        "bg-emerald-400 border-emerald-400": ms.status === "ACHIEVED",
                        "bg-amber-400 border-amber-400": ms.status === "IN_PROGRESS",
                        "bg-red-400 border-red-400": ms.status === "MISSED",
                        "bg-zinc-500 border-zinc-500": ms.status === "PENDING",
                      })} />
                      <p className="text-[7px] text-white/30 mt-1 whitespace-nowrap">{ms.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tasks */}
          {ganttData.tasks?.length > 0 && (
            <div>
              <p className="text-[9px] text-blue-400 uppercase tracking-wider font-semibold mb-2">Tasks</p>
              {ganttData.tasks.map((task) => {
                const { left, width } = getTaskPosition(task.due_date);
                return (
                  <div key={task.id} className="flex items-center mb-1.5 group">
                    <div className="w-48 shrink-0 flex items-center gap-2 pr-3">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", {
                        "bg-red-400": task.priority === "CRITICAL",
                        "bg-orange-400": task.priority === "HIGH",
                        "bg-amber-400": task.priority === "MEDIUM",
                        "bg-emerald-400": task.priority === "LOW",
                      })} />
                      <p className="text-[10px] text-white/70 truncate">{task.title}</p>
                    </div>
                    <div className="flex-1 relative h-6">
                      <div className="absolute inset-0 border-l border-zinc-800" />
                      <div
                        className={cn("absolute top-1 h-4 rounded-sm opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer", {
                          "bg-emerald-500/50": task.status === "DONE",
                          "bg-amber-500/50": task.status === "IN_PROGRESS",
                          "bg-blue-500/50": task.status === "TODO",
                          "bg-red-500/50": task.status === "BLOCKED",
                          "bg-zinc-500/30": task.status === "BACKLOG" || task.status === "CANCELLED",
                        })}
                        style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%` }}
                        title={`${task.title} — ${task.assignee}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
        {[
          { color: "bg-emerald-500/50", label: "Done" },
          { color: "bg-amber-500/50", label: "In Progress" },
          { color: "bg-blue-500/50", label: "To Do" },
          { color: "bg-red-500/50", label: "Blocked" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-2 rounded-sm ${item.color}`} />
            <span className="text-[8px] text-white/30 uppercase">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgrammeGantt;
