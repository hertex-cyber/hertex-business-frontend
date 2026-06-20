import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, User, Tag, Clock, DollarSign, FileText, Loader2, CheckCircle, PlayCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesTask } from "../hooks/useSalesTasks";
import { updateSalesTask, startSalesTask, completeSalesTask, blockSalesTask, fetchTimeLogs } from "../services/salesTaskService";
import TimeTrackingWidget from "./TimeTrackingWidget";

const STATUS_STYLES = {
  BACKLOG: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  TODO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  IN_REVIEW: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DONE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  BLOCKED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const PRIORITY_STYLES = {
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
      <Icon size={12} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] text-white/30 mb-0.5 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white truncate">{value || "—"}</p>
    </div>
  </div>
);

const TaskDetailDialog = ({ isOpen, onClose, taskId, onUpdate }) => {
  const { task, loading, refetch } = useSalesTask(taskId);
  const [isSaving, setIsSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [timeLogs, setTimeLogs] = useState([]);

  // Fetch time logs when task loads
  useEffect(() => {
    if (taskId) {
      fetchTimeLogs({ task: taskId })
        .then((res) => setTimeLogs(res.data.results || res.data || []))
        .catch(() => setTimeLogs([]));
    }
  }, [taskId]);

  useEffect(() => {
    if (task) setEditTitle(task.title || "");
  }, [task]);

  if (!isOpen || !taskId) return null;

  const handleAction = async (action) => {
    setIsSaving(true);
    try {
      if (action === "start") await startSalesTask(taskId);
      else if (action === "complete") await completeSalesTask(taskId);
      else if (action === "block") {
        const reason = prompt("Block reason:");
        if (reason) await blockSalesTask(taskId, reason);
      }
      await refetch();
      onUpdate?.();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateField = async (field, value) => {
    try {
      await updateSalesTask(taskId, { [field]: value });
      await refetch();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-900 bg-white/[0.01] shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {loading ? (
                <Loader2 size={20} className="animate-spin text-white/20" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg shrink-0">
                    {task?.title?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                  <div>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => editTitle !== task?.title && handleUpdateField("title", editTitle)}
                      className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-blue-500/50 outline-none text-base font-semibold text-white uppercase tracking-wider min-w-[200px] transition-colors"
                    />
                    <div className="flex items-center gap-2 mt-1.5">
                      {task?.status && (
                        <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", STATUS_STYLES[task.status])}>
                          {task.status}
                        </span>
                      )}
                      {task?.priority && (
                        <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", PRIORITY_STYLES[task.priority])}>
                          {task.priority}
                        </span>
                      )}
                      {task?.task_type && (
                        <span className="text-[9px] px-2 py-0.5 rounded-sm border border-zinc-800 bg-zinc-950 text-white/40 uppercase tracking-wider">
                          {task.task_type}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-white/20" />
            </div>
          ) : !task ? (
            <div className="text-center py-16 text-white/30">Task not found</div>
          ) : (
            <div className="space-y-6">
              {/* Details */}
              <div className="space-y-1">
                <Field icon={User} label="Assigned To" value={task.assigned_to_details ? `${task.assigned_to_details.first_name || ""} ${task.assigned_to_details.last_name || ""}`.trim() || task.assigned_to_details.email : "Unassigned"} />
                <Field icon={Calendar} label="Due Date" value={task.due_date} />
                <Field icon={DollarSign} label="Revenue Impact" value={task.revenue_impact ? `₹${task.revenue_impact.toLocaleString?.("en-IN") || task.revenue_impact}` : "—"} />
                <Field icon={Clock} label="Started At" value={task.started_at ? new Date(task.started_at).toLocaleString() : "—"} />
                <Field icon={CheckCircle} label="Completed At" value={task.completed_at ? new Date(task.completed_at).toLocaleString() : "—"} />
                <Field icon={Clock} label="Est. Hours" value={task.estimated_hours ? `${task.estimated_hours}h` : "—"} />
                <Field icon={Clock} label="Actual Hours" value={task.actual_hours ? `${task.actual_hours}h` : "—"} />
              </div>

              {/* Description */}
              {task.description && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={14} className="text-amber-400" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Description</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.01] border border-zinc-900">
                    <p className="text-xs text-white/50 leading-relaxed">{task.description}</p>
                  </div>
                </div>
              )}

              {/* Time Tracking Widget */}
              <TimeTrackingWidget
                taskId={taskId}
                timeLogs={timeLogs}
                onSuccess={() => {
                  fetchTimeLogs({ task: taskId })
                    .then((res) => setTimeLogs(res.data.results || res.data || []))
                    .catch(() => {});
                }}
              />

              {/* Activity Logs */}
              {task.activity_logs?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-purple-400" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Activity Log</p>
                  </div>
                  <div className="space-y-2">
                    {task.activity_logs.slice(0, 10).map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-white/[0.01] border border-zinc-900">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/70 font-medium">{log.description}</span>
                          <span className="text-[8px] text-white/30 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-4 border-t border-zinc-900 bg-white/[0.005] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {task && task.status !== "DONE" && task.status !== "CANCELLED" && (
              <>
                {task.status === "TODO" && (
                  <button
                    onClick={() => handleAction("start")}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 text-[10px] font-semibold uppercase tracking-wider"
                  >
                    <PlayCircle size={12} /> Start
                  </button>
                )}
                {task.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleAction("complete")}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 text-[10px] font-semibold uppercase tracking-wider"
                  >
                    <CheckCircle size={12} /> Complete
                  </button>
                )}
                <button
                  onClick={() => handleAction("block")}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50 text-[10px] font-semibold uppercase tracking-wider"
                >
                  <AlertCircle size={12} /> Block
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white text-[10px] font-semibold uppercase tracking-wider transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskDetailDialog;
