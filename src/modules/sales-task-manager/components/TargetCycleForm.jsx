import React, { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createTargetCycle, updateTargetCycle } from "../services/salesTaskService";

/**
 * TargetCycleForm — Create/edit target cycle form
 * Extracted from TargetCycleList for reuse
 *
 * Props:
 *   cycle      — existing cycle data (for edit mode), null for create
 *   onSuccess  — callback after successful save
 *   onCancel   — callback to close form
 */
const TargetCycleForm = ({ cycle = null, onSuccess, onCancel }) => {
  const isEdit = !!cycle;

  const [formData, setFormData] = useState({
    name: cycle?.name || "",
    code: cycle?.code || "",
    cycle_type: cycle?.cycle_type || "QUARTERLY",
    start_date: cycle?.start_date || "",
    end_date: cycle?.end_date || "",
    total_revenue_target: cycle?.total_revenue_target || "",
    sprint_duration_days: cycle?.sprint_duration_days || 14,
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
        total_revenue_target: parseFloat(formData.total_revenue_target) || 0,
        sprint_duration_days: parseInt(formData.sprint_duration_days) || 14,
      };
      if (isEdit) {
        await updateTargetCycle(cycle.id, payload);
      } else {
        await createTargetCycle(payload);
      }
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save cycle:", err);
    } finally {
      setIsSaving(false);
    }
  }, [formData, isEdit, cycle, onSuccess]);

  const inputClass =
    "w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/50";

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-4">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
        {isEdit ? "Edit Target Cycle" : "New Target Cycle"}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Name</label>
          <input
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Q1 FY 2027"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Code</label>
          <input
            required
            value={formData.code}
            onChange={(e) => handleChange("code", e.target.value)}
            placeholder="e.g., Q1FY27"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Type</label>
          <select
            value={formData.cycle_type}
            onChange={(e) => handleChange("cycle_type", e.target.value)}
            className={inputClass}
          >
            <option value="ANNUAL">Annual</option>
            <option value="HALF_YEARLY">Half-Yearly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Sprint Duration (Days)</label>
          <input
            type="number"
            value={formData.sprint_duration_days}
            onChange={(e) => handleChange("sprint_duration_days", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Start Date</label>
          <input
            required
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">End Date</label>
          <input
            required
            type="date"
            value={formData.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Total Revenue Target (₹)</label>
          <input
            type="number"
            value={formData.total_revenue_target}
            onChange={(e) => handleChange("total_revenue_target", e.target.value)}
            placeholder="e.g., 50000000"
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
          {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          {isEdit ? "Update Cycle" : "Create Cycle"}
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

export default TargetCycleForm;
