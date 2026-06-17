import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Plus } from "lucide-react";
import { createTargetLineItem, updateTargetLineItem, deleteTargetLineItem } from "../services/salesTaskService";

/**
 * TargetLineItemForm — Add/edit/delete target line items
 * As documented in Section 7.1 of SALES_TASK_MANAGER_MODULE.md
 *
 * Props:
 *   isOpen       — whether dialog is visible
 *   onClose      — callback to close dialog
 *   targetId     — sales target ID
 *   lineItems    — existing line items array
 *   onSuccess    — callback after changes
 */
const TargetLineItemForm = ({ isOpen, onClose, targetId, lineItems = [], onSuccess }) => {
  const [items, setItems] = useState(lineItems);
  const [newItem, setNewItem] = useState({
    description: "",
    expected_amount: "",
    expected_close_date: "",
    line_item_type: "NEW_BUSINESS",
    probability: "MEDIUM",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleNewChange = useCallback((field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddItem = useCallback(async () => {
    if (!newItem.description || !newItem.expected_amount) return;
    setIsSaving(true);
    try {
      const res = await createTargetLineItem({
        sales_target: targetId,
        description: newItem.description,
        expected_amount: parseFloat(newItem.expected_amount) || 0,
        expected_close_date: newItem.expected_close_date || new Date().toISOString().split("T")[0],
        line_item_type: newItem.line_item_type,
        probability: newItem.probability,
      });
      setItems((prev) => [...prev, res.data]);
      setNewItem({ description: "", expected_amount: "", expected_close_date: "", line_item_type: "NEW_BUSINESS", probability: "MEDIUM" });
      onSuccess?.();
    } catch (err) {
      console.error("Failed to add line item:", err);
    } finally {
      setIsSaving(false);
    }
  }, [newItem, targetId, onSuccess]);

  const handleDeleteItem = useCallback(async (itemId) => {
    try {
      await deleteTargetLineItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      onSuccess?.();
    } catch (err) {
      console.error("Failed to delete line item:", err);
    }
  }, [onSuccess]);

  if (!isOpen) return null;

  const inputClass =
    "bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/50";

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 shrink-0">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Target Line Items</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {/* Existing Items */}
          {items.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Existing Items ({items.length})</p>
              {items.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.is_attained ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <div>
                      <p className="text-xs font-medium text-white">{item.description}</p>
                      <p className="text-[9px] text-white/30 mt-0.5">
                        {item.line_item_type} · {item.probability} · Due: {item.expected_close_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white font-mono">{formatCurrency(item.expected_amount)}</span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-400/40 hover:text-red-400 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Item */}
          <div className="p-4 rounded-lg bg-zinc-900/20 border border-dashed border-zinc-800 space-y-3">
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Add Line Item</p>
            <input
              value={newItem.description}
              onChange={(e) => handleNewChange("description", e.target.value)}
              placeholder="Description (e.g., Close Acme Corp Expansion)"
              className={`w-full ${inputClass}`}
            />
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                value={newItem.expected_amount}
                onChange={(e) => handleNewChange("expected_amount", e.target.value)}
                placeholder="Amount (₹)"
                className={inputClass}
              />
              <input
                type="date"
                value={newItem.expected_close_date}
                onChange={(e) => handleNewChange("expected_close_date", e.target.value)}
                className={inputClass}
              />
              <select
                value={newItem.line_item_type}
                onChange={(e) => handleNewChange("line_item_type", e.target.value)}
                className={inputClass}
              >
                {["NEW_BUSINESS", "RENEWAL", "UPSELL", "EXPANSION"].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
              <select
                value={newItem.probability}
                onChange={(e) => handleNewChange("probability", e.target.value)}
                className={inputClass}
              >
                {["LOW", "MEDIUM", "HIGH", "COMMITTED"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddItem}
              disabled={isSaving || !newItem.description || !newItem.expected_amount}
              className="px-4 py-1.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 text-[9px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1"
            >
              {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
              Add Item
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-900 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white text-[10px] font-semibold uppercase tracking-wider transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TargetLineItemForm;
