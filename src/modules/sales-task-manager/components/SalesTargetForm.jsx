import React, { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { createSalesTarget, updateSalesTarget } from "../services/salesTaskService";

/**
 * SalesTargetForm — Create/edit sales target form
 * Extracted from TargetCycleDetail for reuse
 *
 * Props:
 *   cycleId     — the target cycle ID
 *   target      — existing target data (for edit mode), null for create
 *   onSuccess   — callback after successful save
 *   onCancel    — callback to close form
 */
const SalesTargetForm = ({ cycleId, target = null, onSuccess, onCancel }) => {
  const isEdit = !!target;

  const [formData, setFormData] = useState({
    assigned_user: target?.assigned_user || "",
    target_amount: target?.target_amount || "",
    new_business_target: target?.new_business_target || "",
    renewal_target: target?.renewal_target || "",
    upsell_target: target?.upsell_target || "",
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
        cycle: cycleId,
        assignee_type: "USER",
        assigned_user: formData.assigned_user || null,
        target_amount: parseFloat(formData.target_amount) || 0,
        new_business_target: parseFloat(formData.new_business_target) || 0,
        renewal_target: parseFloat(formData.renewal_target) || 0,
        upsell_target: parseFloat(formData.upsell_target) || 0,
      };
      if (isEdit) {
        await updateSalesTarget(target.id, payload);
      } else {
        await createSalesTarget(payload);
      }
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save target:", err);
    } finally {
      setIsSaving(false);
    }
  }, [formData, cycleId, isEdit, target, onSuccess]);

  const inputClass =
    "w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50";

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-4">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
        {isEdit ? "Edit Target" : "New Sales Target"}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Target Amount (₹)</label>
          <input
            required
            type="number"
            value={formData.target_amount}
            onChange={(e) => handleChange("target_amount", e.target.value)}
            placeholder="e.g., 2000000"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">New Business Target</label>
          <input
            type="number"
            value={formData.new_business_target}
            onChange={(e) => handleChange("new_business_target", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Renewal Target</label>
          <input
            type="number"
            value={formData.renewal_target}
            onChange={(e) => handleChange("renewal_target", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Upsell Target</label>
          <input
            type="number"
            value={formData.upsell_target}
            onChange={(e) => handleChange("upsell_target", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={12} className="animate-spin" /> : null}
          {isEdit ? "Update Target" : "Create Target"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white text-[10px] font-semibold uppercase tracking-wider transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SalesTargetForm;
