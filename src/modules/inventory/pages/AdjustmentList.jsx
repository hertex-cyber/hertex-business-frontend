import React, { useState, useMemo, useEffect } from "react";import { Scale, Search, Plus, X, ChevronDown, Download,
  CheckCircle, XCircle, Send, Ban, FileDown, Loader2,
  History, ClipboardList, Activity, FileText, ArrowUpDown,
} from "lucide-react";
import { useAdjustments, useAdjustmentActions, useAdjustmentReasons } from "../hooks/useAdjustments";
import { useItems } from "../hooks/useItems";
import { useLocations } from "../hooks/useLocations";
import { fetchAdjustmentHistory } from "../services/adjustmentService";

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  PENDING_APPROVAL: { label: "Pending", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  APPROVED: { label: "Approved", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  REJECTED: { label: "Rejected", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  APPLIED: { label: "Applied", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const ACTION_LABELS = {
  CREATED: "Adjustment Created",
  UPDATED: "Adjustment Updated",
  SUBMITTED: "Submitted for Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  APPLIED: "Applied",
  CANCELLED: "Cancelled",
};

// ============================================================================
// ADJUSTMENT FORM MODAL
// ============================================================================

const AdjustmentForm = ({ isOpen, onClose, locations, items, reasons, onSubmit, onEdit, editAdjustment, loading }) => {
  const isEdit = !!editAdjustment;
  const [form, setForm] = useState({
    location: "",
    reason: "",
    adjustment_date: new Date().toISOString().split("T")[0],
    remarks: "",
    items: [{ item_id: "", adjustment_quantity: "", unit: "", remarks: "" }],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editAdjustment) {
      const ed = editAdjustment;
      setForm({
        location: ed.location || "",
        reason: ed.reason || "",
        adjustment_date: ed.adjustment_date || new Date().toISOString().split("T")[0],
        remarks: ed.remarks || "",
        items: (ed.items || []).length > 0
          ? (ed.items || []).map((i) => ({
              item_id: i.item || i.item_id || "",
              adjustment_quantity: String(Math.abs(Number(i.adjustment_quantity) || 0)),
              unit: i.unit || "",
              remarks: i.remarks || "",
            }))
          : [{ item_id: "", adjustment_quantity: "", unit: "", remarks: "" }],
      });
    } else {
      setForm({
        location: "",
        reason: "",
        adjustment_date: new Date().toISOString().split("T")[0],
        remarks: "",
        items: [{ item_id: "", adjustment_quantity: "", unit: "", remarks: "" }],
      });
    }
    setError("");
  }, [editAdjustment, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { item_id: "", adjustment_quantity: "", unit: "", remarks: "" }] }));
  };

  const handleRemoveItem = (idx) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm((f) => {
      const newItems = [...f.items];
      newItems[idx] = { ...newItems[idx], [field]: value };
      return { ...f, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.location) {
      setError("Please select a location.");
      return;
    }
    if (!form.reason) {
      setError("Please select an adjustment reason.");
      return;
    }
    if (form.items.length === 0 || !form.items[0].item_id) {
      setError("Please add at least one item.");
      return;
    }

    const payload = {
      location: form.location,
      reason: form.reason,
      adjustment_date: form.adjustment_date,
      remarks: form.remarks,
      items: form.items
        .filter((i) => i.item_id && i.adjustment_quantity)
        .map((i) => ({
          item_id: i.item_id,
          adjustment_quantity: Number(i.adjustment_quantity),
          unit: i.unit || undefined,
          remarks: i.remarks || "",
        })),
    };

    if (isEdit) {
      const result = await onEdit(editAdjustment.id, payload);
      if (result.success) onClose();
      else setError(result.error || "Failed to update adjustment.");
    } else {
      const result = await onSubmit(payload);
      if (result.success) onClose();
      else setError(result.error || "Failed to create adjustment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">{isEdit ? "Edit Adjustment" : "New Adjustment"}</h3>
            <p className="text-xs text-white/40 mt-0.5">
              {isEdit ? "Modify the draft adjustment" : "Correct stock levels with full audit trail"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Location + Reason Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Location</label>
              <select
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none"
              >
                <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Select location...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id} style={{ backgroundColor: "#1f2937", color: "#fff" }}>
                    {loc.location_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Reason</label>
              <select
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none"
              >
                <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Select reason...</option>
                {reasons.map((r) => (
                  <option key={r.id} value={r.id} style={{ backgroundColor: "#1f2937", color: "#fff" }}>
                    {r.reason_name} ({r.adjustment_type === "INCREASE" ? "+" : "-"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date"
                value={form.adjustment_date}
                onChange={(e) => setForm((f) => ({ ...f, adjustment_date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
              placeholder="Reason for adjustment..."
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Items</label>
              <button type="button" onClick={handleAddItem}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <select
                      value={item.item_id}
                      onChange={(e) => handleItemChange(idx, "item_id", e.target.value)}
                      className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 appearance-none"
                    >
                      <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Select item...</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id} style={{ backgroundColor: "#1f2937", color: "#fff" }}>
                          {i.item_code} — {i.item_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input type="number" min="0" step="0.01"
                      value={item.adjustment_quantity}
                      onChange={(e) => handleItemChange(idx, "adjustment_quantity", e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div className="col-span-4">
                    <input type="text"
                      value={item.remarks}
                      onChange={(e) => handleItemChange(idx, "remarks", e.target.value)}
                      placeholder="Item remarks"
                      className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(idx)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                        <X size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {isEdit ? "Update Adjustment" : "Create Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// ADJUSTMENT DETAIL MODAL (with History Tab)
// ============================================================================

const AdjustmentDetail = ({ adjustment, onClose, onAction, actions }) => {
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  if (!adjustment) return null;

  const config = STATUS_CONFIG[adjustment.status] || STATUS_CONFIG.DRAFT;
  const isDraft = adjustment.status === "DRAFT";
  const isPending = adjustment.status === "PENDING_APPROVAL";
  const isApproved = adjustment.status === "APPROVED";

  const handleAction = async (actionFn) => {
    setActionLoading(true);
    try {
      const result = await actionFn(adjustment.id, notes);
      if (result.success) {
        setNotes("");
        onClose();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const loadHistory = async () => {
    setActiveTab("history");
    if (history.length > 0) return;
    setHistoryLoading(true);
    try {
      const response = await fetchAdjustmentHistory(adjustment.id);
      setHistory(response.data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const items = adjustment.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Scale size={18} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{adjustment.adjustment_number}</h3>
              <p className="text-xs text-white/40">{adjustment.adjustment_date}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "details"
                ? "text-white border-white/50"
                : "text-white/30 border-transparent hover:text-white/50"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ClipboardList size={13} /> Details
            </div>
          </button>
          <button
            onClick={loadHistory}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "history"
                ? "text-white border-white/50"
                : "text-white/30 border-transparent hover:text-white/50"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <History size={13} /> History
            </div>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "details" && (
            <>
              {/* Status + Type */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-white/30">
                  Type: {adjustment.adjustment_type === "INCREASE" ? "Stock Increase" : "Stock Decrease"}
                </span>
              </div>

              {/* Location + Reason */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Location</p>
                  <p className="text-sm font-semibold text-white">{adjustment.location_name || adjustment.location?.location_name}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Reason</p>
                  <p className="text-sm font-semibold text-white">{adjustment.reason_name || adjustment.reason?.reason_name}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Items ({items.length})</p>
                <div className="overflow-hidden rounded-xl border border-white/5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="text-left px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Item</th>
                        <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Available</th>
                        <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Adjustment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {items.map((item, idx) => {
                        const isIncrease = item.adjustment_quantity > 0 || adjustment.adjustment_type === "INCREASE";
                        return (
                          <tr key={item.id || idx} className="hover:bg-white/5">
                            <td className="px-3 py-2.5">
                              <p className="text-sm font-medium text-white">{item.item_name || item.item?.item_name}</p>
                              <p className="text-[10px] text-white/30">{item.item_code || item.item?.item_code}</p>
                            </td>
                            <td className="px-3 py-2.5 text-right text-sm text-white/60">
                              {item.available_quantity || "-"}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className={`text-sm font-bold ${isIncrease ? "text-emerald-400" : "text-red-400"}`}>
                                {isIncrease ? "+" : ""}{item.adjustment_quantity}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              {adjustment.remarks && (
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Remarks</p>
                  <p className="text-sm text-white/70">{adjustment.remarks}</p>
                </div>
              )}

              {/* Approval / Application Info */}
              {(adjustment.approved_by || adjustment.applied_by) && (
                <div className="grid grid-cols-2 gap-3">
                  {adjustment.approved_by && (
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Approved By</p>
                      <p className="text-xs text-white/70">{adjustment.approved_by_name || "N/A"}</p>
                    </div>
                  )}
                  {adjustment.applied_by && (
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Applied By</p>
                      <p className="text-xs text-white/70">{adjustment.applied_by_name || "N/A"}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Input (for approve/reject) */}
              {isPending && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
                    placeholder="Approval or rejection notes..."
                  />
                </div>
              )}

              {/* Workflow Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {isDraft && (
                  <>
                    <button onClick={() => handleAction(actions.submitAdjustment)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <Send size={13} /> Submit for Approval
                    </button>
                    <button onClick={() => handleAction(actions.cancelAdjustment)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <Ban size={13} /> Cancel
                    </button>
                  </>
                )}
                {isPending && (
                  <>
                    <button onClick={() => handleAction(actions.approveAdjustment)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={() => handleAction(actions.rejectAdjustment)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
                {isApproved && (
                  <button onClick={() => handleAction(actions.applyAdjustment)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                    <Activity size={13} /> Apply Adjustment
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === "history" && (
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Audit Trail</p>
              {historyLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={18} className="animate-spin text-white/30" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <History size={28} className="text-white/10 mb-2" />
                  <p className="text-sm text-white/30">No history entries yet</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/5"></div>
                  <div className="space-y-0">
                    {history.map((entry, idx) => (
                      <div key={entry.id || idx} className="flex gap-4 pb-5 last:pb-0 relative">
                        <div className="relative z-10 shrink-0 mt-1">
                          <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center border ${
                            entry.action === "CREATED" || entry.action === "SUBMITTED" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                            entry.action === "APPROVED" || entry.action === "APPLIED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            entry.action === "REJECTED" || entry.action === "CANCELLED" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            entry.action === "UPDATED" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                            "bg-white/5 border-white/10 text-white/40"
                          }`}>
                            {entry.action === "CREATED" || entry.action === "SUBMITTED" ? <Send size={12} /> :
                             entry.action === "APPROVED" ? <CheckCircle size={12} /> :
                             entry.action === "APPLIED" ? <Activity size={12} /> :
                             entry.action === "REJECTED" || entry.action === "CANCELLED" ? <XCircle size={12} /> :
                             entry.action === "UPDATED" ? <FileText size={12} /> :
                             <Scale size={12} />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white">
                              {ACTION_LABELS[entry.action] || entry.action}
                            </p>
                            <span className="text-[10px] text-white/30 shrink-0">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {entry.performed_by_name && (
                            <p className="text-[11px] text-white/40 mt-0.5">
                              by {entry.performed_by_name}
                            </p>
                          )}
                          {entry.remarks && (
                            <p className="text-xs text-white/50 mt-1 italic">
                              "{entry.remarks}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN ADJUSTMENT LIST PAGE
// ============================================================================

const AdjustmentList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [editAdjustment, setEditAdjustment] = useState(null);

  const filters = useMemo(() => ({
    page,
    page_size: 25,
    search,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(typeFilter ? { adjustment_type: typeFilter } : {}),
  }), [page, search, statusFilter, typeFilter]);

  const { adjustments, count, loading, refetch } = useAdjustments(filters);
  const { items } = useItems({ page_size: 200 });
  const { locations } = useLocations({ page_size: 200 });
  const { reasons } = useAdjustmentReasons({ show_inactive: false });
  const actions = useAdjustmentActions();

  const handleCreate = async (data) => {
    const result = await actions.createAdjustment(data);
    if (result.success) {
      setShowForm(false);
      refetch();
    }
    return result;
  };

  const handleEdit = async (id, data) => {
    const result = await actions.updateAdjustment(id, data);
    if (result.success) {
      setEditAdjustment(null);
      refetch();
    }
    return result;
  };

  const handleAction = async (actionFn, id) => {
    const result = await actionFn(id);
    if (result.success) refetch();
    return result;
  };

  const totalPages = Math.ceil(count / 25);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Scale size={20} className="text-orange-400" />
            Stock Adjustments
          </h1>
          <p className="text-xs text-white/30 mt-0.5">Correct stock levels with full audit trail</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => actions.exportAdjustments({ export_format: "xlsx" })}
            className="px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
            <FileDown size={14} /> Export
          </button>
          <button onClick={() => { setEditAdjustment(null); setShowForm(true); }}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2">
            <Plus size={14} /> New Adjustment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 pb-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by adjustment number..."
            className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/20 appearance-none"
        >
          <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key} style={{ backgroundColor: "#1f2937", color: "#fff" }}>{cfg.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/20 appearance-none"
        >
          <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>All Types</option>
          <option value="INCREASE" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Increase</option>
          <option value="DECREASE" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Decrease</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 overflow-auto custom-scrollbar min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={20} className="animate-spin text-white/30" />
          </div>
        ) : adjustments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Scale size={32} className="text-white/10 mb-3" />
            <p className="text-sm font-medium text-white/30">No adjustments yet</p>
            <p className="text-xs text-white/20 mt-1">Create your first stock adjustment to get started.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold cursor-pointer hover:text-white/60">
                    <div className="flex items-center gap-1">Adj # <ArrowUpDown size={10} /></div>
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Location</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Reason</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Type</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Items</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {adjustments.map((a) => {
                  const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.DRAFT;
                  const isIncrease = a.adjustment_type === "INCREASE";
                  return (
                    <tr key={a.id} className="hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setSelectedAdjustment(a)}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-white">{a.adjustment_number}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{a.adjustment_date}</td>
                      <td className="px-4 py-3 text-sm text-white/80">{a.location_name || a.location?.location_name}</td>
                      <td className="px-4 py-3 text-sm text-white/80">{a.reason_name || a.reason?.reason_name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isIncrease ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                        }`}>
                          {isIncrease ? "+" : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-white/60">{a.item_count || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {a.status === "DRAFT" && (
                            <button onClick={(e) => { e.stopPropagation(); setEditAdjustment(a); setShowForm(true); }}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-400 hover:bg-blue-500/10 transition-colors uppercase tracking-wider">
                              Edit
                            </button>
                          )}
                          {a.status === "APPROVED" && (
                            <button onClick={(e) => { e.stopPropagation(); handleAction(actions.applyAdjustment, a.id).then(refetch); }}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                              <Activity size={11} /> Apply
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setSelectedAdjustment(a); }}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0">
          <p className="text-xs text-white/30">{count} adjustments</p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">
              Previous
            </button>
            <span className="text-xs text-white/50">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AdjustmentForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditAdjustment(null); }}
        locations={locations}
        items={items}
        reasons={reasons}
        editAdjustment={editAdjustment}
        onSubmit={handleCreate}
        onEdit={handleEdit}
        loading={actions.loading}
      />

      <AdjustmentDetail
        adjustment={selectedAdjustment}
        onClose={() => { setSelectedAdjustment(null); refetch(); }}
        onAction={handleAction}
        actions={actions}
      />
    </div>
  );
};

export default AdjustmentList;
