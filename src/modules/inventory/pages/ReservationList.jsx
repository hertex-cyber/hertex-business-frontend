import React, { useState, useMemo, useEffect } from "react";
import {
  CalendarCheck, Search, Plus, X, ChevronDown, Download,
  CheckCircle, XCircle, Ban, Clock, AlertTriangle,
  ArrowUpDown, FileDown, Loader2, History, ClipboardList,
  PackageCheck, RefreshCw,
} from "lucide-react";
import { useReservations, useReservationActions } from "../hooks/useReservations";
import { useItems } from "../hooks/useItems";
import { useLocations } from "../hooks/useLocations";
import { fetchReservationHistory, fetchReservation } from "../services/reservationService";

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  ACTIVE: { label: "Active", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  PARTIALLY_FULFILLED: { label: "Partial", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  FULFILLED: { label: "Fulfilled", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  EXPIRED: { label: "Expired", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "text-gray-400" },
  MEDIUM: { label: "Medium", color: "text-blue-400" },
  HIGH: { label: "High", color: "text-orange-400" },
  CRITICAL: { label: "Critical", color: "text-red-400" },
};

const ACTION_LABELS = {
  CREATED: "Reservation Created",
  UPDATED: "Reservation Updated",
  ACTIVATED: "Reservation Activated",
  FULFILLED: "Reservation Fulfilled",
  PARTIALLY_FULFILLED: "Partially Fulfilled",
  CANCELLED: "Reservation Cancelled",
  EXPIRED: "Reservation Expired",
};

// ============================================================================
// RESERVATION FORM MODAL
// ============================================================================

const ReservationForm = ({ isOpen, onClose, locations, items, onSubmit, loading }) => {
  const [form, setForm] = useState({
    source_location: "",
    reservation_type: "CUSTOMER",
    priority: "MEDIUM",
    reservation_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    customer_name: "",
    reference_number: "",
    remarks: "",
    items: [{ item_id: "", requested_quantity: "", remarks: "" }],
  });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { item_id: "", requested_quantity: "", remarks: "" }] }));
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

    if (!form.source_location) {
      setError("Please select a source location.");
      return;
    }
    if (form.items.length === 0 || !form.items[0].item_id) {
      setError("Please add at least one item.");
      return;
    }

    const payload = {
      ...form,
      source_location: form.source_location,
      expiry_date: form.expiry_date || null,
      items: form.items
        .filter((i) => i.item_id && i.requested_quantity)
        .map((i) => ({
          item_id: i.item_id,
          requested_quantity: Number(i.requested_quantity),
          remarks: i.remarks || "",
        })),
    };

    const result = await onSubmit(payload);
    if (!result.success) {
      setError(result.error || "Failed to create reservation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">New Reservation</h3>
            <p className="text-xs text-white/40 mt-0.5">Reserve stock for future use</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Source Location</label>
              <select
                value={form.source_location}
                onChange={(e) => setForm((f) => ({ ...f, source_location: e.target.value }))}
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
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Type</label>
              <select
                value={form.reservation_type}
                onChange={(e) => setForm((f) => ({ ...f, reservation_type: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none"
              >
                <option value="SALES_ORDER" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Sales Order</option>
                <option value="TRANSFER" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Transfer</option>
                <option value="PRODUCTION" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Production</option>
                <option value="INTERNAL" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Internal Use</option>
                <option value="CUSTOMER" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Customer</option>
                <option value="OTHER" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={form.reservation_date}
                onChange={(e) => setForm((f) => ({ ...f, reservation_date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Expiry Date</label>
              <input type="date" value={form.expiry_date}
                onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Priority</label>
              <select value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="LOW" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Low</option>
                <option value="MEDIUM" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Medium</option>
                <option value="HIGH" style={{ backgroundColor: "#1f2937", color: "#fff" }}>High</option>
                <option value="CRITICAL" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Customer</label>
              <input type="text" value={form.customer_name}
                onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                placeholder="Customer name (optional)" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Reference #</label>
              <input type="text" value={form.reference_number}
                onChange={(e) => setForm((f) => ({ ...f, reference_number: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                placeholder="PO/SO number (optional)" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Remarks</label>
            <textarea value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
              placeholder="Optional notes..." />
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
                  <div className="col-span-6">
                    <select value={item.item_id}
                      onChange={(e) => handleItemChange(idx, "item_id", e.target.value)}
                      className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 appearance-none">
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
                      value={item.requested_quantity}
                      onChange={(e) => handleItemChange(idx, "requested_quantity", e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" />
                  </div>
                  <div className="col-span-3">
                    <input type="text" value={item.remarks}
                      onChange={(e) => handleItemChange(idx, "remarks", e.target.value)}
                      placeholder="Remarks"
                      className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" />
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

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// FULFILLMENT MODAL (Partial Fulfillment UI)
// ============================================================================

const FulfillmentModal = ({ reservation, isOpen, onClose, onSubmit, loading }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reservation && isOpen) {
      setItems(
        (reservation.items || []).map((item) => ({
          item_id: item.item_id || item.item?.id || item.id,
          item_code: item.item_code || item.item?.item_code || "",
          item_name: item.item_name || item.item?.item_name || "",
          requested_quantity: Number(item.requested_quantity) || 0,
          fulfilled_quantity: item.fulfilled_quantity || 0,
          remaining: item.remaining_quantity || Number(item.requested_quantity) || 0,
          fulfill_input: "",
        }))
      );
      setError("");
    }
  }, [reservation, isOpen]);

  if (!isOpen || !reservation) return null;

  const handleChange = (idx, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], fulfill_input: value };
      return updated;
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payloadItems = items
      .map((item) => ({
        item_id: item.item_id,
        fulfilled_quantity: item.fulfill_input !== "" ? Number(item.fulfill_input) : item.remaining,
      }))
      .filter((item) => item.fulfilled_quantity > 0);

    if (payloadItems.length === 0) {
      setError("Please enter a fulfillment quantity for at least one item.");
      return;
    }

    // Validate: fulfilled <= remaining
    for (const payloadItem of payloadItems) {
      const original = items.find((i) => i.item_id === payloadItem.item_id);
      if (original && payloadItem.fulfilled_quantity > original.remaining) {
        setError(
          `"${original.item_name}": Fulfilled quantity (${payloadItem.fulfilled_quantity}) exceeds remaining quantity (${original.remaining}).`
        );
        return;
      }
    }

    const result = await onSubmit(reservation.id, payloadItems);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Failed to fulfill reservation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <PackageCheck size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Fulfill Reservation</h3>
              <p className="text-xs text-white/40">{reservation.reservation_number} — Enter fulfilled quantities per item</p>
            </div>
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

          <div className="flex items-center gap-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-xs text-blue-300">
            <span>Location: <strong className="text-white">{reservation.source_name || reservation.source_location?.location_name}</strong></span>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Item</th>
                  <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Requested</th>
                  <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Already Fulfilled</th>
                  <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Remaining</th>
                  <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Fulfill Now</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item, idx) => (
                  <tr key={item.item_id || idx} className="hover:bg-white/5">
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-medium text-white">{item.item_name}</p>
                      <p className="text-[10px] text-white/30">{item.item_code}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm text-white font-medium">{item.requested_quantity}</td>
                    <td className="px-3 py-2.5 text-right text-sm text-emerald-400">{item.fulfilled_quantity || 0}</td>
                    <td className="px-3 py-2.5 text-right text-sm text-orange-400 font-medium">{item.remaining}</td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.fulfill_input}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        placeholder={String(item.remaining)}
                        className="w-24 px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white text-right placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-white/30 px-1">
            Leave blank to fulfill the full remaining quantity. Values must not exceed the remaining quantity.
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <PackageCheck size={14} />}
              Fulfill Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// RESERVATION DETAIL MODAL (with History Tab)
// ============================================================================

const ReservationDetail = ({ reservation, onClose, onAction, onFulfill, actions }) => {
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  if (!reservation) return null;

  const config = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.DRAFT;
  const priorityCfg = PRIORITY_CONFIG[reservation.priority] || PRIORITY_CONFIG.MEDIUM;
  const isDraft = reservation.status === "DRAFT";
  const isActive = reservation.status === "ACTIVE";
  const isPartial = reservation.status === "PARTIALLY_FULFILLED";

  const handleAction = async (actionFn) => {
    setActionLoading(true);
    try {
      const result = await actionFn(reservation.id, notes);
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
      const response = await fetchReservationHistory(reservation.id);
      setHistory(response.data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CalendarCheck size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{reservation.reservation_number}</h3>
              <p className="text-xs text-white/40">{reservation.reservation_date}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6">
          <button onClick={() => setActiveTab("details")}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "details"
                ? "text-white border-white/50"
                : "text-white/30 border-transparent hover:text-white/50"
            }`}>
            <div className="flex items-center gap-1.5">
              <ClipboardList size={13} /> Details
            </div>
          </button>
          <button onClick={loadHistory}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "history"
                ? "text-white border-white/50"
                : "text-white/30 border-transparent hover:text-white/50"
            }`}>
            <div className="flex items-center gap-1.5">
              <History size={13} /> History
            </div>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "details" && (
            <>
              {/* Status + Priority Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
                    {config.label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityCfg.color} bg-white/5 border-white/10`}>
                    {priorityCfg.label}
                  </span>
                </div>
                <span className="text-xs text-white/30">Type: {reservation.reservation_type || "Other"}</span>
              </div>

              {/* Location */}
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Source Location</p>
                <p className="text-sm font-semibold text-white">{reservation.source_name || reservation.source_location?.location_name}</p>
              </div>

              {/* Customer & Reference */}
              {(reservation.customer_name || reservation.reference_number) && (
                <div className="grid grid-cols-2 gap-4">
                  {reservation.customer_name && (
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Customer</p>
                      <p className="text-sm font-semibold text-white">{reservation.customer_name}</p>
                    </div>
                  )}
                  {reservation.reference_number && (
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Reference</p>
                      <p className="text-sm font-semibold text-white">{reservation.reference_number}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Expiry */}
              {reservation.expiry_date && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <Clock size={14} className="text-amber-400" />
                  <p className="text-xs text-amber-300">Expires on <strong>{reservation.expiry_date}</strong></p>
                </div>
              )}

              {/* Items Table */}
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Items ({reservation.items?.length || 0})</p>
                <div className="overflow-hidden rounded-xl border border-white/5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="text-left px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Item</th>
                        <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Requested</th>
                        <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Reserved</th>
                        <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Fulfilled</th>
                        <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(reservation.items || []).map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-white/5">
                          <td className="px-3 py-2.5">
                            <p className="text-sm font-medium text-white">{item.item_name || item.item?.item_name}</p>
                            <p className="text-[10px] text-white/30">{item.item_code || item.item?.item_code}</p>
                          </td>
                          <td className="px-3 py-2.5 text-right text-sm text-white">{item.requested_quantity}</td>
                          <td className="px-3 py-2.5 text-right text-sm text-blue-400">{item.reserved_quantity || 0}</td>
                          <td className="px-3 py-2.5 text-right text-sm text-emerald-400">{item.fulfilled_quantity || 0}</td>
                          <td className="px-3 py-2.5 text-right text-sm text-orange-400">{item.remaining_quantity || item.requested_quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              {reservation.remarks && (
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Remarks</p>
                  <p className="text-sm text-white/70">{reservation.remarks}</p>
                </div>
              )}

              {/* Workflow Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {isDraft && (
                  <>
                    <button onClick={() => handleAction(actions.activateReservation)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <CheckCircle size={13} /> Activate
                    </button>
                    <button onClick={() => handleAction(actions.cancelReservation)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <XCircle size={13} /> Cancel
                    </button>
                  </>
                )}
                {(isActive || isPartial) && (
                  <>
                    <button onClick={() => { setNotes(""); onClose(); onFulfill(reservation); }}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <PackageCheck size={13} /> Fulfill
                    </button>
                    <button onClick={() => handleAction(actions.cancelReservation)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                      <XCircle size={13} /> Cancel
                    </button>
                  </>
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
                            entry.action === "CREATED" || entry.action === "ACTIVATED" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                            entry.action === "FULFILLED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            entry.action === "CANCELLED" || entry.action === "EXPIRED" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            "bg-white/5 border-white/10 text-white/40"
                          }`}>
                            {entry.action === "ACTIVATED" ? <CheckCircle size={12} /> :
                             entry.action === "FULFILLED" || entry.action === "PARTIALLY_FULFILLED" ? <PackageCheck size={12} /> :
                             entry.action === "CANCELLED" ? <XCircle size={12} /> :
                             entry.action === "EXPIRED" ? <Clock size={12} /> :
                             <CalendarCheck size={12} />}
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
                            <p className="text-[11px] text-white/40 mt-0.5">by {entry.performed_by_name}</p>
                          )}
                          {entry.remarks && (
                            <p className="text-xs text-white/50 mt-1 italic">"{entry.remarks}"</p>
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
// MAIN RESERVATION LIST PAGE
// ============================================================================

const ReservationList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [fulfillReservationData, setFulfillReservationData] = useState(null);

  const filters = useMemo(() => ({
    page,
    page_size: 25,
    search,
    ...(statusFilter ? { status: statusFilter } : {}),
  }), [page, search, statusFilter]);

  const { reservations, count, loading, refetch } = useReservations(filters);
  const { items } = useItems({ page_size: 200 });
  const { locations } = useLocations({ page_size: 200 });
  const actions = useReservationActions();

  const handleCreate = async (data) => {
    const result = await actions.createReservation(data);
    if (result.success) {
      setShowForm(false);
      refetch();
    }
    return result;
  };

  const handleAction = async (actionFn, id) => {
    const result = await actionFn(id);
    if (result.success) refetch();
    return result;
  };

  const handleFulfillOpen = async (reservation) => {
    try {
      const response = await fetchReservation(reservation.id);
      const detail = response.data.data || response.data;
      setFulfillReservationData(detail);
      setShowFulfillModal(true);
    } catch {
      setFulfillReservationData(reservation);
      setShowFulfillModal(true);
    }
  };

  const handleFulfillSubmit = async (id, items) => {
    const result = await actions.fulfillReservation(id, items);
    if (result.success) {
      setShowFulfillModal(false);
      setFulfillReservationData(null);
      refetch();
    }
    return result;
  };

  const totalPages = Math.ceil(count / 25);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck size={20} className="text-blue-400" />
            Stock Reservations
          </h1>
          <p className="text-xs text-white/30 mt-0.5">Reserve stock for future use without affecting physical stock</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => actions.exportReservations({ export_format: "xlsx" })}
            className="px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
            <FileDown size={14} /> Export
          </button>
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2">
            <Plus size={14} /> New Reservation
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 pb-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by reservation number..."
            className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" />
        </div>
        <select value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/20 appearance-none">
          <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key} style={{ backgroundColor: "#1f2937", color: "#fff" }}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 overflow-auto custom-scrollbar min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={20} className="animate-spin text-white/30" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <CalendarCheck size={32} className="text-white/10 mb-3" />
            <p className="text-sm font-medium text-white/30">No reservations yet</p>
            <p className="text-xs text-white/20 mt-1">Create your first stock reservation to get started.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold cursor-pointer hover:text-white/60">
                    <div className="flex items-center gap-1">Reservation # <ArrowUpDown size={10} /></div>
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Location</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Priority</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Items</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reservations.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.DRAFT;
                  const pcfg = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.MEDIUM;
                  return (
                    <tr key={r.id} className="hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setSelectedReservation(r)}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-white">{r.reservation_number}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{r.reservation_date}</td>
                      <td className="px-4 py-3 text-sm text-white/80">{r.source_name || r.source_location?.location_name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${pcfg.color}`}>
                          {pcfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-white/60">{r.item_count || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedReservation(r); }}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider">
                          View
                        </button>
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
          <p className="text-xs text-white/30">{count} reservations</p>
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
      <ReservationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        locations={locations}
        items={items}
        onSubmit={handleCreate}
        loading={actions.loading}
      />

      <ReservationDetail
        reservation={selectedReservation}
        onClose={() => { setSelectedReservation(null); refetch(); }}
        onAction={handleAction}
        onFulfill={handleFulfillOpen}
        actions={actions}
      />

      <FulfillmentModal
        reservation={fulfillReservationData}
        isOpen={showFulfillModal}
        onClose={() => { setShowFulfillModal(false); setFulfillReservationData(null); }}
        onSubmit={handleFulfillSubmit}
        loading={actions.loading}
      />
    </div>
  );
};

export default ReservationList;
