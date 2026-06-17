import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Target, BarChart3, Plus, Loader2, Users, TrendingUp, Edit, LayoutGrid, Calendar, User as UserIcon, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTargetCycleDetail } from "../hooks/useTargetCycles";
import { useSalesTargets } from "../hooks/useSalesTargets";
import { useSalesProgrammes } from "../hooks/useSalesProgrammes";
import SalesTargetForm from "../components/SalesTargetForm";
import TargetLineItemForm from "../components/TargetLineItemForm";
import TargetCycleForm from "../components/TargetCycleForm";
import SalesProgrammeForm from "../components/SalesProgrammeForm";
import { deleteSalesProgramme } from "../services/salesTaskService";
import { formatCurrency, formatDate, PRIORITY_STYLES } from "../utils/salesTaskUtils";

const TARGET_STATUS = {
  NOT_STARTED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ACHIEVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  EXCEEDED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  MISSED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PROGRAMME_STATUS_STYLES = {
  PLANNING: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ON_HOLD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TargetCycleDetail = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { cycle, summary, loading, refetch: refetchCycle } = useTargetCycleDetail(cycleId);
  const { targets, loading: targetsLoading, refetch: refetchTargets } = useSalesTargets({ cycle: cycleId });
  const { programmes, loading: programmesLoading, refetch: refetchProgrammes } = useSalesProgrammes({ target_cycle: cycleId });

  const [showTargetForm, setShowTargetForm] = useState(false);
  const [showEditCycleForm, setShowEditCycleForm] = useState(false);
  const [lineItemTargetId, setLineItemTargetId] = useState(null);
  const [showProgrammeForm, setShowProgrammeForm] = useState(false);
  const [editProgramme, setEditProgramme] = useState(null);
  const [activeTab, setActiveTab] = useState("targets");
  const [deletingProgrammeId, setDeletingProgrammeId] = useState(null);

  const handleDeleteProgramme = async (id) => {
    if (!window.confirm("Delete this programme? This action cannot be undone.")) return;
    setDeletingProgrammeId(id);
    try {
      await deleteSalesProgramme(id);
      refetchProgrammes();
    } catch (err) {
      console.error("Failed to delete programme:", err);
    } finally {
      setDeletingProgrammeId(null);
    }
  };

  const programmeStatusStyle = (status) => PROGRAMME_STATUS_STYLES[status] || PROGRAMME_STATUS_STYLES.PLANNING;
  const calcProgrammeProgress = (prog) => {
    if (!prog.target_revenue || prog.target_revenue === 0) return null;
    return Math.min(((prog.actual_revenue || 0) / prog.target_revenue) * 100, 100);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-8 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={() => navigate("/sales/targets")} className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{cycle?.name || "Loading..."}</h1>
              {cycle && (
                <>
                  <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", {
                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": cycle.status === "ACTIVE",
                    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20": cycle.status === "DRAFT",
                    "bg-blue-500/10 text-blue-400 border-blue-500/20": cycle.status === "CLOSED",
                  })}>
                    {cycle.status}
                  </span>
                  <button
                    onClick={() => setShowEditCycleForm(!showEditCycleForm)}
                    className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-white transition-all"
                    title="Edit Cycle"
                  >
                    <Edit size={14} />
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1">{cycle?.code} · {cycle?.cycle_type} · {cycle?.start_date} → {cycle?.end_date}</p>
          </div>
        </div>
        {summary && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-900/30 border border-zinc-800">
              <Target size={16} className="text-blue-400" />
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Total Target</p>
                <p className="text-sm font-bold text-white font-mono">{formatCurrency(summary.total_target || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-900/30 border border-zinc-800">
              <TrendingUp size={16} className="text-emerald-400" />
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Achieved</p>
                <p className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(summary.total_achieved || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-900/30 border border-zinc-800">
              <BarChart3 size={16} className="text-purple-400" />
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Attainment</p>
                <p className="text-sm font-bold text-white font-mono">{summary.attainment_pct}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-900/30 border border-zinc-800">
              <LayoutGrid size={16} className="text-amber-400" />
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Programmes</p>
                <p className="text-sm font-bold text-white font-mono">{programmes.length}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-10 pt-6 custom-scrollbar">
        {showEditCycleForm && cycle && (
          <div className="mb-6">
            <TargetCycleForm
              cycle={cycle}
              onSuccess={() => { setShowEditCycleForm(false); refetchCycle(); }}
              onCancel={() => setShowEditCycleForm(false)}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-zinc-900/30 rounded-lg border border-zinc-800 w-fit">
          {[
            { key: "targets", label: "Targets", count: targets.length },
            { key: "programmes", label: "Programmes", count: programmes.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all",
                activeTab === tab.key
                  ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* =================== TARGETS TAB =================== */}
        {activeTab === "targets" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Users size={14} className="text-blue-400" />
                Sales Targets ({targets.length})
              </h2>
              {cycle?.status === "ACTIVE" && (
                <button
                  onClick={() => setShowTargetForm(!showTargetForm)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-[10px] font-semibold uppercase tracking-wider"
                >
                  <Plus size={12} /> Add Target
                </button>
              )}
            </div>

            {showTargetForm && (
              <div className="mb-6">
                <SalesTargetForm
                  cycleId={cycleId}
                  onSuccess={() => { setShowTargetForm(false); refetchTargets(); }}
                  onCancel={() => setShowTargetForm(false)}
                />
              </div>
            )}

            {targetsLoading ? (
              <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-white/20" /></div>
            ) : targets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-xl border border-dashed border-zinc-800">
                <Target size={32} className="text-white/10" />
                <p className="text-sm text-white/30">No targets in this cycle yet</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {targets.map((target) => (
                  <div
                    key={target.id}
                    className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                    onClick={() => navigate(`/sales/targets/${cycleId}/${target.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Target size={16} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {target.assigned_user_details
                              ? `${target.assigned_user_details.first_name || ""} ${target.assigned_user_details.last_name || ""}`.trim() || "Unassigned"
                              : "Unassigned"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", TARGET_STATUS[target.status])}>
                              {target.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-base font-bold text-white font-mono">{formatCurrency(target.target_amount || 0)}</p>
                          <p className="text-[10px] text-emerald-400 font-mono">
                            {formatCurrency(target.achieved_amount || 0)} achieved
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setLineItemTargetId(target.id); }}
                          className="px-2 py-1 rounded bg-zinc-900/50 border border-zinc-800 text-white/30 hover:text-white text-[9px] uppercase tracking-wider transition-all"
                        >
                          Line Items
                        </button>
                        <ExternalLink size={14} className="text-white/20" />
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min((target.achieved_amount || 0) / (target.target_amount || 1) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* =================== PROGRAMMES TAB =================== */}
        {activeTab === "programmes" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid size={14} className="text-amber-400" />
                Sales Programmes ({programmes.length})
              </h2>
              {cycle?.status === "ACTIVE" && (
                <button
                  onClick={() => { setEditProgramme(null); setShowProgrammeForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-[10px] font-semibold uppercase tracking-wider"
                >
                  <Plus size={12} /> New Programme
                </button>
              )}
            </div>

            {showProgrammeForm && (
              <div className="mb-6">
                <SalesProgrammeForm
                  isOpen={showProgrammeForm}
                  onClose={() => { setShowProgrammeForm(false); setEditProgramme(null); }}
                  cycleId={cycleId}
                  programme={editProgramme}
                  onSuccess={() => { setShowProgrammeForm(false); setEditProgramme(null); refetchProgrammes(); }}
                />
              </div>
            )}

            {programmesLoading ? (
              <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-white/20" /></div>
            ) : programmes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-xl border border-dashed border-zinc-800">
                <LayoutGrid size={32} className="text-white/10" />
                <p className="text-sm text-white/30">No programmes in this cycle yet</p>
                <button
                  onClick={() => { setEditProgramme(null); setShowProgrammeForm(true); }}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold uppercase tracking-wider"
                >
                  Create your first programme
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {programmes.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <LayoutGrid size={16} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className="text-sm font-semibold text-white truncate cursor-pointer hover:text-blue-400 transition-colors"
                              onClick={() => navigate(`/sales/programmes/${prog.id}`)}
                            >
                              {prog.name}
                            </h3>
                            <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider shrink-0", PRIORITY_STYLES[prog.priority])}>
                              {prog.priority}
                            </span>
                          </div>
                          {prog.description && (
                            <p className="text-[10px] text-white/30 mt-1 line-clamp-2">{prog.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            {prog.start_date && (
                              <span className="text-[10px] text-white/30 flex items-center gap-1">
                                <Calendar size={10} /> {formatDate(prog.start_date)} → {formatDate(prog.end_date)}
                              </span>
                            )}
                            {prog.programme_manager_details && (
                              <span className="text-[10px] text-white/30 flex items-center gap-1">
                                <UserIcon size={10} /> {prog.programme_manager_details.first_name} {prog.programme_manager_details.last_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        {prog.target_revenue > 0 && (
                          <div className="text-right">
                            <p className="text-[9px] text-white/30 uppercase tracking-wider">Revenue</p>
                            <p className="text-sm font-bold text-white font-mono">{formatCurrency(prog.target_revenue)}</p>
                          </div>
                        )}
                        <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", programmeStatusStyle(prog.status))}>
                          {prog.status || "PLANNING"}
                        </span>
                        <button
                          onClick={() => { setEditProgramme(prog); setShowProgrammeForm(true); }}
                          className="p-1.5 rounded hover:bg-white/5 text-white/20 hover:text-white transition-all"
                          title="Edit Programme"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteProgramme(prog.id)}
                          disabled={deletingProgrammeId === prog.id}
                          className="p-1.5 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all disabled:opacity-50"
                          title="Delete Programme"
                        >
                          <Trash2 size={12} />
                        </button>
                        <button
                          onClick={() => navigate(`/sales/programmes/${prog.id}`)}
                          className="px-3 py-1.5 rounded bg-zinc-900/50 border border-zinc-800 text-white/30 hover:text-white text-[9px] uppercase tracking-wider transition-all group-hover:border-zinc-700"
                        >
                          View
                        </button>
                      </div>
                    </div>
                    {/* Progress bar — derived from actual_revenue / target_revenue */}
                    {calcProgrammeProgress(prog) != null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[9px] text-white/30 uppercase tracking-wider">Revenue Progress</p>
                          <p className="text-[9px] text-white/40 font-mono">{formatCurrency(prog.actual_revenue || 0)} / {formatCurrency(prog.target_revenue)}</p>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${calcProgrammeProgress(prog)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Line Item Form Dialog */}
      {lineItemTargetId && (
        <TargetLineItemForm
          isOpen={true}
          onClose={() => setLineItemTargetId(null)}
          targetId={lineItemTargetId}
          lineItems={targets.find((t) => t.id === lineItemTargetId)?.line_items || []}
          onSuccess={() => refetchTargets()}
        />
      )}
    </div>
  );
};

export default TargetCycleDetail;
