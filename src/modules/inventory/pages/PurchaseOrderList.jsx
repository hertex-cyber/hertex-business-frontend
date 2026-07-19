import React, { useState, useCallback, useEffect } from "react";
import {
  Search, Plus, FileText, Download, Edit, Trash2, Send,
  PackageCheck, XCircle, CheckCircle2, Clock, X, History,
  Loader2, ClipboardList,
} from "lucide-react";
import {
  usePurchaseOrders,
  usePurchaseOrderActions,
  usePurchaseOrderHistory,
  usePurchaseOrderReceipts,
} from "../hooks/usePurchaseOrders";
import { useItems } from "../hooks/useItems";
import purchaseOrderService from "../services/purchaseOrderService";
import api from "../../../lib/api";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  SENT: { label: "Sent", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  PARTIALLY_RECEIVED: { label: "Partial", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  RECEIVED: { label: "Received", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CLOSED: { label: "Closed", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const STATUS_ICONS = {
  DRAFT: FileText,
  SENT: Send,
  PARTIALLY_RECEIVED: Clock,
  RECEIVED: PackageCheck,
  CLOSED: CheckCircle2,
  CANCELLED: XCircle,
};

// ============================================================================
// PO FORM MODAL
// ============================================================================

function POFormModal({ editingPo, formData, itemsList, locationsList, contactsList, onSave, onClose, loading }) {
  const [items, setItems] = useState(formData?.items || []);
  const [supplierName, setSupplierName] = useState(formData?.supplier_name || "");
  const [supplierRef, setSupplierRef] = useState(formData?.supplier_reference || "");
  const [supplier, setSupplier] = useState(formData?.supplier || "");
  const [location, setLocation] = useState(formData?.location || "");
  const [orderDate, setOrderDate] = useState(formData?.order_date || new Date().toISOString().split("T")[0]);
  const [expectedDate, setExpectedDate] = useState(formData?.expected_delivery_date || "");
  const [notes, setNotes] = useState(formData?.notes || "");
  const [taxAmount, setTaxAmount] = useState(formData?.tax_amount || 0);
  const [discountAmount, setDiscountAmount] = useState(formData?.discount_amount || 0);
  const [error, setError] = useState("");

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { item_id: "", quantity: 1, unit_price: 0, tax_rate: 0, discount_rate: 0, remarks: "" },
    ]);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calcLineTotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    const tax = parseFloat(item.tax_rate) || 0;
    const disc = parseFloat(item.discount_rate) || 0;
    return qty * price * (1 + tax / 100) * (1 - disc / 100);
  };

  const total = items.reduce((sum, item) => sum + calcLineTotal(item), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (items.length === 0 || !items[0].item_id) {
      setError("Please add at least one item.");
      return;
    }
    const data = {
      order_date: orderDate,
      expected_delivery_date: expectedDate || null,
      supplier: supplier || null,
      supplier_name: supplierName,
      supplier_reference: supplierRef,
      location: location || null,
      notes,
      tax_amount: parseFloat(taxAmount),
      discount_amount: parseFloat(discountAmount),
      items: items.map((item) => ({
        item_id: item.item_id,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        tax_rate: parseFloat(item.tax_rate || 0),
        discount_rate: parseFloat(item.discount_rate || 0),
        remarks: item.remarks || "",
      })),
    };
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ClipboardList size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {editingPo ? "Edit Purchase Order" : "New Purchase Order"}
              </h3>
              <p className="text-xs text-white/40">{editingPo ? "Update order details" : "Create a new purchase order"}</p>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Order Date</label>
              <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Expected Delivery</label>
              <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Select location...</option>
                {locationsList.map((loc) => (
                  <option key={loc.id} value={loc.id} style={{ backgroundColor: "#1f2937", color: "#fff" }}>{loc.location_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Supplier</label>
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Select supplier...</option>
                {contactsList.map((c) => (
                  <option key={c.id} value={c.id} style={{ backgroundColor: "#1f2937", color: "#fff" }}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Supplier Name</label>
              <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Or enter manually"
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Supplier Reference</label>
              <input type="text" value={supplierRef} onChange={(e) => setSupplierRef(e.target.value)}
                placeholder="Supplier PO ref"
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Items</label>
              <button type="button" onClick={addItem}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Item</th>
                    <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Qty</th>
                    <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Unit Price</th>
                    <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Tax %</th>
                    <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Disc %</th>
                    <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Line Total</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="px-3 py-2">
                        <select value={item.item_id} onChange={(e) => updateItem(idx, "item_id", e.target.value)}
                          className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 appearance-none">
                          <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Select item...</option>
                          {itemsList.map((i) => (
                            <option key={i.id} value={i.id} style={{ backgroundColor: "#1f2937", color: "#fff" }}>{i.item_code} — {i.item_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white text-right placeholder:text-white/30 focus:outline-none focus:border-white/20" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" value={item.unit_price}
                          onChange={(e) => updateItem(idx, "unit_price", e.target.value)}
                          className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white text-right placeholder:text-white/30 focus:outline-none focus:border-white/20" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" max="100" value={item.tax_rate}
                          onChange={(e) => updateItem(idx, "tax_rate", e.target.value)}
                          className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white text-right placeholder:text-white/30 focus:outline-none focus:border-white/20" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" max="100" value={item.discount_rate}
                          onChange={(e) => updateItem(idx, "discount_rate", e.target.value)}
                          className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white text-right placeholder:text-white/30 focus:outline-none focus:border-white/20" />
                      </td>
                      <td className="px-3 py-2 text-right text-sm text-white font-medium">
                        {calcLineTotal(item).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeItem(idx)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                          <X size={14} className="text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Tax Amount</label>
              <input type="number" step="0.01" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Discount Amount</label>
              <input type="number" step="0.01" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20" />
            </div>
            <div className="flex items-end justify-end">
              <div className="text-right">
                <p className="text-xs text-white/40">Total</p>
                <p className="text-xl font-bold text-blue-400">{total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || items.length === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {editingPo ? "Update" : "Create"} Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// RECEIVE MODAL
// ============================================================================

function ReceiveModal({ po, onReceive, onClose, loading }) {
  const [receiptItems, setReceiptItems] = useState(
    (po.items || []).map((item) => ({
      ordered_item_id: item.id,
      ordered_quantity: item.ordered_quantity,
      received_quantity: item.ordered_quantity - item.received_quantity,
      item_name: item.item_name,
      item_code: item.item_code,
    }))
  );
  const [error, setError] = useState("");

  const updateQty = (index, value) => {
    setReceiptItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, received_quantity: Math.min(parseFloat(value) || 0, item.ordered_quantity) } : item
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const items = receiptItems
      .filter((item) => item.received_quantity > 0)
      .map((item) => ({
        ordered_item_id: item.ordered_item_id,
        received_quantity: parseFloat(item.received_quantity),
      }));
    if (items.length === 0) {
      setError("Please enter at least one item with a received quantity.");
      return;
    }
    onReceive(po.id, items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <PackageCheck size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Receive Goods</h3>
              <p className="text-xs text-white/40">PO: {po.order_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-xs text-blue-300">
            <span>PO: <strong className="text-white">{po.order_number}</strong></span>
            <span className="text-white/20">|</span>
            <span>Supplier: <strong className="text-white">{po.supplier_name_display || po.supplier_name || "—"}</strong></span>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Item</th>
                  <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Ordered</th>
                  <th className="text-right px-3 py-2.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Receive Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {receiptItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-medium text-white">{item.item_name || item.item_code}</p>
                      <p className="text-[10px] text-white/30">Ordered: {item.ordered_quantity}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm text-white/60">{item.ordered_quantity}</td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number" step="0.01" min="0" max={item.ordered_quantity}
                        value={item.received_quantity}
                        onChange={(e) => updateQty(idx, e.target.value)}
                        className="w-24 px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white text-right placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <PackageCheck size={14} />}
              Receive Goods
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// PO DETAIL MODAL
// ============================================================================

function PODetailModal({ po, onClose, onEdit, onSend, onReceive, onClosePO, onCancel }) {
  const { data: history, loading: histLoading } = usePurchaseOrderHistory(po.id);
  const { data: receipts, loading: recLoading } = usePurchaseOrderReceipts(po.id);
  const [activeTab, setActiveTab] = useState("items");

  const config = STATUS_CONFIG[po.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = STATUS_ICONS[po.status] || FileText;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ClipboardList size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{po.order_number}</h3>
              <p className="text-xs text-white/40">{po.order_date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {po.status === "DRAFT" && (
              <>
                <button onClick={() => { onClose(); onEdit(po); }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-400 hover:bg-blue-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                  <Edit size={12} /> Edit
                </button>
                <button onClick={() => { onClose(); onSend(po.id); }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-amber-400 hover:bg-amber-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                  <Send size={12} /> Send
                </button>
              </>
            )}
            {(po.status === "SENT" || po.status === "PARTIALLY_RECEIVED") && (
              <button onClick={() => { onClose(); onReceive(po); }}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                <PackageCheck size={12} /> Receive
              </button>
            )}
            {po.status === "RECEIVED" && (
              <button onClick={() => onClosePO(po.id)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-purple-400 hover:bg-purple-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={12} /> Close
              </button>
            )}
            {(po.status === "DRAFT" || po.status === "SENT" || po.status === "PARTIALLY_RECEIVED") && (
              <button onClick={() => onCancel(po.id)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                <XCircle size={12} /> Cancel
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <X size={18} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Status + Info */}
        <div className="flex items-center gap-4 px-6 pt-4 pb-2">
          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
            <div className="flex items-center gap-1.5">
              <StatusIcon size={12} />
              {po.status?.replace("_", " ")}
            </div>
          </span>
          <span className="text-xs text-white/40">
            Supplier: <strong className="text-white/70">{po.supplier_name_display || po.supplier_name || "—"}</strong>
          </span>
          {po.location_name && (
            <span className="text-xs text-white/40">
              Location: <strong className="text-white/70">{po.location_name}</strong>
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6 mt-2">
          {["items", "history", "receipts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-white border-white/50"
                  : "text-white/30 border-transparent hover:text-white/50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {tab === "items" ? <ClipboardList size={13} /> :
                 tab === "history" ? <History size={13} /> :
                 <PackageCheck size={13} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "items" && (
            <>
              <div className="overflow-hidden rounded-xl border border-white/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="text-left px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Item</th>
                      <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Ordered</th>
                      <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Received</th>
                      <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Outstanding</th>
                      <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Unit Price</th>
                      <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {po.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5">
                        <td className="px-3 py-2.5">
                          <p className="text-sm font-medium text-white">{item.item_name || item.item_code}</p>
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-white/60">{item.ordered_quantity}</td>
                        <td className="px-3 py-2.5 text-right text-sm text-emerald-400">{item.received_quantity}</td>
                        <td className="px-3 py-2.5 text-right text-sm font-medium text-white">
                          {parseFloat(item.ordered_quantity - item.received_quantity).toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-white/60">{parseFloat(item.unit_price).toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right text-sm font-medium text-white">{parseFloat(item.line_total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right mt-4 pt-3 border-t border-white/5">
                <p className="text-sm text-white/40">Total: <strong className="text-lg text-blue-400">{parseFloat(po.total_amount || 0).toFixed(2)}</strong></p>
              </div>

              {po.notes && (
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Notes</p>
                  <p className="text-sm text-white/70">{po.notes}</p>
                </div>
              )}
            </>
          )}

          {activeTab === "history" && (
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Audit Trail</p>
              {histLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={18} className="animate-spin text-white/30" />
                </div>
              ) : history?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <History size={28} className="text-white/10 mb-2" />
                  <p className="text-sm text-white/30">No history entries yet</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/5"></div>
                  <div className="space-y-0">
                    {history?.map((entry) => (
                      <div key={entry.id} className="flex gap-4 pb-5 last:pb-0 relative">
                        <div className="relative z-10 shrink-0 mt-1">
                          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center border bg-blue-500/10 border-blue-500/20 text-blue-400">
                            <History size={12} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white">
                              {entry.action?.replace(/_/g, " ")}
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

          {activeTab === "receipts" && (
            <div className="space-y-3">
              {recLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={18} className="animate-spin text-white/30" />
                </div>
              ) : receipts?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <PackageCheck size={28} className="text-white/10 mb-2" />
                  <p className="text-sm text-white/30">No receipts yet</p>
                </div>
              ) : (
                receipts?.map((receipt) => (
                  <div key={receipt.id} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emerald-300">{receipt.receipt_number}</p>
                        <p className="text-xs text-emerald-400/60">{receipt.receipt_date}</p>
                      </div>
                      <span className="text-xs text-emerald-400/60">{receipt.item_count} items</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PURCHASE ORDER LIST PAGE
// ============================================================================

export default function PurchaseOrderList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showReceive, setShowReceive] = useState(null);
  const [detailPo, setDetailPo] = useState(null);
  const [editingPo, setEditingPo] = useState(null);
  const [formData, setFormData] = useState(null);
  const [toast, setToast] = useState(null);

  const params = { page, page_size: 20, search, ...(statusFilter ? { status: statusFilter } : {}) };
  const { data, loading, refetch } = usePurchaseOrders(params);
  const { execute, actionLoading } = usePurchaseOrderActions();
  const { data: itemsData } = useItems({ page_size: 500 });
  const [contacts, setContacts] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    api.get("/api/contacts/?page_size=500")
      .then((res) => setContacts(res.data?.results || res.data || []))
      .catch(() => {});
    api.get("/api/inventory/locations/?page_size=100")
      .then((res) => setLocations(res.data?.results || res.data || []))
      .catch(() => {});
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleExport = useCallback(async (format = "xlsx") => {
    try {
      const res = await purchaseOrderService.export(format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `purchase_orders.${format}`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
      }, 100);
      showToast(`Exported as ${format.toUpperCase()}`);
    } catch {
      showToast("Export failed", "error");
    }
  }, [showToast]);

  const handleCreate = useCallback(async (data) => {
    try {
      await execute("create", data);
      setShowForm(false);
      refetch();
      showToast("Purchase order created");
    } catch (e) {
      showToast(e.message, "error");
    }
  }, [execute, refetch, showToast]);

  const handleUpdate = useCallback(async (data) => {
    try {
      await execute("update", editingPo.id, data);
      setEditingPo(null);
      setShowForm(false);
      refetch();
      showToast("Purchase order updated");
    } catch (e) {
      showToast(e.message, "error");
    }
  }, [execute, editingPo, refetch, showToast]);

  const handleSend = useCallback(async (id) => {
    try {
      await execute("send", id);
      refetch();
      showToast("Purchase order sent to supplier");
    } catch (e) {
      showToast(e.message, "error");
    }
  }, [execute, refetch, showToast]);

  const handleReceive = useCallback(async (id, items) => {
    try {
      await execute("receive", id, { items });
      setShowReceive(null);
      refetch();
      showToast("Goods received successfully");
    } catch (e) {
      showToast(e.message, "error");
    }
  }, [execute, refetch, showToast]);

  const handleClose = useCallback(async (id) => {
    try {
      await execute("close", id);
      refetch();
      showToast("Purchase order closed");
    } catch (e) {
      showToast(e.message, "error");
    }
  }, [execute, refetch, showToast]);

  const handleCancel = useCallback(async (id) => {
    if (!window.confirm("Cancel this purchase order?")) return;
    try {
      await execute("cancel", id);
      refetch();
      showToast("Purchase order cancelled");
    } catch (e) {
      showToast(e.message, "error");
    }
  }, [execute, refetch, showToast]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this purchase order?")) return;
    try {
      await execute("delete", id);
      refetch();
      showToast("Purchase order deleted");
    } catch (e) {
      showToast(e.message, "error");
    }
  }, [execute, refetch, showToast]);

  const openEdit = useCallback((po) => {
    setEditingPo(po);
    setFormData({
      order_date: po.order_date,
      expected_delivery_date: po.expected_delivery_date || "",
      supplier: po.supplier || "",
      supplier_name: po.supplier_name || "",
      supplier_reference: po.supplier_reference || "",
      location: po.location || "",
      notes: po.notes || "",
      terms: po.terms || "",
      tax_amount: po.tax_amount || 0,
      discount_amount: po.discount_amount || 0,
      items: po.items?.map((i) => ({
        item_id: i.item,
        quantity: i.ordered_quantity,
        unit_price: i.unit_price,
        tax_rate: i.tax_rate,
        discount_rate: i.discount_rate,
        remarks: i.remarks || "",
      })) || [],
    });
    setShowForm(true);
  }, []);

  const { data: poData = { results: [], count: 0 } } = data;
  const totalPages = Math.ceil(poData.count / 20);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList size={20} className="text-blue-400" />
            Purchase Orders
          </h1>
          <p className="text-xs text-white/30 mt-0.5">Manage procurement and goods receipt</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport("xlsx")}
            className="px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setEditingPo(null); setFormData(null); setShowForm(true); }}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2">
            <Plus size={14} /> New Purchase Order
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
            placeholder="Search by order number, supplier..."
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
      </div>

      {/* Table */}
      <div className="flex-1 px-6 overflow-auto custom-scrollbar min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={20} className="animate-spin text-white/30" />
          </div>
        ) : poData.results?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ClipboardList size={32} className="text-white/10 mb-3" />
            <p className="text-sm font-medium text-white/30">No purchase orders yet</p>
            <p className="text-xs text-white/20 mt-1">Create your first purchase order to get started.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Order #</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Supplier</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Location</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Total</th>
                  <th className="text-right px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Items</th>
                  <th className="text-right px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {poData.results?.map((po) => {
                  const cfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.DRAFT;
                  const StatusIcon = STATUS_ICONS[po.status] || FileText;
                  return (
                    <tr key={po.id} className="hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setDetailPo(po)}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-white">{po.order_number}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{po.order_date}</td>
                      <td className="px-4 py-3 text-sm text-white/80">{po.supplier_name_display || po.supplier_name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-white/60">{po.location_name || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                          <div className="flex items-center gap-1">
                            <StatusIcon size={12} />
                            {po.status?.replace("_", " ")}
                          </div>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white text-right">{parseFloat(po.total_amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-white/60 text-right">{po.item_count || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setDetailPo(po); }}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider">
                            View
                          </button>
                          {po.status === "DRAFT" && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); openEdit(po); }}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-400 hover:bg-blue-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                                <Edit size={12} /> Edit
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleSend(po.id); }}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-amber-400 hover:bg-amber-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                                <Send size={12} /> Send
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(po.id); }}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                                <Trash2 size={12} /> Delete
                              </button>
                            </>
                          )}
                          {(po.status === "SENT" || po.status === "PARTIALLY_RECEIVED") && (
                            <button onClick={(e) => { e.stopPropagation(); setShowReceive(po); }}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                              <PackageCheck size={12} /> Receive
                            </button>
                          )}
                          {po.status === "RECEIVED" && (
                            <button onClick={(e) => { e.stopPropagation(); handleClose(po.id); }}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-purple-400 hover:bg-purple-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 size={12} /> Close
                            </button>
                          )}
                          {(po.status === "DRAFT" || po.status === "SENT" || po.status === "PARTIALLY_RECEIVED") && (
                            <button onClick={(e) => { e.stopPropagation(); handleCancel(po.id); }}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider flex items-center gap-1">
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
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
          <p className="text-xs text-white/30">{poData.count} purchase orders</p>
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

      {/* Create/Edit Modal */}
      {showForm && (
        <POFormModal
          editingPo={editingPo}
          formData={formData}
          itemsList={itemsData?.results || []}
          locationsList={locations}
          contactsList={contacts}
          onSave={editingPo ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditingPo(null); setFormData(null); }}
          loading={actionLoading}
        />
      )}

      {/* Receive Modal */}
      {showReceive && (
        <ReceiveModal
          po={showReceive}
          onReceive={handleReceive}
          onClose={() => setShowReceive(null)}
          loading={actionLoading}
        />
      )}

      {/* Detail Modal */}
      {detailPo && (
        <PODetailModal
          po={detailPo}
          onClose={() => setDetailPo(null)}
          onEdit={openEdit}
          onSend={handleSend}
          onReceive={(p) => { setDetailPo(null); setShowReceive(p); }}
          onClosePO={handleClose}
          onCancel={handleCancel}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white z-50 transition-all ${
          toast.type === "error" ? "bg-red-500/90" : "bg-emerald-500/90"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
