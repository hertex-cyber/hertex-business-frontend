import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { createSalesProgramme, updateSalesProgramme } from "../services/salesTaskService";

/**
 * SalesProgrammeForm — Create/edit programme form
 * As documented in Section 7.1 of SALES_TASK_MANAGER_MODULE.md
 *
 * Props:
 *   isOpen      — whether dialog is visible
 *   onClose     — callback to close dialog
 *   cycleId     — target cycle ID
 *   programme   — existing programme data (for edit mode), null for create
 *   onSuccess   — callback after successful save
 */
const SalesProgrammeForm = ({ isOpen, onClose, cycleId, programme = null, onSuccess }) => {
  const isEdit = !!programme;

  const [formData, setFormData] = useState({
    name: programme?.name || "",
    description: programme?.description || "",
    start_date: programme?.start_date || "",
    end_date: programme?.end_date || "",
    priority: programme?.priority || "MEDIUM",
    target_revenue: programme?.target_revenue || "",
    programme_manager: programme?.programme_manager || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        target_cycle: cycleId,
        target_revenue: parseFloat(formData.target_revenue) || 0,
        programme_manager: formData.programme_manager || null,
      };
      if (isEdit) {
        await updateSalesProgramme(programme.id, payload);
      } else {
        await createSalesProgramme(payload);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Failed to save programme:", err);
    } finally {
      setIsSaving(false);
    }
  }, [formData, cycleId, isEdit, programme, onSuccess, onClose]);

  if (!isOpen) return null;

  const inputClass =
    "w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/50";

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            {isEdit ? "Edit Programme" : "New Programme"}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Programme Name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Enterprise Expansion Q1"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the programme..."
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Start Date *</label>
              <input
                required
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">End Date *</label>
              <input
                required
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Target Revenue (₹)</label>
              <input
                type="number"
                value={formData.target_revenue}
                onChange={(e) => handleChange("target_revenue", e.target.value)}
                placeholder="e.g., 4000000"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : null}
              {isEdit ? "Update Programme" : "Create Programme"}
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

export default SalesProgrammeForm;
