import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, ChevronRight, Target, Loader2, CheckCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTargetCycles } from "../hooks/useTargetCycles";
import { activateTargetCycle, closeTargetCycle } from "../services/salesTaskService";
import TargetCycleForm from "../components/TargetCycleForm";

const CYCLE_STATUS = {
  DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ARCHIVED: "bg-white/5 text-white/30 border-white/10",
};

const CYCLE_TYPES = {
  ANNUAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  HALF_YEARLY: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  QUARTERLY: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  MONTHLY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const TargetCycleList = () => {
  const navigate = useNavigate();
  const { cycles, loading, error, refetch } = useTargetCycles();
  const [showForm, setShowForm] = useState(false);

  const handleActivate = async (id) => {
    try {
      await activateTargetCycle(id);
      refetch();
    } catch (err) {
      console.error("Failed to activate cycle:", err);
    }
  };

  const handleClose = async (id) => {
    try {
      await closeTargetCycle(id);
      refetch();
    } catch (err) {
      console.error("Failed to close cycle:", err);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-8 flex justify-between items-end border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Target Cycles</h1>
          <p className="text-sm text-white/40 font-medium">Manage sales target periods and cycles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-semibold uppercase tracking-wider"
        >
          <Plus size={14} />
          New Cycle
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-10 pt-6 custom-scrollbar">
        {showForm && (
          <div className="mb-8">
            <TargetCycleForm
              onSuccess={() => { setShowForm(false); refetch(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        ) : cycles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <Target size={48} className="text-white/10" />
            <p className="text-lg text-white/30 font-medium">No target cycles yet</p>
            <p className="text-sm text-white/20 max-w-md text-center">
              Create your first target cycle to start tracking sales targets, programmes, and tasks.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cycles.map((cycle) => (
              <div
                key={cycle.id}
                className="group p-6 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                onClick={() => navigate(`/sales/targets/${cycle.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Target size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{cycle.name}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", CYCLE_STATUS[cycle.status] || CYCLE_STATUS.DRAFT)}>
                          {cycle.status}
                        </span>
                        <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", CYCLE_TYPES[cycle.cycle_type])}>
                          {cycle.cycle_type}
                        </span>
                        <span className="text-[9px] text-white/30 font-mono">
                          <Calendar size={10} className="inline mr-1" />
                          {cycle.start_date} → {cycle.end_date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white font-mono">₹{(cycle.total_revenue_target || 0).toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-wider">Total Target</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {cycle.status === "DRAFT" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleActivate(cycle.id); }}
                          className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                          title="Activate Cycle"
                        >
                          <PlayCircle size={14} />
                        </button>
                      )}
                      {cycle.status === "ACTIVE" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleClose(cycle.id); }}
                          className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all"
                          title="Close Cycle"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TargetCycleList;
