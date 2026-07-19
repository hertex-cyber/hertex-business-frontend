import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, X, Download, CheckCircle, XCircle, Send, Ban, FileDown,
  Loader2, History, ClipboardList, ArrowUpDown, FileText, Activity,
  Eye, Barcode, Camera, ChevronDown, RefreshCw, Printer, Trash2,
  Save, Play, UserPlus,
} from "lucide-react";
import { useStockCounts, useStockCountActions, useStockCountReasons } from "../hooks/useStockCounts";
import { useItems } from "../hooks/useItems";
import { useLocations } from "../hooks/useLocations";
import { useUsers } from "../../admin/hooks/useUsers";
import { useCategories } from "../hooks/useCategories";
import { fetchStockCountHistory, fetchDifferenceSummary } from "../services/stockCountService";

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  ASSIGNED: { label: "Assigned", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  SUBMITTED: { label: "Submitted", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  APPROVED: { label: "Approved", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  COMPLETED: { label: "Completed", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const ACTION_LABELS = {
  CREATED: "Count Created", UPDATED: "Count Updated", ASSIGNED: "Counters Assigned",
  STARTED: "Counting Started", ITEM_COUNTED: "Item Counted", SUBMITTED: "Submitted",
  APPROVED: "Approved", COMPLETED: "Completed", CANCELLED: "Cancelled",
  ADJUSTMENT_GENERATED: "Adjustment Generated",
};

// ============================================================================
// CREATE/EDIT STOCK COUNT FORM
// ============================================================================

const StockCountForm = ({ isOpen, onClose, locations, reasons, categories, users, onSubmit, onEdit, editCount, loading }) => {
  const isEdit = !!editCount;
  const [form, setForm] = useState({
    location: "", reason: "", category: "",
    count_date: new Date().toISOString().split("T")[0],
    count_type: "CYCLE", assigned_counters: [], remarks: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editCount) {
      setForm({
        location: editCount.location || "",
        reason: editCount.reason || "",
        category: editCount.category || "",
        count_date: editCount.count_date || new Date().toISOString().split("T")[0],
        count_type: editCount.count_type || "CYCLE",
        assigned_counters: (editCount.assigned_counters_detail || []).map((u) => u.id),
        remarks: editCount.remarks || "",
      });
    } else {
      setForm({ location: "", reason: "", category: "", count_date: new Date().toISOString().split("T")[0], count_type: "CYCLE", assigned_counters: [], remarks: "" });
    }
    setError("");
  }, [editCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.location || !form.reason) { setError("Location and Reason are required."); return; }
    const payload = { location: form.location, reason: form.reason, count_date: form.count_date, count_type: form.count_type, remarks: form.remarks, assigned_counters: form.assigned_counters };
    if (form.category) payload.category = form.category;
    const result = isEdit ? await onEdit(editCount.id, payload) : await onSubmit(payload);
    if (result.success) onClose();
    else setError(result.error || "Failed to save.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">{isEdit ? "Edit Stock Count" : "New Stock Count"}</h3>
            <p className="text-xs text-white/40 mt-0.5">{isEdit ? "Modify the draft count" : "Create a physical stock count"}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X size={18} className="text-white/60" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"><p className="text-sm text-red-400">{error}</p></div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Location <span className="text-red-400">*</span></label>
              <select value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="">Select location...</option>
                {locations.map((loc) => (<option key={loc.id} value={loc.id}>{loc.location_name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Reason <span className="text-red-400">*</span></label>
              <select value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="">Select reason...</option>
                {reasons.map((r) => (<option key={r.id} value={r.id}>{r.reason_name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Type</label>
              <select value={form.count_type} onChange={(e) => setForm((f) => ({ ...f, count_type: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="FULL">Full Count</option><option value="CYCLE">Cycle Count</option>
                <option value="SPOT">Spot Check</option><option value="ANNUAL">Annual Physical Count</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={form.count_date} onChange={(e) => setForm((f) => ({ ...f, count_date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Category (optional)</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="">All Categories</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.category_name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Assign Counters</label>
              <select multiple value={form.assigned_counters} onChange={(e) => setForm((f) => ({ ...f, assigned_counters: Array.from(e.target.selectedOptions, (o) => o.value) }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 h-24">
                {users.map((u) => (<option key={u.id} value={u.id}>{u.name || u.email}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              rows={2} className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none" placeholder="Optional remarks..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? "Update Count" : "Create Count"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// COUNTING SCREEN - Barcode scan + manual entry
// ============================================================================

const CountingScreen = ({ stockCount, onClose, onAction, actions, loading }) => {
  const [items, setItems] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeResult, setBarcodeResult] = useState(null);
  const [barcodeError, setBarcodeError] = useState("");

  useEffect(() => {
    if (stockCount?.items) setItems(stockCount.items.map((i) => ({ ...i, localCount: i.counted_quantity || "" })));
  }, [stockCount]);

  if (!stockCount) return null;

  const handleBarcodeLookup = async () => {
    if (!barcodeInput.trim()) return;
    setBarcodeError("");
    setBarcodeResult(null);
    const result = await actions.lookupBarcode(stockCount.id, barcodeInput.trim());
    if (result.success) setBarcodeResult(result.data);
    else setBarcodeError(result.error || "Barcode not found");
  };

  const handleCountChange = (itemId, value) => {
    setItems((prev) => prev.map((i) => (i.item_id === itemId || i.id === itemId ? { ...i, localCount: value } : i)));
  };

  const handleSaveProgress = async () => {
    const payload = { items: items.filter((i) => i.localCount !== "").map((i) => ({
      item_id: i.item_id || i.item,
      counted_quantity: Number(i.localCount),
      scanned_barcode: barcodeResult?.scanned_barcode || "",
      remarks: i.remarks || "",
    })) };
    const result = await actions.saveProgress(stockCount.id, payload);
    if (result.success) onClose();
  };

  const itemsToCount = items || stockCount.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><ClipboardList size={18} className="text-amber-400" /></div>
            <div>
              <h3 className="text-lg font-bold text-white">Counting: {stockCount.count_number}</h3>
              <p className="text-xs text-white/40">{stockCount.location_name || stockCount.location?.location_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X size={18} className="text-white/60" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Barcode Scanner */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Barcode size={13} /> Scan Barcode</p>
            <div className="flex gap-2">
              <input type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleBarcodeLookup(); }}
                placeholder="Scan or type barcode..." autoFocus
                className="flex-1 px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" />
              <button onClick={handleBarcodeLookup} className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all flex items-center gap-1.5">
                <Camera size={14} /> Find
              </button>
            </div>
            {barcodeResult && (
              <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-400 font-semibold">{barcodeResult.item_name} ({barcodeResult.item_code})</p>
                <p className="text-xs text-white/50 mt-0.5">Expected: {barcodeResult.expected_quantity} | Counted: {barcodeResult.counted_quantity || "—"} | Diff: {barcodeResult.difference_quantity}</p>
              </div>
            )}
            {barcodeError && <p className="mt-2 text-xs text-red-400">{barcodeError}</p>}
          </div>

          {/* Items Table */}
          <div>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Items ({itemsToCount.length})</p>
            <div className="overflow-hidden rounded-xl border border-white/5 max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 sticky top-0">
                    <th className="text-left px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Item</th>
                    <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Expected</th>
                    <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Counted</th>
                    <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Diff</th>
                    <th className="text-left px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {itemsToCount.map((item, idx) => {
                    const countVal = item.localCount !== "" ? Number(item.localCount) : null;
                    const diff = countVal !== null ? countVal - Number(item.expected_quantity) : null;
                    return (
                      <tr key={item.id || item.item_id || idx} className="hover:bg-white/5">
                        <td className="px-3 py-2">
                          <p className="text-xs font-medium text-white">{item.item_name || item.item?.item_name}</p>
                          <p className="text-[10px] text-white/30">{item.item_code || item.item?.item_code}</p>
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-white/60">{item.expected_quantity}</td>
                        <td className="px-3 py-2 text-right">
                          <input type="number" min="0" step="0.01" value={item.localCount}
                            onChange={(e) => handleCountChange(item.item_id || item.id, e.target.value)}
                            className="w-24 px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white text-right focus:outline-none focus:border-blue-500/50"
                            placeholder="0" />
                        </td>
                        <td className={`px-3 py-2 text-right text-sm font-bold ${diff > 0 ? "text-emerald-400" : diff < 0 ? "text-red-400" : "text-white/40"}`}>
                          {diff !== null ? (diff > 0 ? "+" : "") + diff.toFixed(2) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" value={item.remarks || ""} onChange={(e) => handleCountChange(item.item_id || item.id, item.localCount)}
                            placeholder="Notes" className="w-full px-2 py-1.5 bg-transparent border border-transparent rounded-lg text-xs text-white/50 focus:outline-none focus:border-white/10" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">Close</button>
            <button onClick={handleSaveProgress} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STOCK COUNT DETAIL MODAL (with History + Difference tabs)
// ============================================================================

const StockCountDetail = ({ stockCount, onClose, onAction, actions }) => {
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [differenceSummary, setDifferenceSummary] = useState(null);
  const [diffLoading, setDiffLoading] = useState(false);

  if (!stockCount) return null;

  const config = STATUS_CONFIG[stockCount.status] || STATUS_CONFIG.DRAFT;
  const isDraftOrAssigned = ["DRAFT", "ASSIGNED"].includes(stockCount.status);
  const isInProgress = stockCount.status === "IN_PROGRESS";
  const isSubmitted = stockCount.status === "SUBMITTED";
  const isApproved = stockCount.status === "APPROVED";
  const isCompleted = stockCount.status === "COMPLETED";

  const handleAction = async (actionFn) => {
    setActionLoading(true);
    try {
      const result = await actionFn(stockCount.id, notes);
      if (result.success) { setNotes(""); onClose(); }
    } finally { setActionLoading(false); }
  };

  const loadHistory = async () => {
    setActiveTab("history");
    if (history.length > 0) return;
    setHistoryLoading(true);
    try { const resp = await fetchStockCountHistory(stockCount.id); setHistory(resp.data || []); }
    catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  };

  const loadDifference = async () => {
    setActiveTab("difference");
    if (differenceSummary) return;
    setDiffLoading(true);
    try { const resp = await fetchDifferenceSummary(stockCount.id); setDifferenceSummary(resp.data); }
    catch { setDifferenceSummary(null); }
    finally { setDiffLoading(false); }
  };

  const items = stockCount.items || [];
  const counters = stockCount.assigned_counters_detail || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><ClipboardList size={18} className="text-amber-400" /></div>
            <div>
              <h3 className="text-lg font-bold text-white">{stockCount.count_number}</h3>
              <p className="text-xs text-white/40">{stockCount.count_date} | {stockCount.location_name || stockCount.location?.location_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X size={18} className="text-white/60" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6">
          {["details", "history", "difference"].map((tab) => (
            <button key={tab} onClick={() => tab === "history" ? loadHistory() : tab === "difference" ? loadDifference() : setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === tab ? "text-white border-white/50" : "text-white/30 border-transparent hover:text-white/50"}`}>
              <div className="flex items-center gap-1.5">
                {tab === "details" ? <ClipboardList size={13} /> : tab === "history" ? <History size={13} /> : <Activity size={13} />}
                {tab === "details" ? "Details" : tab === "history" ? "History" : "Differences"}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "details" && (
            <>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>{config.label}</span>
                <span className="text-xs text-white/30">{stockCount.count_type || stockCount.get_count_type_display}</span>
              </div>

              {counters.length > 0 && (
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Counters</p>
                  <div className="flex flex-wrap gap-1.5">
                    {counters.map((c) => (<span key={c.id} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full">{c.name}</span>))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Location</p>
                  <p className="text-sm font-semibold text-white">{stockCount.location_name || stockCount.location?.location_name}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Reason</p>
                  <p className="text-sm font-semibold text-white">{stockCount.reason_name || stockCount.reason?.reason_name}</p>
                </div>
              </div>

              {stockCount.total_items_counted > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">{stockCount.total_items_counted}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">Counted</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-amber-400">{stockCount.total_items_with_difference}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">With Diff</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-red-400">{Number(stockCount.total_difference_value).toFixed(2)}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">Value</p>
                  </div>
                </div>
              )}

              {stockCount.generated_adjustment && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold mb-1">Generated Adjustment</p>
                  <p className="text-sm text-emerald-300">{stockCount.generated_adjustment_number || stockCount.generated_adjustment?.adjustment_number}</p>
                </div>
              )}

              {stockCount.remarks && (
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Remarks</p>
                  <p className="text-sm text-white/70">{stockCount.remarks}</p>
                </div>
              )}

              {(stockCount.approved_by || stockCount.completed_by) && (
                <div className="grid grid-cols-2 gap-3">
                  {stockCount.approved_by_name && (
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Approved By</p>
                      <p className="text-xs text-white/70">{stockCount.approved_by_name}</p>
                    </div>
                  )}
                  {stockCount.completed_by_name && (
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Completed By</p>
                      <p className="text-xs text-white/70">{stockCount.completed_by_name}</p>
                    </div>
                  )}
                </div>
              )}

              {isSubmitted && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Approval Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none" placeholder="Notes..." />
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {isDraftOrAssigned && (
                  <>
                    <button onClick={() => handleAction(actions.assignCounters)} disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <UserPlus size={13} /> Assign Counters
                    </button>
                    <button onClick={() => handleAction(actions.startCounting)} disabled={actionLoading || stockCount.status !== "ASSIGNED"}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <Play size={13} /> Start Counting
                    </button>
                    <button onClick={() => handleAction(actions.cancelStockCount)} disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <Ban size={13} /> Cancel
                    </button>
                  </>
                )}
                {isSubmitted && (
                  <>
                    <button onClick={() => handleAction(actions.approveStockCount)} disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={() => handleAction(actions.cancelStockCount)} disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <Ban size={13} /> Reject & Cancel
                    </button>
                  </>
                )}
                {isApproved && (
                  <button onClick={() => handleAction(actions.completeStockCount)} disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                    <Activity size={13} /> Complete & Generate Adjustments
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === "history" && (
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Audit Trail</p>
              {historyLoading ? (
                <div className="flex items-center justify-center py-10"><Loader2 size={18} className="animate-spin text-white/30" /></div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center"><History size={28} className="text-white/10 mb-2" /><p className="text-sm text-white/30">No history yet</p></div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/5"></div>
                  <div className="space-y-0">
                    {history.map((entry, idx) => (
                      <div key={entry.id || idx} className="flex gap-4 pb-5 last:pb-0 relative">
                        <div className="relative z-10 shrink-0 mt-1">
                          <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center border ${
                            ["CREATED","SUBMITTED"].includes(entry.action) ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                            ["APPROVED","COMPLETED","ADJUSTMENT_GENERATED"].includes(entry.action) ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            ["CANCELLED"].includes(entry.action) ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            "bg-white/5 border-white/10 text-white/40"}`}>
                            {["CREATED","SUBMITTED"].includes(entry.action) ? <Send size={12} /> :
                             entry.action === "APPROVED" ? <CheckCircle size={12} /> :
                             entry.action === "COMPLETED" ? <Activity size={12} /> :
                             entry.action === "CANCELLED" ? <XCircle size={12} /> :
                             <FileText size={12} />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white">{ACTION_LABELS[entry.action] || entry.action}</p>
                            <span className="text-[10px] text-white/30 shrink-0">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          {entry.performed_by_name && <p className="text-[11px] text-white/40 mt-0.5">by {entry.performed_by_name}</p>}
                          {entry.remarks && <p className="text-xs text-white/50 mt-1 italic">"{entry.remarks}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "difference" && (
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Difference Summary</p>
              {diffLoading ? (
                <div className="flex items-center justify-center py-10"><Loader2 size={18} className="animate-spin text-white/30" /></div>
              ) : !differenceSummary ? (
                <div className="flex flex-col items-center justify-center py-10 text-center"><Activity size={28} className="text-white/10 mb-2" /><p className="text-sm text-white/30">No difference data</p></div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl text-center">
                      <p className="text-lg font-bold text-white">{differenceSummary.totals?.total_items || 0}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-0.5">Total</p>
                    </div>
                    <div className="p-3 bg-emerald-500/5 rounded-xl text-center">
                      <p className="text-lg font-bold text-emerald-400">{differenceSummary.totals?.matching_items || 0}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-0.5">Match</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-center">
                      <p className="text-lg font-bold text-emerald-400">+{differenceSummary.totals?.surplus_items || 0}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-0.5">Surplus</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-center">
                      <p className="text-lg font-bold text-red-400">-{differenceSummary.totals?.shortage_items || 0}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-0.5">Shortage</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/5 max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="text-left px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Item</th>
                          <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Expected</th>
                          <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Counted</th>
                          <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Diff</th>
                          <th className="text-center px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(differenceSummary.items || []).map((item, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="px-3 py-2">
                              <p className="text-xs font-medium text-white">{item.item_name}</p>
                              <p className="text-[10px] text-white/30">{item.item_code}</p>
                            </td>
                            <td className="px-3 py-2 text-right text-sm text-white/60">{item.expected_quantity}</td>
                            <td className="px-3 py-2 text-right text-sm text-white/80">{item.counted_quantity ?? "—"}</td>
                            <td className={`px-3 py-2 text-right text-sm font-bold ${item.status === "SURPLUS" ? "text-emerald-400" : item.status === "SHORTAGE" ? "text-red-400" : "text-white/40"}`}>{item.difference_quantity}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === "MATCH" ? "text-emerald-400 bg-emerald-400/10" :
                                item.status === "SURPLUS" ? "text-emerald-400 bg-emerald-400/10" :
                                item.status === "SHORTAGE" ? "text-red-400 bg-red-400/10" :
                                "text-gray-400 bg-gray-400/10"}`}>{item.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN STOCK COUNT LIST PAGE
// ============================================================================

const StockCountList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCount, setSelectedCount] = useState(null);
  const [editCount, setEditCount] = useState(null);
  const [showCounting, setShowCounting] = useState(null);

  const filters = useMemo(() => ({
    page, page_size: 25, search,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(typeFilter ? { count_type: typeFilter } : {}),
  }), [page, search, statusFilter, typeFilter]);

  const { stockCounts, count, loading, refetch } = useStockCounts(filters);
  const { items } = useItems({ page_size: 200 });
  const { locations } = useLocations({ page_size: 200 });
  const { reasons } = useStockCountReasons({ show_inactive: false });
  const { categories } = useCategories({ page_size: 200 });
  const [users, setUsers] = useState([]);
  const actions = useStockCountActions();

  useEffect(() => {
    import("axios").then((axiosMod) => {
      const axios = axiosMod.default || axiosMod;
      axios.get("/api/auth/users/", { params: { page_size: 500 } })
        .then((resp) => {
          const data = resp.data?.results || resp.data?.data || resp.data || [];
          setUsers(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    });
  }, []);

  const handleCreate = async (data) => {
    const result = await actions.createStockCount(data);
    if (result.success) { setShowForm(false); refetch(); }
    return result;
  };

  const handleEdit = async (id, data) => {
    const result = await actions.updateStockCount(id, data);
    if (result.success) { setEditCount(null); refetch(); }
    return result;
  };

  const handleAction = async (actionFn, id) => {
    const result = await actionFn(id);
    if (result.success) refetch();
    return result;
  };

  const handleActionWithNotes = async (actionFn, id) => {
    const result = await actionFn(id);
    if (result.success) refetch();
    return result;
  };

  const handleExport = () => actions.exportStockCounts({ export_format: "xlsx" });

  const totalPages = Math.ceil(count / 25);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList size={20} className="text-amber-400" />
            Stock Counts
          </h1>
          <p className="text-xs text-white/30 mt-0.5">Physical inventory cycle counts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport}
            className="px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
            <FileDown size={14} /> Export
          </button>
          <button onClick={() => { setEditCount(null); setShowForm(true); }}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2">
            <Plus size={14} /> New Count
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 pb-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by count number..." className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/20 appearance-none">
          <option value="">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/20 appearance-none">
          <option value="">All Types</option>
          <option value="FULL">Full</option><option value="CYCLE">Cycle</option>
          <option value="SPOT">Spot</option><option value="ANNUAL">Annual</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 overflow-auto custom-scrollbar min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-white/30" /></div>
        ) : stockCounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ClipboardList size={32} className="text-white/10 mb-3" />
            <p className="text-sm font-medium text-white/30">No stock counts yet</p>
            <p className="text-xs text-white/20 mt-1">Create your first physical stock count to get started.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold"><div className="flex items-center gap-1">Count # <ArrowUpDown size={10} /></div></th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Location</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Type</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Items</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Diffs</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stockCounts.map((c) => {
                  const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.DRAFT;
                  return (
                    <tr key={c.id} className="hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setSelectedCount(c)}>
                      <td className="px-4 py-3"><p className="text-sm font-semibold text-white">{c.count_number}</p></td>
                      <td className="px-4 py-3 text-sm text-white/60">{c.count_date}</td>
                      <td className="px-4 py-3 text-sm text-white/80">{c.location_name || c.location?.location_name}</td>
                      <td className="px-4 py-3 text-sm text-white/60">{c.count_type}</td>
                      <td className="px-4 py-3 text-center text-sm text-white/60">{c.item_count || c.total_items_counted || "-"}</td>
                      <td className="px-4 py-3 text-center text-sm text-white/60">{c.total_items_with_difference || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {c.status === "IN_PROGRESS" && (
                            <button onClick={(e) => { e.stopPropagation(); setShowCounting(c); }}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-amber-400 hover:bg-amber-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                              <Barcode size={11} /> Count
                            </button>
                          )}
                          {["DRAFT", "ASSIGNED"].includes(c.status) && (
                            <button onClick={(e) => { e.stopPropagation(); setEditCount(c); setShowForm(true); }}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-400 hover:bg-blue-500/10 transition-colors uppercase tracking-wider">Edit</button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setSelectedCount(c); }}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider">View</button>
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
          <p className="text-xs text-white/30">{count} stock counts</p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">Previous</button>
            <span className="text-xs text-white/50">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">Next</button>
          </div>
        </div>
      )}

      <StockCountForm isOpen={showForm} onClose={() => { setShowForm(false); setEditCount(null); }}
        locations={locations} reasons={reasons} categories={categories} users={users}
        editCount={editCount} onSubmit={handleCreate} onEdit={handleEdit} loading={actions.loading} />

      <StockCountDetail stockCount={selectedCount} onClose={() => { setSelectedCount(null); refetch(); }}
        onAction={handleAction} actions={actions} />

      <CountingScreen stockCount={showCounting} onClose={() => { setShowCounting(null); refetch(); }}
        onAction={handleAction} actions={actions} loading={actions.loading} />
    </div>
  );
};

export default StockCountList;
