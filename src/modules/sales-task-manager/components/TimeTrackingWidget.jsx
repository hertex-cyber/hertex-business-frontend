import React, { useState, useCallback } from "react";
import { Clock, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTimeLog } from "../services/salesTaskService";
import { formatDate, formatHours } from "../utils/salesTaskUtils";

/**
 * TimeTrackingWidget — Quick time log entry
 * As documented in Section 7.1 of SALES_TASK_MANAGER_MODULE.md
 *
 * Props:
 *   taskId    — task ID to log time against
 *   timeLogs  — existing time logs array
 *   onSuccess — callback after successful log
 */
const TimeTrackingWidget = ({ taskId, timeLogs = [], onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hours: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleLog = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.hours || !formData.date) return;
    setIsSaving(true);
    try {
      await createTimeLog({
        task: taskId,
        hours: parseFloat(formData.hours),
        date: formData.date,
        description: formData.description,
      });
      setFormData({ hours: "", date: new Date().toISOString().split("T")[0], description: "" });
      setShowForm(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to log time:", err);
    } finally {
      setIsSaving(false);
    }
  }, [formData, taskId, onSuccess]);

  const totalLogged = timeLogs.reduce((sum, log) => sum + (parseFloat(log.hours) || 0), 0);

  return (
    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-amber-400" />
          <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Time Tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white font-mono">{formatHours(totalLogged)}</span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-[9px] font-semibold uppercase tracking-wider transition-all"
          >
            <Plus size={10} /> Log Time
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleLog} className="mb-3 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[8px] text-white/30 uppercase tracking-wider">Hours *</label>
              <input
                required
                type="number"
                step="0.25"
                min="0.25"
                value={formData.hours}
                onChange={(e) => handleChange("hours", e.target.value)}
                placeholder="e.g., 2.5"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-white/30 uppercase tracking-wider">Date *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-white/30 uppercase tracking-wider">Description</label>
              <input
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="What did you do?"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white placeholder-white/20 outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 text-[9px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1"
            >
              {isSaving ? <Loader2 size={8} className="animate-spin" /> : <Plus size={8} />}
              Log
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 rounded bg-zinc-900/50 border border-zinc-800 text-white/30 hover:text-white text-[9px] font-semibold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Recent Logs */}
      {timeLogs.length > 0 && (
        <div className="space-y-1.5">
          {timeLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-zinc-800 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-white/30 font-mono">{formatDate(log.date)}</span>
                {log.description && (
                  <span className="text-[9px] text-white/40 truncate max-w-[200px]">{log.description}</span>
                )}
              </div>
              <span className="text-[10px] font-bold text-amber-400 font-mono">{log.hours}h</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeTrackingWidget;
