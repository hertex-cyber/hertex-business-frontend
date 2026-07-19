import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, X, Download,
  CheckCircle, XCircle, Send, Ban, FileDown, Loader2,
  History, Activity, FileText, ArrowUpDown,
  Eye, Edit3, Trash2, IndianRupee,
} from "lucide-react";
import axios from "axios";
import { useSupplierPayments, useSupplierPayment, useSupplierPaymentActions, useSupplierPaymentHistory } from "../hooks/useSupplierPayments";
import { fetchSupplierInvoices } from "../services/supplierInvoiceService";
import { purchaseReturnService } from "../services/purchaseReturnService";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  APPROVED: { label: "Approved", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  POSTED: { label: "Posted", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
  COMPLETED: { label: "Completed", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  VOIDED: { label: "Voided", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const InfoField = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-black/30 border border-zinc-800">
    <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-1">{label}</p>
    <p className="text-sm text-white font-medium truncate">{value || "—"}</p>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, loading, color }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
      color === "emerald" ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30" :
      color === "blue" ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30" :
      color === "red" ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" :
      color === "indigo" ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30" :
      "bg-zinc-800 text-white/60 hover:bg-zinc-700"
    }`}
  >
    {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
    {label}
  </button>
);

const PaymentForm = ({ isOpen, onClose, suppliers, invoices, onSubmit, editPM, loading }) => {
  const isEdit = !!editPM;
  const [form, setForm] = useState({
    payment_number: "",
    payment_date: new Date().toISOString().split("T")[0],
    supplier: "",
    payment_method: "Bank Transfer",
    bank_account: "",
    reference_number: "",
    currency: "INR",
    exchange_rate: "1",
    total_amount: "",
    remarks: "",
    allocations: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editPM) {
      const ed = editPM;
      setForm({
        payment_number: ed.payment_number || "",
        payment_date: ed.payment_date || new Date().toISOString().split("T")[0],
        supplier: ed.supplier || "",
        payment_method: ed.payment_method || "Bank Transfer",
        bank_account: ed.bank_account || "",
        reference_number: ed.reference_number || "",
        currency: ed.currency || "INR",
        exchange_rate: String(ed.exchange_rate || 1),
        total_amount: String(ed.total_amount || 0),
        remarks: ed.remarks || "",
        allocations: (ed.allocations || []).map((a) => ({
          supplier_invoice: a.supplier_invoice || "",
          allocated_amount: String(Number(a.allocated_amount) || 0),
          invoice_number: a.invoice_number || "",
          invoice_outstanding: a.invoice_outstanding || 0,
        })),
      });
    } else {
      setForm({
        payment_number: "",
        payment_date: new Date().toISOString().split("T")[0],
        supplier: "",
        payment_method: "Bank Transfer",
        bank_account: "",
        reference_number: "",
        currency: "INR",
        exchange_rate: "1",
        total_amount: "",
        remarks: "",
        allocations: [],
      });
    }
    setError("");
  }, [editPM, isOpen]);

  if (!isOpen) return null;

  const handleAllocationChange = (idx, field, value) => {
    setForm((f) => {
      const newAllocs = [...f.allocations];
      newAllocs[idx] = { ...newAllocs[idx], [field]: value };
      return { ...f, allocations: newAllocs };
    });
  };

  const addAllocation = () => {
    setForm((f) => ({
      ...f,
      allocations: [
        ...f.allocations,
        { supplier_invoice: "", allocated_amount: "", invoice_number: "", invoice_outstanding: 0 },
      ],
    }));
  };

  const removeAllocation = (idx) => {
    setForm((f) => ({
      ...f,
      allocations: f.allocations.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.supplier) { setError("Please select a supplier."); return; }
    if (!form.total_amount || Number(form.total_amount) <= 0) {
      setError("Total amount must be greater than 0."); return;
    }

    const payload = {
      payment_number: form.payment_number || undefined,
      payment_date: form.payment_date,
      supplier: form.supplier,
      payment_method: form.payment_method,
      bank_account: form.bank_account || undefined,
      reference_number: form.reference_number || undefined,
      currency: form.currency,
      exchange_rate: Number(form.exchange_rate) || 1,
      total_amount: Number(form.total_amount),
      remarks: form.remarks || undefined,
      allocations: form.allocations
        .filter((a) => a.supplier_invoice && Number(a.allocated_amount) > 0)
        .map((a) => ({
          supplier_invoice: a.supplier_invoice,
          allocated_amount: Number(a.allocated_amount),
        })),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">{isEdit ? "Edit Payment" : "New Payment"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Payment No.</label>
              <input
                type="text" value={form.payment_number}
                onChange={(e) => setForm((f) => ({ ...f, payment_number: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                placeholder="Auto"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date" value={form.payment_date}
                onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Method</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              >
                {["Bank Transfer", "UPI", "Cash", "Card", "Cheque", "Net Banking", "DD", "Other"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Supplier</label>
              <select
                value={form.supplier}
                onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                disabled={isEdit}
              >
                <option value="">Select...</option>
                {(suppliers || []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name || s.supplier_name || s.contact_name || "Unknown"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Amount</label>
              <input
                type="number" step="0.01" min="0"
                value={form.total_amount}
                onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Bank Account</label>
              <input
                type="text" value={form.bank_account}
                onChange={(e) => setForm((f) => ({ ...f, bank_account: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Reference</label>
              <input
                type="text" value={form.reference_number}
                onChange={(e) => setForm((f) => ({ ...f, reference_number: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Currency</label>
              <input
                type="text" value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Ex. Rate</label>
              <input
                type="number" step="0.000001" min="0"
                value={form.exchange_rate}
                onChange={(e) => setForm((f) => ({ ...f, exchange_rate: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Invoice Allocations</label>
              <button type="button" onClick={addAllocation} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus size={14} /> Add Allocation
              </button>
            </div>
            {form.allocations.map((alloc, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-black/30 border border-zinc-800">
                <select
                  value={alloc.supplier_invoice}
                  onChange={(e) => {
                    const inv = (invoices || []).find((i) => i.id === e.target.value);
                    handleAllocationChange(idx, "supplier_invoice", e.target.value);
                    handleAllocationChange(idx, "invoice_number", inv?.invoice_number || "");
                    handleAllocationChange(idx, "invoice_outstanding", inv?.outstanding_amount || 0);
                  }}
                  className="flex-1 bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">Select invoice...</option>
                  {(invoices || []).filter((inv) => inv.status === "POSTED" || inv.status === "PARTIALLY_PAID").map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} (Due: {inv.outstanding_amount || inv.grand_total})
                    </option>
                  ))}
                </select>
                <input
                  type="number" step="0.01" min="0"
                  placeholder="Amount"
                  value={alloc.allocated_amount}
                  onChange={(e) => handleAllocationChange(idx, "allocated_amount", e.target.value)}
                  className="w-28 bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
                {alloc.invoice_outstanding > 0 && (
                  <span className="text-[10px] text-white/30 w-16 text-right">Out: {alloc.invoice_outstanding}</span>
                )}
                <button type="button" onClick={() => removeAllocation(idx)} className="text-red-400 hover:text-red-300 p-1">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-zinc-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Update Payment" : "Create Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentDetail = ({ pm, onClose, onAction, history, actionLoading }) => {
  const [tab, setTab] = useState("allocations");

  const canSubmit = pm?.status === "DRAFT";
  const canApprove = pm?.status === "PENDING_APPROVAL";
  const canPost = pm?.status === "APPROVED";
  const canCancel = ["DRAFT", "PENDING_APPROVAL"].includes(pm?.status);
  const canVoid = ["APPROVED", "POSTED", "COMPLETED"].includes(pm?.status);

  if (!pm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{pm.payment_number}</h2>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${(STATUS_CONFIG[pm.status] || STATUS_CONFIG.DRAFT).color}`}>
              {(STATUS_CONFIG[pm.status] || STATUS_CONFIG.DRAFT).label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canSubmit && <ActionButton icon={Send} label="Submit" onClick={() => onAction("submit", pm.id)} loading={actionLoading} color="blue" />}
            {canApprove && <ActionButton icon={CheckCircle} label="Approve" onClick={() => onAction("approve", pm.id)} loading={actionLoading} color="emerald" />}
            {canPost && <ActionButton icon={IndianRupee} label="Post" onClick={() => onAction("post", pm.id)} loading={actionLoading} color="indigo" />}
            {canCancel && <ActionButton icon={Ban} label="Cancel" onClick={() => onAction("cancel", pm.id)} loading={actionLoading} color="red" />}
            {canVoid && <ActionButton icon={XCircle} label="Void" onClick={() => onAction("void", pm.id)} loading={actionLoading} color="red" />}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <InfoField label="Payment #" value={pm.payment_number} />
            <InfoField label="Date" value={pm.payment_date} />
            <InfoField label="Supplier" value={pm.supplier_name || pm.supplier_display || "N/A"} />
            <InfoField label="Method" value={pm.payment_method} />
            <InfoField label="Bank Account" value={pm.bank_account || "—"} />
            <InfoField label="Reference" value={pm.reference_number || "—"} />
            <InfoField label="Currency" value={pm.currency} />
            <InfoField label="Exchange Rate" value={pm.exchange_rate} />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-1">Total</p>
              <p className="text-lg font-bold text-blue-400">{pm.total_amount || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-1">Allocated</p>
              <p className="text-lg font-bold text-emerald-400">{pm.allocated_amount || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-1">Unallocated</p>
              <p className={`text-lg font-bold ${Number(pm.unallocated_amount) > 0 ? "text-amber-400" : "text-white/40"}`}>
                {pm.unallocated_amount || 0}
              </p>
            </div>
          </div>

          <div className="mb-4 border-b border-zinc-800">
            <div className="flex gap-4">
              {[
                { key: "allocations", label: "Allocations", icon: IndianRupee },
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

          {tab === "allocations" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-medium uppercase tracking-wider text-white/30 border-b border-zinc-800">
                    <th className="text-left py-2 px-3">Invoice</th>
                    <th className="text-right py-2 px-3">Invoice Total</th>
                    <th className="text-right py-2 px-3">Outstanding</th>
                    <th className="text-right py-2 px-3">Allocated</th>
                    <th className="text-left py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(pm.allocations || []).map((alloc) => (
                    <tr key={alloc.id} className="border-b border-zinc-800/50 text-sm text-white/80">
                      <td className="py-2.5 px-3 text-white font-medium">{alloc.invoice_number || alloc.supplier_invoice}</td>
                      <td className="py-2.5 px-3 text-right">{alloc.invoice_total || "—"}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400">{alloc.invoice_outstanding || "—"}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{alloc.allocated_amount}</td>
                      <td className="py-2.5 px-3 text-white/40">{alloc.remarks || "—"}</td>
                    </tr>
                  ))}
                  {(!pm.allocations || pm.allocations.length === 0) && (
                    <tr><td colSpan={5} className="py-8 text-center text-white/30 text-sm">No allocations</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "details" && (
            <div className="grid grid-cols-3 gap-4">
              <InfoField label="Payment #" value={pm.payment_number} />
              <InfoField label="Date" value={pm.payment_date} />
              <InfoField label="Supplier" value={pm.supplier_name || pm.supplier_display || "N/A"} />
              <InfoField label="Method" value={pm.payment_method} />
              <InfoField label="Bank Account" value={pm.bank_account || "—"} />
              <InfoField label="Reference" value={pm.reference_number || "—"} />
              <InfoField label="Currency" value={pm.currency} />
              <InfoField label="Exchange Rate" value={pm.exchange_rate} />
              <InfoField label="Total Amount" value={pm.total_amount} />
              <InfoField label="Allocated" value={pm.allocated_amount} />
              <InfoField label="Unallocated" value={pm.unallocated_amount} />
              <InfoField label="Status" value={(STATUS_CONFIG[pm.status] || STATUS_CONFIG.DRAFT).label} />
              <InfoField label="Approved By" value={pm.approved_by_name || "—"} />
              <InfoField label="Posted By" value={pm.posted_by_name || "—"} />
              <InfoField label="Completed By" value={pm.completed_by_name || "—"} />
              <InfoField label="Created By" value={pm.created_by_name || "System"} />
              <InfoField label="Remarks" value={pm.remarks || "—"} />
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-0">
              {history.length === 0 && <p className="text-center py-8 text-white/30 text-sm">No history</p>}
              {history.map((entry, idx) => (
                <div key={entry.id || idx} className="flex gap-3 py-3 border-b border-zinc-800/50 last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{entry.action}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {entry.performed_by_name || "System"}
                      {entry.from_status ? ` — ${entry.from_status} → ${entry.to_status}` : ` → ${entry.to_status}`}
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
              {(pm.attachments || []).length === 0 ? "No attachments" : pm.attachments.map((a) => (
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

const SupplierPaymentList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPM, setEditPM] = useState(null);
  const [selectedPM, setSelectedPM] = useState(null);
  const pageSize = 20;

  const params = useMemo(() => ({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
  }), [page, search, statusFilter]);

  const { data: payments, total, loading, refetch } = useSupplierPayments(params);
  const { data: pmDetail, loading: pmLoading } = useSupplierPayment(selectedPM?.id);
  const { data: pmHistory, loading: historyLoading } = useSupplierPaymentHistory(selectedPM?.id);
  const actions = useSupplierPaymentActions();

  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    axios.get("/api/contacts/", { params: { type: "Supplier", page_size: 200 } })
      .then((res) => setSuppliers(res.data.results || res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSupplierInvoices({ page_size: 200, status__in: "POSTED,PARTIALLY_PAID" })
      .then((res) => setInvoices(res.data.results || res.data.data || []))
      .catch(() => {});
  }, []);

  const handleCreate = async (data) => {
    try {
      await actions.createPayment(data);
      setShowForm(false);
      refetch();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed";
      alert(msg);
    }
  };

  const handleEdit = async (data) => {
    try {
      await actions.updatePayment(editPM.id, data);
      setEditPM(null);
      setShowForm(false);
      refetch();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed";
      alert(msg);
    }
  };

  const handleAction = async (action, id) => {
    try {
      switch (action) {
        case "submit": await actions.submit(id); break;
        case "approve": await actions.approve(id); break;
        case "post": await actions.post(id); break;
        case "cancel": await actions.cancel(id); break;
        case "void": await actions.void(id); break;
        default: return;
      }
      refetch();
      if (selectedPM?.id === id) {
        const updated = await fetchSupplierPayment(id);
        setSelectedPM(updated.data);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || `Failed to ${action}`;
      alert(msg);
    }
  };

  const openEdit = (pm) => { setEditPM(pm); setShowForm(true); };
  const openDetail = (pm) => {
    fetchSupplierPayment(pm.id)
      .then((res) => setSelectedPM(res.data))
      .catch(() => alert("Failed to load payment details"));
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Supplier Payments</h1>
          <p className="text-sm text-white/40 mt-0.5">Accounts Payable — manage payments to suppliers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => purchaseReturnService.export("csv")}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white/60 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => { setEditPM(null); setShowForm(true); }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> New Payment
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text" placeholder="Search payments..."
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
                <th className="text-left py-3 px-4">Payment #</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Supplier</th>
                <th className="text-left py-3 px-4">Method</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Total</th>
                <th className="text-right py-3 px-4">Allocated</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-400" /></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-white/30 text-sm">No payments found</td></tr>
              ) : (
                payments.map((pm) => (
                  <tr
                    key={pm.id}
                    className="border-b border-zinc-800/50 text-sm text-white/80 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => openDetail(pm)}
                  >
                    <td className="py-3 px-4 font-medium text-white">{pm.payment_number}</td>
                    <td className="py-3 px-4 text-white/60">{pm.payment_date}</td>
                    <td className="py-3 px-4 text-white/60">{pm.supplier_name || pm.supplier_display || "N/A"}</td>
                    <td className="py-3 px-4 text-white/60">{pm.payment_method}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${(STATUS_CONFIG[pm.status] || STATUS_CONFIG.DRAFT).color}`}>
                        {(STATUS_CONFIG[pm.status] || STATUS_CONFIG.DRAFT).label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{pm.total_amount || 0}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">{pm.allocated_amount || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {pm.status === "DRAFT" && (
                          <button onClick={() => openEdit(pm)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-blue-400 transition-colors">
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
            <p className="text-xs text-white/30">{total} total payments</p>
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

      <PaymentForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditPM(null); }}
        suppliers={suppliers}
        invoices={invoices}
        onSubmit={editPM ? handleEdit : handleCreate}
        editPM={editPM}
        loading={actions.loading}
      />

      {selectedPM && (
        <PaymentDetail
          pm={pmDetail || selectedPM}
          onClose={() => setSelectedPM(null)}
          onAction={handleAction}
          history={pmHistory}
          actionLoading={actions.loading}
        />
      )}
    </div>
  );
};

export default SupplierPaymentList;
