import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, Plus, X, ChevronDown, Download,
  CheckCircle, XCircle, Send, Ban, FileDown, Loader2,
  History, ClipboardList, Activity, FileText, ArrowUpDown, Printer,
  Eye, Edit3, Trash2,
} from "lucide-react";
import axios from "axios";
import { usePurchaseReturns, usePurchaseReturn, usePurchaseReturnActions, usePurchaseReturnHistory } from "../hooks/usePurchaseReturns";
import { purchaseReturnService } from "../services/purchaseReturnService";
import purchaseOrderService from "../services/purchaseOrderService";
import { fetchGRNs } from "../services/grnService";
import { fetchSupplierInvoices } from "../services/supplierInvoiceService";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  APPROVED: { label: "Approved", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  REJECTED: { label: "Rejected", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  RETURNED: { label: "Returned", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  COMPLETED: { label: "Completed", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const PurchaseReturnForm = ({ isOpen, onClose, suppliers, items, purchaseOrders, goodsReceipts, supplierInvoices, onSubmit, editPR, loading }) => {
  const isEdit = !!editPR;
  const [form, setForm] = useState({
    return_number: "",
    return_date: new Date().toISOString().split("T")[0],
    supplier: "",
    purchase_order: "",
    goods_receipt: "",
    supplier_invoice: "",
    return_reason: "",
    items: [{ item: "", return_quantity: "", damaged_quantity: "", unit_cost: "", tax_rate: "", goods_receipt_item: "", received_quantity: "" }],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editPR) {
      const ed = editPR;
      setForm({
        return_number: ed.return_number || "",
        return_date: ed.return_date || new Date().toISOString().split("T")[0],
        supplier: ed.supplier || "",
        purchase_order: ed.purchase_order || "",
        goods_receipt: ed.goods_receipt || "",
        supplier_invoice: ed.supplier_invoice || "",
        return_reason: ed.return_reason || "",
        items: (ed.items || []).length > 0
          ? ed.items.map((i) => ({
              item: i.item || i.item_id || "",
              return_quantity: String(Number(i.return_quantity) || 0),
              damaged_quantity: String(Number(i.damaged_quantity) || 0),
              unit_cost: String(Number(i.unit_cost) || 0),
              tax_rate: String(Number(i.tax_rate) || 0),
              goods_receipt_item: i.goods_receipt_item || "",
              received_quantity: String(Number(i.received_quantity) || 0),
            }))
          : [{ item: "", return_quantity: "", damaged_quantity: "", unit_cost: "", tax_rate: "", goods_receipt_item: "", received_quantity: "" }],
      });
    } else {
      setForm({
        return_number: "",
        return_date: new Date().toISOString().split("T")[0],
        supplier: "",
        purchase_order: "",
        goods_receipt: "",
        supplier_invoice: "",
        return_reason: "",
        items: [{ item: "", return_quantity: "", damaged_quantity: "", unit_cost: "", tax_rate: "", goods_receipt_item: "", received_quantity: "" }],
      });
    }
    setError("");
  }, [editPR, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { item: "", return_quantity: "", damaged_quantity: "", unit_cost: "", tax_rate: "", goods_receipt_item: "", received_quantity: "" }] }));
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

    if (!form.supplier) {
      setError("Please select a supplier.");
      return;
    }

    const validItems = form.items.filter((i) => i.item && Number(i.return_quantity) > 0);
    if (validItems.length === 0) {
      setError("Please add at least one item with return quantity > 0.");
      return;
    }

    const payload = {
      return_number: form.return_number || undefined,
      return_date: form.return_date,
      supplier: form.supplier,
      purchase_order: form.purchase_order || undefined,
      goods_receipt: form.goods_receipt || undefined,
      supplier_invoice: form.supplier_invoice || undefined,
      return_reason: form.return_reason || undefined,
      items: validItems.map((i) => ({
        item: i.item,
        return_quantity: Number(i.return_quantity),
        damaged_quantity: Number(i.damaged_quantity) || 0,
        unit_cost: Number(i.unit_cost) || 0,
        tax_rate: Number(i.tax_rate) || 0,
        goods_receipt_item: i.goods_receipt_item || undefined,
        received_quantity: i.received_quantity ? Number(i.received_quantity) : undefined,
      })),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">{isEdit ? "Edit Purchase Return" : "New Purchase Return"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Return Number</label>
              <input
                type="text"
                value={form.return_number}
                onChange={(e) => setForm((f) => ({ ...f, return_number: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Return Date</label>
              <input
                type="date"
                value={form.return_date}
                onChange={(e) => setForm((f) => ({ ...f, return_date: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Supplier</label>
              <select
                value={form.supplier}
                onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                disabled={isEdit}
              >
                <option value="">Select Supplier...</option>
                {(suppliers || []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name || s.supplier_name || s.contact_name || "Unknown"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Purchase Order</label>
              <select
                value={form.purchase_order}
                onChange={(e) => setForm((f) => ({ ...f, purchase_order: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="">Select PO...</option>
                {(purchaseOrders || []).map((po) => (
                  <option key={po.id} value={po.id}>{po.order_number || po.po_number || `PO #${po.id}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Goods Receipt</label>
              <select
                value={form.goods_receipt}
                onChange={(e) => setForm((f) => ({ ...f, goods_receipt: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="">Select GRN...</option>
                {(goodsReceipts || []).map((grn) => (
                  <option key={grn.id} value={grn.id}>{grn.grn_number || `GRN #${grn.id}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Supplier Invoice</label>
              <select
                value={form.supplier_invoice}
                onChange={(e) => setForm((f) => ({ ...f, supplier_invoice: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="">Select Invoice...</option>
                {(supplierInvoices || []).map((si) => (
                  <option key={si.id} value={si.id}>{si.invoice_number || `SI #${si.id}`}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Return Reason</label>
            <textarea
              value={form.return_reason}
              onChange={(e) => setForm((f) => ({ ...f, return_reason: e.target.value }))}
              className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Items</label>
              <button type="button" onClick={handleAddItem} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-black/30 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40 font-medium">Item #{idx + 1}</span>
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-300">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <select
                        value={item.item}
                        onChange={(e) => handleItemChange(idx, "item", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="">Select...</option>
                        {(items || []).map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.item_code || i.item_name || i.name || "Unknown"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Return Qty"
                        value={item.return_quantity}
                        onChange={(e) => handleItemChange(idx, "return_quantity", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        min="0"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Damaged Qty"
                        value={item.damaged_quantity}
                        onChange={(e) => handleItemChange(idx, "damaged_quantity", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        min="0"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Unit Cost"
                        value={item.unit_cost}
                        onChange={(e) => handleItemChange(idx, "unit_cost", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Tax Rate %"
                        value={item.tax_rate}
                        onChange={(e) => handleItemChange(idx, "tax_rate", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Received Qty"
                        value={item.received_quantity}
                        onChange={(e) => handleItemChange(idx, "received_quantity", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        min="0"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="GRN Item ID"
                        value={item.goods_receipt_item}
                        onChange={(e) => handleItemChange(idx, "goods_receipt_item", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-zinc-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Update Purchase Return" : "Create Purchase Return"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PurchaseReturnDetail = ({ pr, onClose, onAction, history, actionLoading }) => {
  const [tab, setTab] = useState("items");

  const canSubmit = pr?.status === "DRAFT";
  const canApprove = pr?.status === "PENDING_APPROVAL";
  const canReject = pr?.status === "PENDING_APPROVAL";
  const canReturnToSupplier = pr?.status === "APPROVED";
  const canComplete = pr?.status === "RETURNED";
  const canCancel = ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(pr?.status);

  if (!pr) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{pr.return_number}</h2>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${(STATUS_CONFIG[pr.status] || STATUS_CONFIG.DRAFT).color}`}>
              {(STATUS_CONFIG[pr.status] || STATUS_CONFIG.DRAFT).label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canSubmit && <ActionButton icon={Send} label="Submit" onClick={() => onAction("submit", pr.id)} loading={actionLoading} color="blue" />}
            {canApprove && <ActionButton icon={CheckCircle} label="Approve" onClick={() => onAction("approve", pr.id)} loading={actionLoading} color="emerald" />}
            {canReject && <ActionButton icon={XCircle} label="Reject" onClick={() => onAction("reject", pr.id)} loading={actionLoading} color="red" />}
            {canReturnToSupplier && <ActionButton icon={Send} label="Return to Supplier" onClick={() => onAction("return_to_supplier", pr.id)} loading={actionLoading} color="blue" />}
            {canComplete && <ActionButton icon={CheckCircle} label="Complete" onClick={() => onAction("complete", pr.id)} loading={actionLoading} color="green" />}
            {canCancel && <ActionButton icon={Ban} label="Cancel" onClick={() => onAction("cancel", pr.id)} loading={actionLoading} color="red" />}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <InfoField label="Return Number" value={pr.return_number} />
            <InfoField label="Return Date" value={pr.return_date} />
            <InfoField label="Supplier" value={pr.supplier_name || pr.supplier_display || "N/A"} />
            <InfoField label="Purchase Order" value={pr.purchase_order_number || pr.purchase_order || "N/A"} />
            <InfoField label="Goods Receipt" value={pr.goods_receipt_number || pr.goods_receipt || "N/A"} />
            <InfoField label="Supplier Invoice" value={pr.supplier_invoice_number || pr.supplier_invoice || "N/A"} />
            <InfoField label="Return Reason" value={pr.return_reason || "—"} />
            <InfoField label="Created By" value={pr.created_by_name || "System"} />
          </div>

          {(pr.subtotal !== undefined || pr.total_amount !== undefined) && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <SummaryCard label="Subtotal" value={pr.subtotal || 0} color="blue" />
              <SummaryCard label="Tax Amount" value={pr.tax_amount || 0} color="amber" />
              <SummaryCard label="Total Amount" value={pr.total_amount || 0} color="emerald" />
            </div>
          )}

          <div className="mb-4 border-b border-zinc-800">
            <div className="flex gap-4">
              {[
                { key: "items", label: "Items", icon: ClipboardList },
                { key: "details", label: "Details", icon: FileText },
                { key: "history", label: "History", icon: History },
                { key: "attachments", label: "Attachments", icon: FileText },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.key ? "border-blue-500 text-blue-400" : "border-transparent text-white/40 hover:text-white/60"
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === "items" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-medium uppercase tracking-wider text-white/30 border-b border-zinc-800">
                    <th className="text-left py-2 px-3">Item Code</th>
                    <th className="text-left py-2 px-3">Item Name</th>
                    <th className="text-right py-2 px-3">Return Qty</th>
                    <th className="text-right py-2 px-3">Damaged Qty</th>
                    <th className="text-right py-2 px-3">Unit Cost</th>
                    <th className="text-right py-2 px-3">Tax Rate</th>
                    <th className="text-right py-2 px-3">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(pr.items || []).map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 text-sm text-white/80">
                      <td className="py-2.5 px-3 text-white/60">{item.item_code || "—"}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-white font-medium">{item.item_name || "Unknown"}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-400 font-medium">{item.return_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400">{item.damaged_quantity || 0}</td>
                      <td className="py-2.5 px-3 text-right text-white/80">{item.unit_cost || 0}</td>
                      <td className="py-2.5 px-3 text-right text-white/60">{item.tax_rate || 0}%</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{item.total_amount || 0}</td>
                    </tr>
                  ))}
                  {(!pr.items || pr.items.length === 0) && (
                    <tr><td colSpan={7} className="py-8 text-center text-white/30 text-sm">No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "details" && (
            <div className="grid grid-cols-3 gap-4">
              <InfoField label="Return Number" value={pr.return_number} />
              <InfoField label="Return Date" value={pr.return_date} />
              <InfoField label="Supplier" value={pr.supplier_name || pr.supplier_display || "N/A"} />
              <InfoField label="Purchase Order" value={pr.purchase_order_number || pr.purchase_order || "N/A"} />
              <InfoField label="Goods Receipt" value={pr.goods_receipt_number || pr.goods_receipt || "N/A"} />
              <InfoField label="Supplier Invoice" value={pr.supplier_invoice_number || pr.supplier_invoice || "N/A"} />
              <InfoField label="Return Reason" value={pr.return_reason || "—"} />
              <InfoField label="Subtotal" value={pr.subtotal || 0} />
              <InfoField label="Tax Amount" value={pr.tax_amount || 0} />
              <InfoField label="Total Amount" value={pr.total_amount || 0} />
              <InfoField label="Status" value={(STATUS_CONFIG[pr.status] || STATUS_CONFIG.DRAFT).label} />
              <InfoField label="Created By" value={pr.created_by_name || "System"} />
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-0">
              {history.length === 0 && <p className="text-center py-8 text-white/30 text-sm">No history records</p>}
              {history.map((entry, idx) => (
                <div key={entry.id || idx} className="flex gap-3 py-3 border-b border-zinc-800/50 last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{entry.action_display || entry.action}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {entry.performed_by_name || "System"} — {entry.from_status || ""}{entry.from_status && entry.to_status ? " → " : ""}{entry.to_status || ""}
                      {entry.timestamp ? ` — ${new Date(entry.timestamp).toLocaleString()}` : ""}
                    </p>
                    {entry.remarks && <p className="text-xs text-white/30 mt-0.5">{entry.remarks}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "attachments" && (
            <div className="text-center py-8 text-white/30 text-sm">
              {(pr.attachments || []).length === 0 ? "No attachments" : pr.attachments.map((a) => (
                <div key={a.id} className="flex items-center gap-2 py-2">
                  <FileText size={14} className="text-blue-400" />
                  <span className="text-sm text-white/60">{a.file_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, loading, color }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
      color === "emerald" ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30" :
      color === "blue" ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30" :
      color === "red" ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" :
      color === "green" ? "bg-green-600/20 text-green-400 hover:bg-green-600/30" :
      "bg-zinc-800 text-white/60 hover:bg-zinc-700"
    }`}
  >
    {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
    {label}
  </button>
);

const InfoField = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-black/30 border border-zinc-800">
    <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-1">{label}</p>
    <p className="text-sm text-white font-medium truncate">{value || "—"}</p>
  </div>
);

const SummaryCard = ({ label, value, color }) => (
  <div className={`p-3 rounded-lg border ${
    color === "blue" ? "bg-blue-500/5 border-blue-500/20" :
    color === "emerald" ? "bg-emerald-500/5 border-emerald-500/20" :
    color === "red" ? "bg-red-500/5 border-red-500/20" :
    "bg-amber-500/5 border-amber-500/20"
  }`}>
    <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-1">{label}</p>
    <p className={`text-lg font-bold ${
      color === "blue" ? "text-blue-400" :
      color === "emerald" ? "text-emerald-400" :
      color === "red" ? "text-red-400" :
      "text-amber-400"
    }`}>{String(value)}</p>
  </div>
);

const PurchaseReturnList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPR, setEditPR] = useState(null);
  const [selectedPR, setSelectedPR] = useState(null);
  const pageSize = 20;

  const params = useMemo(() => ({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
  }), [page, search, statusFilter]);

  const { data: purchaseReturns, total, loading, refetch } = usePurchaseReturns(params);
  const { data: prHistory, loading: historyLoading } = usePurchaseReturnHistory(selectedPR?.id);
  const actions = usePurchaseReturnActions();

  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [supplierInvoices, setSupplierInvoices] = useState([]);

  useEffect(() => {
    axios.get("/api/contacts/", { params: { type: "Supplier", page_size: 200 } })
      .then((res) => setSuppliers(res.data.results || res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios.get("/api/inventory/items/", { params: { page_size: 500 } })
      .then((res) => setItems(res.data.results || res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    purchaseOrderService.list({ page_size: 200 })
      .then((res) => setPurchaseOrders(res.data.results || res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchGRNs({ page_size: 200 })
      .then((res) => setGoodsReceipts(res.data.results || res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSupplierInvoices({ page_size: 200 })
      .then((res) => setSupplierInvoices(res.data.results || res.data.data || []))
      .catch(() => {});
  }, []);

  const handleCreate = async (data) => {
    try {
      const res = await purchaseReturnService.create(data);
      setShowForm(false);
      refetch();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || err.message || "Failed to create purchase return";
      alert(msg);
    }
  };

  const handleEdit = async (data) => {
    try {
      const res = await purchaseReturnService.update(editPR.id, data);
      setEditPR(null);
      setShowForm(false);
      refetch();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || err.message || "Failed to update purchase return";
      alert(msg);
    }
  };

  const handleAction = async (action, id) => {
    try {
      switch (action) {
        case "submit": await actions.submit(id); break;
        case "approve": await actions.approve(id); break;
        case "reject": await actions.reject(id); break;
        case "return_to_supplier": await actions.returnToSupplier(id); break;
        case "complete": await actions.complete(id); break;
        case "cancel": await actions.cancel(id); break;
        default: return;
      }
      const updated = await purchaseReturnService.get(id);
      setSelectedPR(updated.data.data || updated.data);
      refetch();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || `Failed to ${action} purchase return`;
      alert(msg);
    }
  };

  const handleExport = () => {
    purchaseReturnService.export("xlsx");
  };

  const openEdit = (pr) => {
    setEditPR(pr);
    setShowForm(true);
  };

  const openDetail = async (pr) => {
    try {
      const response = await purchaseReturnService.get(pr.id);
      setSelectedPR(response.data.data || response.data);
    } catch (err) {
      alert("Failed to load purchase return details");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Purchase Returns</h1>
          <p className="text-sm text-white/40 mt-0.5">Manage returns to suppliers</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white/60 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setEditPR(null); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5">
            <Plus size={14} /> New Purchase Return
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search purchase returns..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-black/40 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-black/30 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-medium uppercase tracking-wider text-white/30 border-b border-zinc-800 bg-black/20">
                <th className="text-left py-3 px-4">Return Number</th>
                <th className="text-left py-3 px-4">Return Date</th>
                <th className="text-left py-3 px-4">Supplier</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Total Amount</th>
                <th className="text-right py-3 px-4">Items</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-400" /></td></tr>
              ) : purchaseReturns.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-white/30 text-sm">No purchase returns found</td></tr>
              ) : (
                purchaseReturns.map((pr) => (
                  <tr
                    key={pr.id}
                    className="border-b border-zinc-800/50 text-sm text-white/80 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => openDetail(pr)}
                  >
                    <td className="py-3 px-4 font-medium text-white">{pr.return_number}</td>
                    <td className="py-3 px-4 text-white/60">{pr.return_date}</td>
                    <td className="py-3 px-4 text-white/60">{pr.supplier_name || pr.supplier_display || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${(STATUS_CONFIG[pr.status] || STATUS_CONFIG.DRAFT).color}`}>
                        {(STATUS_CONFIG[pr.status] || STATUS_CONFIG.DRAFT).label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-white/80 font-medium">{pr.total_amount || 0}</td>
                    <td className="py-3 px-4 text-right text-white/60">{pr.item_count || (pr.items || []).length || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {pr.status === "DRAFT" && (
                          <button onClick={() => openEdit(pr)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-blue-400 transition-colors">
                            <Edit3 size={14} />
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-xs text-white/30">{total} total purchase returns</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white/60 text-xs disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-white/40">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white/60 text-xs disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <PurchaseReturnForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditPR(null); }}
        suppliers={suppliers}
        items={items}
        purchaseOrders={purchaseOrders}
        goodsReceipts={goodsReceipts}
        supplierInvoices={supplierInvoices}
        onSubmit={editPR ? handleEdit : handleCreate}
        editPR={editPR}
        loading={actions.loading}
      />

      {selectedPR && (
        <PurchaseReturnDetail
          pr={selectedPR}
          onClose={() => setSelectedPR(null)}
          onAction={handleAction}
          history={prHistory}
          actionLoading={actions.loading}
        />
      )}
    </div>
  );
};

export default PurchaseReturnList;
