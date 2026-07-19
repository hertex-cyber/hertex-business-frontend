import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, Plus, X, ChevronDown, Download,
  CheckCircle, XCircle, Send, Ban, FileDown, Loader2,
  History, ClipboardList, Activity, FileText, ArrowUpDown, Printer,
  Eye, Edit3, Trash2,
} from "lucide-react";
import { useGRNs, useGRNActions, useGRNHistory } from "../hooks/useGRN";
import { useItems } from "../hooks/useItems";
import purchaseOrderService from "../services/purchaseOrderService";
import { fetchGRN } from "../services/grnService";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  APPROVED: { label: "Approved", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  RECEIVED: { label: "Received", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  COMPLETED: { label: "Completed", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const GRNForm = ({ isOpen, onClose, purchaseOrders, items, onSubmit, editGRN, loading }) => {
  const isEdit = !!editGRN;
  const [form, setForm] = useState({
    purchase_order: "",
    receipt_date: new Date().toISOString().split("T")[0],
    remarks: "",
    items: [{ item_id: "", received_quantity: "", accepted_quantity: "", rejected_quantity: "", damage_quantity: "", remarks: "" }],
  });
  const [error, setError] = useState("");
  const [poItems, setPoItems] = useState([]);

  useEffect(() => {
    if (editGRN) {
      const ed = editGRN;
      setForm({
        purchase_order: ed.purchase_order || "",
        receipt_date: ed.receipt_date || new Date().toISOString().split("T")[0],
        remarks: ed.remarks || "",
        items: (ed.items || []).length > 0
          ? ed.items.map((i) => ({
              item_id: i.item || i.item_id || "",
              purchase_order_item: i.purchase_order_item || "",
              received_quantity: String(Number(i.received_quantity) || 0),
              accepted_quantity: String(Number(i.accepted_quantity) || 0),
              rejected_quantity: String(Number(i.rejected_quantity) || 0),
              damage_quantity: String(Number(i.damage_quantity) || 0),
              remarks: i.remarks || "",
            }))
          : [{ item_id: "", received_quantity: "", accepted_quantity: "", rejected_quantity: "", damage_quantity: "", remarks: "" }],
      });
    } else {
      setForm({
        purchase_order: "",
        receipt_date: new Date().toISOString().split("T")[0],
        remarks: "",
        items: [{ item_id: "", received_quantity: "", accepted_quantity: "", rejected_quantity: "", damage_quantity: "", remarks: "" }],
      });
    }
    setError("");
    setPoItems([]);
  }, [editGRN, isOpen]);

  useEffect(() => {
    if (form.purchase_order) {
      const po = purchaseOrders.find((p) => p.id === form.purchase_order);
      if (po && po.items) {
        setPoItems(po.items);
      } else if (po) {
                purchaseOrderService.list()
                  .then((res) => {
                    const allItems = res.data.results || [];
                    const found = allItems.find((p) => p.id === form.purchase_order);
                    if (found) setPoItems(found.items || []);
                  })
                  .catch(() => {});
      }
    } else {
      setPoItems([]);
    }
  }, [form.purchase_order, purchaseOrders]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { item_id: "", received_quantity: "", accepted_quantity: "", rejected_quantity: "", damage_quantity: "", remarks: "" }] }));
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

  const handlePOChange = (poId) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    setForm((f) => ({
      ...f,
      purchase_order: poId,
      items: po && po.items && po.items.length > 0
        ? po.items.map((i) => ({
            item_id: i.item || i.item_id || "",
            purchase_order_item: i.id || "",
            received_quantity: "",
            accepted_quantity: "",
            rejected_quantity: "",
            damage_quantity: "",
            remarks: "",
          }))
        : [{ item_id: "", received_quantity: "", accepted_quantity: "", rejected_quantity: "", damage_quantity: "", remarks: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.purchase_order) {
      setError("Please select a purchase order.");
      return;
    }

    const validItems = form.items.filter((i) => i.item_id && Number(i.received_quantity) > 0);
    if (validItems.length === 0) {
      setError("Please add at least one item with received quantity > 0.");
      return;
    }

    const payload = {
      purchase_order: form.purchase_order,
      receipt_date: form.receipt_date,
      remarks: form.remarks,
      items: validItems.map((i) => ({
        item_id: i.item_id,
        purchase_order_item: i.purchase_order_item || undefined,
        received_quantity: Number(i.received_quantity),
        accepted_quantity: Number(i.accepted_quantity) || Number(i.received_quantity),
        rejected_quantity: Number(i.rejected_quantity) || 0,
        damage_quantity: Number(i.damage_quantity) || 0,
        remarks: i.remarks || "",
      })),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">{isEdit ? "Edit GRN" : "New Goods Receipt Note"}</h2>
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
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Purchase Order</label>
              <select
                value={form.purchase_order}
                onChange={(e) => handlePOChange(e.target.value)}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                disabled={isEdit}
              >
                <option value="">Select PO...</option>
                {(purchaseOrders || []).filter((po) => ["SENT", "PARTIALLY_RECEIVED"].includes(po.status)).map((po) => (
                  <option key={po.id} value={po.id}>{po.order_number} — {po.supplier_name_display || po.supplier_name || "N/A"}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">Receipt Date</label>
              <input
                type="date"
                value={form.receipt_date}
                onChange={(e) => setForm((f) => ({ ...f, receipt_date: e.target.value }))}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
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
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-2">
                      <select
                        value={item.item_id}
                        onChange={(e) => handleItemChange(idx, "item_id", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="">Select...</option>
                        {(poItems.length > 0 ? poItems : (items || [])).map((i) => (
                          <option key={i.item_id || i.item || i.id} value={i.item_id || i.item || i.id}>
                            {i.item_code || i.item_name || i.name || "Unknown"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Received"
                        value={item.received_quantity}
                        onChange={(e) => handleItemChange(idx, "received_quantity", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        min="0"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Accepted"
                        value={item.accepted_quantity}
                        onChange={(e) => handleItemChange(idx, "accepted_quantity", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        min="0"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Rejected"
                        value={item.rejected_quantity}
                        onChange={(e) => handleItemChange(idx, "rejected_quantity", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        min="0"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Damage"
                        value={item.damage_quantity}
                        onChange={(e) => handleItemChange(idx, "damage_quantity", e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        min="0"
                        step="0.001"
                      />
                    </div>
                  </div>
                  <input
                    placeholder="Remarks (optional)"
                    value={item.remarks}
                    onChange={(e) => handleItemChange(idx, "remarks", e.target.value)}
                    className="mt-2 w-full bg-black/40 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-zinc-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Update GRN" : "Create GRN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GRNDetail = ({ grn, onClose, onAction, history, actionLoading }) => {
  const [tab, setTab] = useState("items");

  const canSubmit = grn?.status === "DRAFT";
  const canApprove = grn?.status === "PENDING_APPROVAL";
  const canReceive = grn?.status === "APPROVED";
  const canComplete = grn?.status === "RECEIVED";
  const canCancel = ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(grn?.status);

  if (!grn) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{grn.grn_number}</h2>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${(STATUS_CONFIG[grn.status] || STATUS_CONFIG.DRAFT).color}`}>
              {(STATUS_CONFIG[grn.status] || STATUS_CONFIG.DRAFT).label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canSubmit && <ActionButton icon={Send} label="Submit" onClick={() => onAction("submit", grn.id)} loading={actionLoading} color="blue" />}
            {canApprove && <ActionButton icon={CheckCircle} label="Approve" onClick={() => onAction("approve", grn.id)} loading={actionLoading} color="emerald" />}
            {canReceive && <ActionButton icon={ClipboardList} label="Receive" onClick={() => onAction("receive", grn.id)} loading={actionLoading} color="blue" />}
            {canComplete && <ActionButton icon={CheckCircle} label="Complete" onClick={() => onAction("complete", grn.id)} loading={actionLoading} color="green" />}
            {canCancel && <ActionButton icon={Ban} label="Cancel" onClick={() => onAction("cancel", grn.id)} loading={actionLoading} color="red" />}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <InfoField label="PO Number" value={grn.purchase_order_number} />
            <InfoField label="Supplier" value={grn.supplier_display || grn.supplier_name || "N/A"} />
            <InfoField label="Location" value={grn.location_name || "N/A"} />
            <InfoField label="Receipt Date" value={grn.receipt_date} />
            <InfoField label="Created By" value={grn.created_by_name || "System"} />
            <InfoField label="Approved By" value={grn.approved_by_name || "—"} />
            <InfoField label="Received By" value={grn.received_by_name || "—"} />
            <InfoField label="Remarks" value={grn.remarks || "—"} />
          </div>

          {grn.total_received_quantity !== undefined && (
            <div className="grid grid-cols-4 gap-3 mb-6">
              <SummaryCard label="Total Received" value={grn.total_received_quantity} color="blue" />
              <SummaryCard label="Total Accepted" value={grn.total_accepted_quantity} color="emerald" />
              <SummaryCard label="Total Rejected" value={grn.total_rejected_quantity} color="red" />
              <SummaryCard label="Total Damaged" value={grn.total_damage_quantity} color="amber" />
            </div>
          )}

          <div className="mb-4 border-b border-zinc-800">
            <div className="flex gap-4">
              {[
                { key: "items", label: "Items", icon: ClipboardList },
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
                    <th className="text-left py-2 px-3">Item</th>
                    <th className="text-right py-2 px-3">Ordered</th>
                    <th className="text-right py-2 px-3">Received</th>
                    <th className="text-right py-2 px-3">Accepted</th>
                    <th className="text-right py-2 px-3">Rejected</th>
                    <th className="text-right py-2 px-3">Damaged</th>
                    <th className="text-right py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(grn.items || []).map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 text-sm text-white/80">
                      <td className="py-2.5 px-3">
                        <span className="text-white font-medium">{item.item_name || item.item_code || "Unknown"}</span>
                        {item.item_code && <span className="text-white/40 ml-1">({item.item_code})</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right">{item.ordered_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-blue-400 font-medium">{item.received_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">{item.accepted_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-red-400">{item.rejected_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400">{item.damage_quantity}</td>
                      <td className="py-2.5 px-3 text-right text-white/40">{item.remarks || "—"}</td>
                    </tr>
                  ))}
                  {(!grn.items || grn.items.length === 0) && (
                    <tr><td colSpan={7} className="py-8 text-center text-white/30 text-sm">No items</td></tr>
                  )}
                </tbody>
              </table>
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
                      {entry.performed_by_name || "System"} — {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.remarks && <p className="text-xs text-white/30 mt-0.5">{entry.remarks}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "attachments" && (
            <div className="text-center py-8 text-white/30 text-sm">
              {(grn.attachments || []).length === 0 ? "No attachments" : grn.attachments.map((a) => (
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

const GRNList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editGRN, setEditGRN] = useState(null);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const pageSize = 20;

  const params = useMemo(() => ({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
  }), [page, search, statusFilter]);

  const { grns, count, loading, refetch } = useGRNs(params);
  const { history: grnHistory, loading: historyLoading } = useGRNHistory(selectedGRN?.id);
  const actions = useGRNActions();
  const { items, loading: itemsLoading } = useItems({ page_size: 500 });
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  useEffect(() => {
    purchaseOrderService.list({ page_size: 200 })
      .then((res) => setPurchaseOrders(res.data.results || res.data.data || []))
      .catch(() => {});
  }, []);

  const handleCreate = async (data) => {
    const result = await actions.createGRN(data);
    if (result.success) {
      setShowForm(false);
      refetch();
    } else {
      alert(result.error || "Failed to create GRN");
    }
  };

  const handleEdit = async (data) => {
    const result = await actions.updateGRN(editGRN.id, data);
    if (result.success) {
      setEditGRN(null);
      setShowForm(false);
      refetch();
    } else {
      alert(result.error || "Failed to update GRN");
    }
  };

  const handleAction = async (action, id, notes) => {
    let result;
    switch (action) {
      case "submit": result = await actions.submitGRN(id); break;
      case "approve": result = await actions.approveGRN(id, notes); break;
      case "receive": result = await actions.receiveGRN(id); break;
      case "complete": result = await actions.completeGRN(id); break;
      case "cancel": result = await actions.cancelGRN(id); break;
      default: return;
    }
    if (result.success) {
      const updated = await fetchGRN(id);
      setSelectedGRN(updated.data.data || updated.data);
      refetch();
    } else {
      alert(result.error || `Failed to ${action} GRN`);
    }
  };

  const handleExport = () => {
    actions.exportGRNs({ export_format: "xlsx", status: statusFilter || undefined });
  };

  const handlePrint = (id) => {
    actions.printGRN(id);
  };

  const openEdit = (grn) => {
    setEditGRN(grn);
    setShowForm(true);
  };

  const openDetail = async (grn) => {
    const response = await fetchGRN(grn.id);
    setSelectedGRN(response.data.data || response.data);
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Goods Receipt Notes</h1>
          <p className="text-sm text-white/40 mt-0.5">Manage goods receipts against purchase orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white/60 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setEditGRN(null); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5">
            <Plus size={14} /> New GRN
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search GRNs..."
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
                <th className="text-left py-3 px-4">GRN Number</th>
                <th className="text-left py-3 px-4">PO Number</th>
                <th className="text-left py-3 px-4">Supplier</th>
                <th className="text-left py-3 px-4">Location</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Items</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-400" /></td></tr>
              ) : grns.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-white/30 text-sm">No GRNs found</td></tr>
              ) : (
                grns.map((grn) => (
                  <tr
                    key={grn.id}
                    className="border-b border-zinc-800/50 text-sm text-white/80 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => openDetail(grn)}
                  >
                    <td className="py-3 px-4 font-medium text-white">{grn.grn_number}</td>
                    <td className="py-3 px-4 text-white/60">{grn.purchase_order_number}</td>
                    <td className="py-3 px-4 text-white/60">{grn.supplier_display || grn.supplier_name || "N/A"}</td>
                    <td className="py-3 px-4 text-white/60">{grn.location_name || "N/A"}</td>
                    <td className="py-3 px-4 text-white/60">{grn.receipt_date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${(STATUS_CONFIG[grn.status] || STATUS_CONFIG.DRAFT).color}`}>
                        {(STATUS_CONFIG[grn.status] || STATUS_CONFIG.DRAFT).label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-white/60">{grn.item_count || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {grn.status === "DRAFT" && (
                          <button onClick={() => openEdit(grn)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-blue-400 transition-colors">
                            <Edit3 size={14} />
                          </button>
                        )}
                        <button onClick={() => handlePrint(grn.id)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
                          <Printer size={14} />
                        </button>
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
            <p className="text-xs text-white/30">{count} total GRNs</p>
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

      <GRNForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditGRN(null); }}
        purchaseOrders={purchaseOrders}
        items={items}
        onSubmit={editGRN ? handleEdit : handleCreate}
        editGRN={editGRN}
        loading={actions.loading}
      />

      {selectedGRN && (
        <GRNDetail
          grn={selectedGRN}
          onClose={() => setSelectedGRN(null)}
          onAction={handleAction}
          history={grnHistory}
          actionLoading={actions.loading}
        />
      )}
    </div>
  );
};

export default GRNList;
