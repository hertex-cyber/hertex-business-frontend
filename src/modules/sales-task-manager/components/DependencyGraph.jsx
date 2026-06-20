import React from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_STYLES, formatDate } from "../utils/salesTaskUtils";

/**
 * DependencyGraph — Task dependency visualization
 * As documented in Section 7.1 of SALES_TASK_MANAGER_MODULE.md
 * Shows a simple node-based dependency chain
 *
 * Props:
 *   tasks       — array of task objects with dependencies
 *   dependencies — array of { task, depends_on, dependency_type }
 */
const DependencyGraph = ({ tasks = [], dependencies = [] }) => {
  if (!tasks.length || !dependencies.length) {
    return (
      <div className="p-8 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
        <AlertCircle size={24} className="text-white/10 mx-auto mb-2" />
        <p className="text-sm text-white/30">No dependencies configured</p>
        <p className="text-[10px] text-white/20 mt-1">Add task dependencies to see the dependency graph</p>
      </div>
    );
  }

  const taskMap = {};
  tasks.forEach((t) => { taskMap[t.id] = t; });

  // Build adjacency: task → [depends_on tasks]
  const adjacency = {};
  dependencies.forEach((dep) => {
    if (!adjacency[dep.task]) adjacency[dep.task] = [];
    adjacency[dep.task].push(dep);
  });

  // Find root tasks (no incoming dependencies)
  const hasDependency = new Set(dependencies.map((d) => d.task));
  const roots = tasks.filter((t) => !hasDependency.has(t.id));

  // Build chains
  const buildChain = (taskId, visited = new Set()) => {
    if (visited.has(taskId)) return [{ id: taskId, task: taskMap[taskId], circular: true }];
    visited.add(taskId);

    const deps = adjacency[taskId] || [];
    const node = {
      id: taskId,
      task: taskMap[taskId],
      children: deps.map((dep) => ({
        type: dep.dependency_type,
        ...buildChain(dep.depends_on, new Set(visited)),
      })).flat(),
    };
    return [node];
  };

  const chains = roots.map((r) => buildChain(r.id)).flat();

  // Flatten for rendering
  const renderNode = (node, depth = 0) => {
    const task = node.task;
    if (!task) return null;

    return (
      <div key={`${node.id}-${depth}`} className="flex flex-col items-center">
        <div className={cn(
          "px-4 py-3 rounded-lg border transition-all",
          task.status === "DONE"
            ? "bg-emerald-500/10 border-emerald-500/30"
            : task.status === "BLOCKED"
              ? "bg-red-500/10 border-red-500/30"
              : "bg-zinc-900/40 border-zinc-800"
        )}>
          <p className="text-xs font-medium text-white text-center max-w-[160px] truncate">{task.title}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-sm border font-semibold uppercase", STATUS_STYLES[task.status])}>
              {task.status}
            </span>
            {task.due_date && (
              <span className="text-[8px] text-white/30 font-mono">{formatDate(task.due_date)}</span>
            )}
          </div>
        </div>

        {/* Children (depends_on) */}
        {node.children.length > 0 && (
          <>
            <div className="flex flex-col items-center my-2">
              <ArrowRight size={12} className="text-white/20 rotate-90" />
              <span className="text-[7px] text-white/20 uppercase tracking-wider">depends on</span>
            </div>
            <div className="flex gap-4">
              {node.children.map((child, idx) => renderNode(child, depth + 1))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <div className="flex gap-8 min-w-max pb-4">
        {chains.map((chain, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {renderNode(chain)}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-3 mt-4 border-t border-zinc-800">
        {[
          { color: "bg-emerald-500/10 border-emerald-500/30", label: "Done" },
          { color: "bg-zinc-900/40 border-zinc-800", label: "Active" },
          { color: "bg-red-500/10 border-red-500/30", label: "Blocked" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-2 rounded-sm border ${item.color}`} />
            <span className="text-[8px] text-white/30 uppercase">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DependencyGraph;
