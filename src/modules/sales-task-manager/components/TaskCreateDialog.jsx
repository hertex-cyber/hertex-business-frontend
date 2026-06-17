import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createSalesTask } from "../services/salesTaskService";

/**
 * TaskCreateDialog — Quick task creation modal
 * Extracted from TaskBoard for reuse
 *
 * Props:
 *   isOpen      — whether dialog is visible
 *   onClose     — callback to close dialog
 *   programmes  — array of { id, name } for programme picker
 *   onCreate    — callback after successful creation
 */
const TaskCreateDialog = ({ isOpen, onClose, programmes = [], onCreate }) => {
  const [formData, setFormData] = useState({
    programme: "",
    title: "",
    task_type: "OTHER",
    priority: "MEDIUM",
    due_date: "",
    revenue_impact: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.programme || !formData.title) return;
    setIsCreating(true);
    try {
      await createSalesTask({
        programme: formData.programme,
        title: formData.title,
        task_type: formData.task_type,
        priority: formData.priority,
        due_date: formData.due_date || null,
        revenue_impact: parseFloat(formData.revenue_impact) || 0,
      });
      setFormData({ programme: "", title: "", task_type: "OTHER", priority: "MEDIUM", due_date: "", revenue_impact: "" });
      onCreate?.();
      onClose?.();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsCreating(false);
    }
  }, [formData, onCreate, onClose]);

  if (!isOpen) return null;

  const inputClass =
    "w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/50";

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Create New Task</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Programme *</label>
            <select
              required
              value={formData.programme}
              onChange={(e) => handleChange("programme", e.target.value)}
              className={inputClass}
            >
              <option value="">Select Programme</option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Task Title *</label>
            <input
              required
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Call Acme Corp VP Engineering"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Type</label>
              <select
                value={formData.task_type}
                onChange={(e) => handleChange("task_type", e.target.value)}
                className={inputClass}
              >
                {["CALL", "MEETING", "DEMO", "PROPOSAL", "QUOTE", "FOLLOW_UP", "EMAIL", "RESEARCH", "NEGOTIATION", "CONTRACT_REVIEW", "INTERNAL_REVIEW", "CLOSING", "OTHER"].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className={inputClass}
              >
                {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Revenue Impact (₹)</label>
            <input
              type="number"
              value={formData.revenue_impact}
              onChange={(e) => handleChange("revenue_impact", e.target.value)}
              placeholder="Estimated revenue impact"
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              {isCreating ? <Loader2 size={12} className="animate-spin" /> : null}
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white text-[10px] font-semibold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TaskCreateDialog;
