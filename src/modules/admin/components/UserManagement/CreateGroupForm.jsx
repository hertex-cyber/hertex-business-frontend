import React, { useState } from "react";
import { Users, Loader2, FileText } from "lucide-react";

const CreateGroupForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      setError("Group name is required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || "Error creating group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
      <div className="px-8 pt-8 pb-6 border-b border-white/5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Create New Group</h2>
            <p className="text-sm text-white/40 mt-2">Fill in the details to add a new group</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-8 py-4">
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            <div className="py-2 border-b border-white/5">
              <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">Group Name</p>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                  <Users size={14} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all"
                />
              </div>
            </div>
            <div className="py-2 border-b border-white/5 last:border-0">
              <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">Description</p>
              <div className="relative">
                <div className="absolute left-3 top-3 text-white/30">
                  <FileText size={14} />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-white/5 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-md text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-xs uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupForm;
