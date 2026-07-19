import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, Plus, X, ChevronDown, Download,
  CheckCircle, XCircle, Send, Ban, FileDown, Loader2,
  History, ClipboardList, Activity, FileText, ArrowUpDown, Printer,
  Eye, Edit3, Trash2, IndianRupee, AlertTriangle,
} from "lucide-react";
import {
  useSupplierInvoices,
  useSupplierInvoiceActions,
  useSupplierInvoiceHistory,
} from "../hooks/useSupplierInvoices";
import { fetchGRNs } from "../services/grnService";
import { fetchGRN } from "../services/grnService";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  APPROVED: { label: "Approved", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  POSTED: { label: "Posted", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  PAID: { label: "Paid", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  VOIDED: { label: "Voided", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
};

const PAYMENT_STATUS_CONFIG = {
  UNPAID: { label: "Unpaid", color: "text-amber-400 bg-amber-400/10" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "text-cyan-400 bg-cyan-400/10" },
  PAID: { label: "Paid", color: "text-emerald-400 bg-emerald-400/10" },
};

const InvoiceForm = ({
  isOpen, onClose, purchaseOrders, grns, items,
  suppliers, onSubmit, editInvoice, loading,
}) => {
  const isEdit = !!editInvoice;
  const [form, setForm] = useState({
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: "",
    supplier: "",
    supplier_invoice_number: "",
    currency: "INR",
    exchange_rate: "1.000000",
    purchase_order: "",
    goods_receipts: [],
    discount_amount: "0",
    tax_amount: "0",
    shipping_charges: "0",
    other_charges: "0",
    remarks: "",
    terms: "",
    items: [{ item_id: "", item_description: "", quantity: "1", unit_price: "0", tax_rate: "0", discount_rate: "0", goods_receipt_item: "", remarks: "" }],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editInvoice) {
      const ed = editInvoice;
      setForm({
        invoice_date: ed.invoice_date || new Date().toISOString().split("T")[0],
        due_date: ed.due_date || "",
        supplier: ed.supplier || "",
        supplier_invoice_number: ed.supplier_invoice_number || "",
        currency: ed.currency || "INR",
        exchange_rate: String(Number(ed.exchange_rate) || 1),
        purchase_order: ed.purchase_order || "",
        goods_receipts: ed.goods_receipts || [],
        discount_amount: String(Number(ed.discount_amount) || 0),
        tax_amount: String(Number(ed.tax_amount) || 0),
        shipping_charges: String(Number(ed.shipping_charges) || 0),
        other_charges: String(Number(ed.other_charges) || 0),
        remarks: ed.remarks || "",
        terms: ed.terms || "",
        items: (ed.items || []).length > 0
          ? ed.items.map((i) => ({
              item_id: i.item || i.item_id || "",
              item_description: i.item_description || "",
              quantity: String(Number(i.quantity) || 1),
              unit_price: String(Number(i.unit_price) || 0),
              tax_rate: String(Number(i.tax_rate) || 0),
              discount_rate: String(Number(i.discount_rate) || 0),
              goods_receipt_item: i.goods_receipt_item || "",
              remarks: i.remarks || "",
            }))
          : [{ item_id: "", item_description: "", quantity: "1", unit_price: "0", tax_rate: "0", discount_rate: "0", goods_receipt_item: "", remarks: "" }],
      });
    } else {
      setForm({
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: "",
        supplier: "",
        supplier_invoice_number: "",
        currency: "INR",
        exchange_rate: "1.000000",
        purchase_order: "",
        goods_receipts: [],
        discount_amount: "0",
        tax_amount: "0",
        shipping_charges: "0",
        other_charges: "0",
        remarks: "",
        terms: "",
        items: [{ item_id: "", item_description: "", quantity: "1", unit_price: "0", tax_rate: "0", discount_rate: "0", goods_receipt_item: "", remarks: "" }],
      });
    }
    setError("");
  }, [editInvoice, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setForm((f) => ({
      ...f,
      items: [...f.items, { item_id: "", item_description: "", quantity: "1", unit_price: "0", tax_rate: "0", discount_rate: "0", goods_receipt_item: "", remarks: "" }],
    }));
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

  const handleGrnToggle = (grnId) => {
    setForm((f) => {
      const current = f.goods_receipts.map((g) => (typeof g === "string" ? g : g.id || g));
      const exists = current.includes(grnId);
      return {
        ...f,
        goods_receipts: exists
          ? current.filter((id) => id !== grnId)
          : [...current, grnId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.items.length || form.items.every((i) => !i.item_id && !i.item_description)) {
      setError("At least one item is required.");
      return;
    }

    const data = {
      invoice_date: form.invoice_date || undefined,
      due_date: form.due_date || undefined,
      supplier: form.supplier || undefined,
      supplier_invoice_number: form.supplier_invoice_number,
      currency: form.currency,
      exchange_rate: parseFloat(form.exchange_rate) || 1,
      purchase_order: form.purchase_order || undefined,
      goods_receipts: form.goods_receipts.filter(Boolean),
      discount_amount: parseFloat(form.discount_amount) || 0,
      tax_amount: parseFloat(form.tax_amount) || 0,
      shipping_charges: parseFloat(form.shipping_charges) || 0,
      other_charges: parseFloat(form.other_charges) || 0,
      remarks: form.remarks,
      terms: form.terms,
      items: form.items
        .filter((i) => i.item_id || i.item_description)
        .map((i) => ({
          item_id: i.item_id || undefined,
          item_description: i.item_description || undefined,
          quantity: parseFloat(i.quantity) || 1,
          unit_price: parseFloat(i.unit_price) || 0,
          tax_rate: parseFloat(i.tax_rate) || 0,
          discount_rate: parseFloat(i.discount_rate) || 0,
          goods_receipt_item: i.goods_receipt_item || undefined,
          remarks: i.remarks,
        })),
    };

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Edit Supplier Invoice" : "New Supplier Invoice"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Invoice Date</label>
                <input type="date" value={form.invoice_date}
                  onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Due Date</label>
                <input type="date" value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Supplier Invoice #</label>
                <input type="text" value={form.supplier_invoice_number} placeholder="Vendor's invoice ref"
                  onChange={(e) => setForm({ ...form, supplier_invoice_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Supplier</label>
                <select value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50">
                  <option value="" className="bg-zinc-900">Select supplier</option>
                  {(suppliers || []).map((s) => (
                    <option key={s.id} value={s.id} className="bg-zinc-900">{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Currency</label>
                <select value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50">
                  {["INR", "USD", "EUR", "GBP", "AED"].map((c) => (
                    <option key={c} value={c} className="bg-zinc-900">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Exchange Rate</label>
                <input type="number" step="0.000001" value={form.exchange_rate}
                  onChange={(e) => setForm({ ...form, exchange_rate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Purchase Order</label>
                <select value={form.purchase_order}
                  onChange={(e) => setForm({ ...form, purchase_order: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50">
                  <option value="" className="bg-zinc-900">Select PO (optional)</option>
                  {(purchaseOrders || []).map((po) => (
                    <option key={po.id} value={po.id} className="bg-zinc-900">{po.order_number} — {po.supplier_name || po.supplier_name_display}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">GRNs</label>
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 max-h-24 overflow-y-auto">
                  {(grns || []).length === 0 ? (
                    <span className="text-xs text-white/30">No GRNs available</span>
                  ) : (
                    grns.map((g) => (
                      <label key={g.id} className="flex items-center gap-2 py-0.5 cursor-pointer">
                        <input type="checkbox" checked={(form.goods_receipts || []).includes(g.id)}
                          onChange={() => handleGrnToggle(g.id)}
                          className="rounded border-white/20 bg-white/5" />
                        <span className="text-xs text-white/70">{g.grn_number}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Discount</label>
                <input type="number" step="0.0001" value={form.discount_amount}
                  onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Tax</label>
                <input type="number" step="0.0001" value={form.tax_amount}
                  onChange={(e) => setForm({ ...form, tax_amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Shipping</label>
                <input type="number" step="0.0001" value={form.shipping_charges}
                  onChange={(e) => setForm({ ...form, shipping_charges: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Other Charges</label>
                <input type="number" step="0.0001" value={form.other_charges}
                  onChange={(e) => setForm({ ...form, other_charges: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/50">Line Items</label>
                <button type="button" onClick={handleAddItem}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/20">
                  <Plus size={12} /> Add Item
                </button>
              </div>

              <div className="space-y-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">Item #{idx + 1}</span>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded hover:bg-red-500/10 text-red-400/60 hover:text-red-400">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-white/40 mb-1">Item</label>
                        <select value={item.item_id}
                          onChange={(e) => handleItemChange(idx, "item_id", e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500/50">
                          <option value="" className="bg-zinc-900">Select item</option>
                          {(items || []).map((i) => (
                            <option key={i.id} value={i.id} className="bg-zinc-900">{i.item_code || i.item_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-white/40 mb-1">Description</label>
                        <input type="text" value={item.item_description}
                          onChange={(e) => handleItemChange(idx, "item_description", e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500/50"
                          placeholder="Or type description" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-white/40 mb-1">Qty</label>
                        <input type="number" step="any" value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-white/40 mb-1">Unit Price</label>
                        <input type="number" step="0.0001" value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, "unit_price", e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-white/40 mb-1">Tax %</label>
                        <input type="number" step="0.01" value={item.tax_rate}
                          onChange={(e) => handleItemChange(idx, "tax_rate", e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-white/40 mb-1">Discount %</label>
                        <input type="number" step="0.01" value={item.discount_rate}
                          onChange={(e) => handleItemChange(idx, "discount_rate", e.target.value)}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500/50" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-white/40 mb-1">Remarks</label>
                      <input type="text" value={item.remarks}
                        onChange={(e) => handleItemChange(idx, "remarks", e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500/50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Remarks</label>
              <textarea value={form.remarks} rows={2}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {isEdit ? "Update Invoice" : "Create Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PaymentForm = ({ isOpen, onClose, invoice, onRecordPayment, loading }) => {
  const [form, setForm] = useState({ amount: "", payment_method: "Bank Transfer", reference: "", remarks: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && invoice) {
      setForm({
        amount: String(Number(invoice.outstanding_amount) || 0),
        payment_method: "Bank Transfer",
        reference: "",
        remarks: "",
      });
      setError("");
    }
  }, [isOpen, invoice]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (amt > parseFloat(invoice.outstanding_amount)) {
      setError(`Amount cannot exceed outstanding ₹${invoice.outstanding_amount}`);
      return;
    }
    onRecordPayment({
      amount: amt,
      payment_method: form.payment_method,
      reference: form.reference,
      remarks: form.remarks,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Record Payment</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5">
            <span className="text-sm text-white/60">Outstanding</span>
            <span className="text-lg font-bold text-white">₹{parseFloat(invoice.outstanding_amount || 0).toLocaleString()}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Amount</label>
            <input type="number" step="0.01" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Payment Method</label>
            <select value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50">
              {["Bank Transfer", "UPI", "Cash", "Card", "Net Banking", "Cheque", "Other"].map((m) => (
                <option key={m} value={m} className="bg-zinc-900">{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Reference</label>
            <input type="text" value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Remarks</label>
            <textarea value={form.remarks} rows={2}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DetailModal = ({ invoice, isOpen, onClose, onAction, historyData, loading, userRole }) => {
  const [activeTab, setActiveTab] = useState("items");

  if (!isOpen || !invoice) return null;

  const canSubmit = invoice.status === "DRAFT";
  const canApprove = invoice.status === "PENDING_APPROVAL";
  const canPost = invoice.status === "APPROVED";
  const canPay = invoice.status === "POSTED" || invoice.status === "PARTIALLY_PAID";
  const canCancel = ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(invoice.status);
  const canVoid = ["POSTED", "PARTIALLY_PAID", "PAID"].includes(invoice.status);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{invoice.invoice_number}</h2>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_CONFIG[invoice.status]?.color || "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
              {STATUS_CONFIG[invoice.status]?.label || invoice.status}
            </span>
            {invoice.payment_status && (
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${PAYMENT_STATUS_CONFIG[invoice.payment_status]?.color || "text-gray-400 bg-gray-400/10"}`}>
                {PAYMENT_STATUS_CONFIG[invoice.payment_status]?.label || invoice.payment_status}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
          {canSubmit && (
            <button onClick={() => onAction("submit")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/20">
              <Send size={12} /> Submit
            </button>
          )}
          {canApprove && (
            <button onClick={() => onAction("approve")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/20">
              <CheckCircle size={12} /> Approve
            </button>
          )}
          {canPost && (
            <button onClick={() => onAction("post")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs hover:bg-indigo-500/20">
              <ClipboardList size={12} /> Post
            </button>
          )}
          {canPay && (
            <button onClick={() => onAction("payment")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20">
              <IndianRupee size={12} /> Record Payment
            </button>
          )}
          {canCancel && (
            <button onClick={() => onAction("cancel")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20">
              <XCircle size={12} /> Cancel
            </button>
          )}
          {canVoid && (
            <button onClick={() => onAction("void")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs hover:bg-rose-500/20">
              <Ban size={12} /> Void
            </button>
          )}
          <button onClick={() => onAction("print")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10">
            <Printer size={12} /> Print
          </button>
        </div>

        <div className="flex border-b border-white/5">
          {[
            { key: "items", label: "Items" },
            { key: "details", label: "Details" },
            { key: "history", label: "History" },
            { key: "attachments", label: "Attachments" },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "text-blue-400 border-blue-400"
                  : "text-white/40 border-transparent hover:text-white/60"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "items" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-white/40 border-b border-white/10">
                  <th className="text-left py-2 pr-2">Item</th>
                  <th className="text-right px-2">Qty</th>
                  <th className="text-right px-2">Rate</th>
                  <th className="text-right px-2">Tax %</th>
                  <th className="text-right px-2">Disc %</th>
                  <th className="text-right pl-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-white/5">
                    <td className="py-2.5 pr-2 text-white">
                      <span className="font-medium">{item.item_code || item.item_name || "—"}</span>
                      {item.item_description && (
                        <span className="text-xs text-white/40 ml-2">{item.item_description}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right text-white/70">{Number(item.quantity).toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-right text-white/70">{Number(item.unit_price).toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-right text-white/70">{item.tax_rate}%</td>
                    <td className="py-2.5 px-2 text-right text-white/70">{item.discount_rate}%</td>
                    <td className="py-2.5 pl-2 text-right text-white font-medium">{Number(item.line_total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-sm border-t border-white/20">
                  <td colSpan="4"></td>
                  <td className="text-right py-2 text-white/50">Subtotal:</td>
                  <td className="text-right py-2 text-white font-bold">{Number(invoice.subtotal).toLocaleString()}</td>
                </tr>
                {Number(invoice.discount_amount) > 0 && (
                  <tr>
                    <td colSpan="4"></td>
                    <td className="text-right py-1 text-white/50">Discount:</td>
                    <td className="text-right py-1 text-red-400">-{Number(invoice.discount_amount).toLocaleString()}</td>
                  </tr>
                )}
                {Number(invoice.tax_amount) > 0 && (
                  <tr>
                    <td colSpan="4"></td>
                    <td className="text-right py-1 text-white/50">Tax:</td>
                    <td className="text-right py-1 text-amber-400">{Number(invoice.tax_amount).toLocaleString()}</td>
                  </tr>
                )}
                {Number(invoice.shipping_charges) > 0 && (
                  <tr>
                    <td colSpan="4"></td>
                    <td className="text-right py-1 text-white/50">Shipping:</td>
                    <td className="text-right py-1 text-white/70">{Number(invoice.shipping_charges).toLocaleString()}</td>
                  </tr>
                )}
                {Number(invoice.other_charges) > 0 && (
                  <tr>
                    <td colSpan="4"></td>
                    <td className="text-right py-1 text-white/50">Other:</td>
                    <td className="text-right py-1 text-white/70">{Number(invoice.other_charges).toLocaleString()}</td>
                  </tr>
                )}
                <tr className="text-sm border-t border-white/20">
                  <td colSpan="4"></td>
                  <td className="text-right py-2 text-white/50">Grand Total:</td>
                  <td className="text-right py-2 text-white font-bold text-lg">{Number(invoice.grand_total).toLocaleString()}</td>
                </tr>
                {invoice.payment_status !== "PAID" && (
                  <tr>
                    <td colSpan="4"></td>
                    <td className="text-right py-2 text-white/50">Outstanding:</td>
                    <td className="text-right py-2 text-emerald-400 font-bold">{Number(invoice.outstanding_amount).toLocaleString()}</td>
                  </tr>
                )}
              </tfoot>
            </table>
          )}

          {activeTab === "details" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Invoice Date</p>
                <p className="text-sm text-white">{invoice.invoice_date}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Due Date</p>
                <p className="text-sm text-white">{invoice.due_date || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Supplier</p>
                <p className="text-sm text-white">{invoice.supplier_display || invoice.supplier_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Supplier Invoice #</p>
                <p className="text-sm text-white">{invoice.supplier_invoice_number || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Currency</p>
                <p className="text-sm text-white">{invoice.currency}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Exchange Rate</p>
                <p className="text-sm text-white">{invoice.exchange_rate}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">PO Number</p>
                <p className="text-sm text-white">{invoice.po_number || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Payment Status</p>
                <p className={`text-sm ${invoice.payment_status === "PAID" ? "text-emerald-400" : invoice.payment_status === "PARTIALLY_PAID" ? "text-cyan-400" : "text-amber-400"}`}>
                  {invoice.payment_status}
                </p>
              </div>
              {invoice.approved_by && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Approved By</p>
                  <p className="text-sm text-white">{invoice.approved_by_name}</p>
                </div>
              )}
              {invoice.posted_by && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Posted By</p>
                  <p className="text-sm text-white">{invoice.posted_by_name}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-2">
              {(!historyData || historyData.length === 0) ? (
                <p className="text-sm text-white/40">No history entries yet.</p>
              ) : (
                historyData.map((entry, idx) => (
                  <div key={entry.id || idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <Activity size={14} className="text-blue-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{entry.action}</span>
                        <span className="text-xs text-white/40">
                          {entry.from_status && `${entry.from_status} → ${entry.to_status}`}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">
                        {entry.performed_by_name && `by ${entry.performed_by_name} `}
                        {entry.timestamp && new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.remarks && (
                        <p className="text-xs text-white/50 mt-1 italic">{entry.remarks}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "attachments" && (
            <div>
              {(invoice.attachments || []).length === 0 ? (
                <p className="text-sm text-white/40">No attachments yet.</p>
              ) : (
                <div className="space-y-2">
                  {invoice.attachments.map((att, idx) => (
                    <div key={att.id || idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <FileText size={14} className="text-blue-400" />
                      <span className="text-sm text-white">{att.file_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SupplierInvoiceList = () => {
  const [filters, setFilters] = useState({ page: 1, page_size: 20, search: "", status: "" });
  const { invoices, count, loading, error, refetch } = useSupplierInvoices(filters);
  const actions = useSupplierInvoiceActions();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [historyData, setHistoryData] = useState([]);

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [grns, setGrns] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const totalPages = Math.ceil((count || 0) / (filters.page_size || 20));

  useEffect(() => {
    import("../services/purchaseOrderService").then((mod) => {
      const svc = mod.purchaseOrderService || mod.default;
      if (svc && svc.list) {
        svc.list({ page_size: 100 }).then((res) => {
          setPurchaseOrders(res.data.results || []);
        }).catch(() => {});
      }
    });
    fetchGRNs({ status__in: "RECEIVED,COMPLETED", page_size: 100 }).then((res) => {
      setGrns(res.data.results || []);
    }).catch(() => {});
    import("../services/itemService").then((mod) => {
      mod.fetchItems({ page_size: 100 }).then((res) => {
        setItems(res.data.results || []);
      }).catch(() => {});
    });
    import("axios").then((mod) => {
      const api = mod.default || mod;
      api.get("/api/contacts/?page_size=500").then((res) => {
        setSuppliers(res.data?.results || res.data || []);
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const handleAction = async (action, data) => {
    if (!selectedInvoice) return;

    let result;
    switch (action) {
      case "submit":
        result = await actions.submitInvoice(selectedInvoice.id);
        break;
      case "approve":
        result = await actions.approveInvoice(selectedInvoice.id);
        break;
      case "post":
        result = await actions.postInvoice(selectedInvoice.id);
        break;
      case "payment":
        result = await actions.recordPayment(selectedInvoice.id, data);
        break;
      case "cancel":
        result = await actions.cancelInvoice(selectedInvoice.id);
        break;
      case "void":
        result = await actions.voidInvoice(selectedInvoice.id);
        break;
      case "print":
        result = await actions.printInvoice(selectedInvoice.id);
        break;
      default:
        return;
    }

    if (result && result.success) {
      setSelectedInvoice(result.data || selectedInvoice);
      refetch();
      if (["submit", "approve", "post", "cancel", "void"].includes(action)) {
        setShowDetail(false);
      }
    }
  };

  const openDetail = async (inv) => {
    setSelectedInvoice(inv);
    setShowDetail(true);
    try {
      const res = await import("../services/supplierInvoiceService").then(
        (mod) => mod.fetchSupplierInvoiceHistory(inv.id)
      );
      setHistoryData(res.data || []);
    } catch {
      setHistoryData([]);
    }
  };

  const openPayment = (inv) => {
    setSelectedInvoice(inv);
    setShowPayment(true);
  };

  const handleCreate = async (data) => {
    const result = await actions.createInvoice(data);
    if (result.success) {
      setShowForm(false);
      setEditInvoice(null);
      refetch();
    }
  };

  const handleUpdate = async (data) => {
    if (!editInvoice) return;
    const result = await actions.updateInvoice(editInvoice.id, data);
    if (result.success) {
      setShowForm(false);
      setEditInvoice(null);
      refetch();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    const result = await actions.deleteInvoice(id);
    if (result.success) refetch();
  };

  const handleExport = async () => {
    await actions.exportInvoices({ ...filters, export_format: "xlsx" });
  };

  const handleSearch = () => {
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Supplier Invoices</h1>
          <p className="text-sm text-white/40 mt-1">Manage purchase bills and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10">
            <FileDown size={14} /> Export
          </button>
          <button onClick={() => { setEditInvoice(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search invoices..." value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50" />
        </div>
        <select value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setFilters((f) => ({ ...f, status: e.target.value, page: 1 })); }}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50">
          <option value="" className="bg-zinc-900">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key} className="bg-zinc-900">{cfg.label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Supplier</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Amount</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Outstanding</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Payment</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto text-white/30" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-red-400 text-sm">{error}</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-white/30 text-sm">No invoices found</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] cursor-pointer" onClick={() => openDetail(inv)}>
                    <td className="px-4 py-3 text-white font-medium">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-white/70">{inv.supplier_display || inv.supplier_name || "—"}</td>
                    <td className="px-4 py-3 text-white/50">{inv.invoice_date}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">{Number(inv.grand_total).toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      inv.payment_status === "PAID" ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {Number(inv.outstanding_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_CONFIG[inv.status]?.color || "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {STATUS_CONFIG[inv.status]?.label || inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${PAYMENT_STATUS_CONFIG[inv.payment_status]?.color || "text-gray-400 bg-gray-400/10"}`}>
                        {PAYMENT_STATUS_CONFIG[inv.payment_status]?.label || inv.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setEditInvoice(inv); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
                          <Edit3 size={14} />
                        </button>
                        {(inv.status === "POSTED" || inv.status === "PARTIALLY_PAID") && (
                          <button onClick={() => openPayment(inv)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400/60 hover:text-emerald-400">
                            <IndianRupee size={14} />
                          </button>
                        )}
                        {inv.status === "DRAFT" && (
                          <button onClick={() => handleDelete(inv.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.02]">
            <span className="text-xs text-white/30">{count || 0} total invoices</span>
            <div className="flex items-center gap-2">
              <button disabled={filters.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                className="px-3 py-1.5 rounded bg-white/5 text-white/60 text-xs hover:bg-white/10 disabled:opacity-30">
                Previous
              </button>
              <span className="text-xs text-white/40">Page {filters.page || 1} of {totalPages}</span>
              <button disabled={(filters.page || 1) >= totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                className="px-3 py-1.5 rounded bg-white/5 text-white/60 text-xs hover:bg-white/10 disabled:opacity-30">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <InvoiceForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditInvoice(null); }}
        purchaseOrders={purchaseOrders}
        grns={grns}
        items={items}
        suppliers={suppliers}
        editInvoice={editInvoice}
        onSubmit={editInvoice ? handleUpdate : handleCreate}
        loading={actions.loading}
      />

      <DetailModal
        invoice={selectedInvoice}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onAction={(action) => {
          if (action === "payment") {
            setShowDetail(false);
            setShowPayment(true);
          } else {
            handleAction(action);
          }
        }}
        historyData={historyData}
        loading={actions.loading}
      />

      <PaymentForm
        isOpen={showPayment}
        onClose={() => { setShowPayment(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
        onRecordPayment={(data) => {
          handleAction("payment", data);
          setShowPayment(false);
        }}
        loading={actions.loading}
      />
    </div>
  );
};

export default SupplierInvoiceList;
