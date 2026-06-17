import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Target, TrendingUp, BarChart3, ListTodo,
  Plus, Loader2, Calendar, DollarSign, User as UserIcon,
  RefreshCw, CheckCircle, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesTarget } from "../hooks/useSalesTargets";
import { useSalesTasks } from "../hooks/useSalesTasks";
import { generateTasksFromTarget } from "../services/salesTaskService";
import {
  formatCurrency, formatPercent, formatDate,
  TARGET_STATUS_STYLES, PRIORITY_STYLES, STATUS_STYLES,
  calcAttainment, getUserName
} from "../utils/salesTaskUtils";

const SalesTargetDetail = () => {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const { target, loading, error, refetch } = useSalesTarget(targetId);
  const { tasks, loading: tasksLoading } = useSalesTasks({ sales_target: targetId });
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState(null);

  if (!targetId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/30">No target ID provided</p>
      </div>
    );
  }

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    setGenMessage(null);
    try {
      const response = await generateTasksFromTarget(targetId);
      setGenMessage({ type: "success", text: response.data?.message || "Tasks generated!" });
      refetch();
    } catch (err) {
      setGenMessage({ type: "error", text: err.response?.data?.detail || "Failed to generate tasks" });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenMessage(null), 3000);
    }
  };

  const attainment = calcAttainment(target?.achieved_amount, target?.target_amount);

  const statusTrend = attainment >= 100 ? "exceeded"
    : attainment >= 80 ? "on_track"
    : attainment >= 50 ? "at_risk"
    : "behind";

  const trendStyles = {
    exceeded: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    on_track: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    at_risk: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    behind: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const trendLabels = {
    exceeded: "Exceeding Target",
    on_track: "On Track",
    at_risk: "At Risk",
    behind: "Behind",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-10 py-8 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white transition-all">
            <ArrowLeft size={16} />
          </button>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Target size={18} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {target ? getUserName(target.assigned_user_details) : "Target Detail"}
              </h1>
              {target?.status && (
                <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", TARGET_STATUS_STYLES[target.status])}>
                  {target.status}
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1">
              Sales Target
              {target?.assigned_user_details?.email && ` · ${target.assigned_user_details.email}`}
            </p>
          </div>
          <button
            onClick={handleGenerateTasks}
            disabled={isGenerating || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all text-xs font-semibold uppercase tracking-wider"
          >
            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Generate Tasks
          </button>
        </div>
        {genMessage && (
          <div className={cn("px-4 py-2 rounded-lg text-xs font-semibold", genMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
            {genMessage.text}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-10 pt-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        ) : !target ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Target size={48} className="text-white/10" />
            <p className="text-lg text-white/30 font-medium">Target not found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={14} className="text-blue-400" />
                  <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Target Amount</p>
                </div>
                <p className="text-xl font-bold text-white font-mono">{formatCurrency(target.target_amount)}</p>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Achieved</p>
                </div>
                <p className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(target.achieved_amount)}</p>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={14} className="text-purple-400" />
                  <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Attainment</p>
                </div>
                <p className="text-xl font-bold text-white font-mono">{formatPercent(attainment)}</p>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <ListTodo size={14} className="text-amber-400" />
                  <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Weighted Progress</p>
                </div>
                <p className="text-xl font-bold text-white font-mono">{formatPercent(target.weighted_progress_pct)}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Overall Attainment Progress</p>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", trendStyles[statusTrend])}>
                  {trendLabels[statusTrend]}
                </span>
              </div>
              <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", {
                    "bg-purple-500": attainment >= 100,
                    "bg-emerald-500": attainment >= 80 && attainment < 100,
                    "bg-amber-500": attainment >= 50 && attainment < 80,
                    "bg-red-500": attainment < 50,
                  })}
                  style={{ width: `${Math.min(attainment, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <p className="text-[9px] text-white/30 font-mono">
                  Achieved: {formatCurrency(target.achieved_amount)}
                </p>
                <p className="text-[9px] text-white/30 font-mono">
                  Remaining: {formatCurrency((target.target_amount || 0) - (target.achieved_amount || 0))}
                </p>
              </div>
            </div>

            {/* Target Breakdown */}
            {(target.new_business_target > 0 || target.renewal_target > 0 || target.upsell_target > 0) && (
              <div>
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Target size={14} className="text-blue-400" />
                  Target Breakdown
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {target.new_business_target > 0 && (
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <p className="text-[9px] text-blue-400 uppercase tracking-wider font-semibold mb-1">New Business</p>
                      <p className="text-lg font-bold text-white font-mono">{formatCurrency(target.new_business_target)}</p>
                    </div>
                  )}
                  {target.renewal_target > 0 && (
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <p className="text-[9px] text-emerald-400 uppercase tracking-wider font-semibold mb-1">Renewal</p>
                      <p className="text-lg font-bold text-white font-mono">{formatCurrency(target.renewal_target)}</p>
                    </div>
                  )}
                  {target.upsell_target > 0 && (
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <p className="text-[9px] text-purple-400 uppercase tracking-wider font-semibold mb-1">Upsell</p>
                      <p className="text-lg font-bold text-white font-mono">{formatCurrency(target.upsell_target)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Line Items */}
            {target.line_items?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ListTodo size={14} className="text-amber-400" />
                  Line Items ({target.line_items.length})
                </h2>
                <div className="space-y-2">
                  {target.line_items.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={cn("w-2 h-2 rounded-full", item.is_attained ? "bg-emerald-400" : "bg-amber-400")} />
                        <div>
                          <p className="text-sm font-medium text-white">{item.description}</p>
                          <p className="text-[10px] text-white/30 flex items-center gap-3 mt-0.5">
                            <span>{item.line_item_type}</span>
                            {item.expected_close_date && <span>Due: {formatDate(item.expected_close_date)}</span>
}
                            <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase border", {
                              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": item.probability === "HIGH" || item.probability === "COMMITTED",
                              "bg-amber-500/10 text-amber-400 border-amber-500/20": item.probability === "MEDIUM",
                              "bg-zinc-500/10 text-zinc-400 border-zinc-500/20": item.probability === "LOW",
                            })}>
                              {item.probability}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white font-mono">{formatCurrency(item.expected_amount)}</p>
                        {item.is_attained && (
                          <p className="text-[10px] text-emerald-400 font-mono">Attained</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Tasks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <ListTodo size={14} className="text-blue-400" />
                  Related Tasks ({tasks.length})
                </h2>
                <button
                  onClick={() => navigate(`/sales/tasks?sales_target=${targetId}`)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-wider"
                >
                  View All
                </button>
              </div>
              {tasksLoading ? (
                <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-white/20" /></div>
              ) : tasks.length === 0 ? (
                <div className="p-8 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
                  <ListTodo size={24} className="text-white/10 mx-auto mb-2" />
                  <p className="text-sm text-white/30">No tasks created yet.</p>
                  <button
                    onClick={handleGenerateTasks}
                    className="mt-3 text-[10px] text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-wider"
                  >
                    Generate tasks from target
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 10).map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between"
                      onClick={() => navigate(`/sales/tasks/${task.id}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn("w-2 h-2 rounded-full shrink-0", {
                          "bg-red-400": task.priority === "CRITICAL",
                          "bg-orange-400": task.priority === "HIGH",
                          "bg-amber-400": task.priority === "MEDIUM",
                          "bg-emerald-400": task.priority === "LOW",
                        })} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{task.title}</p>
                          <p className="text-[10px] text-white/30 flex items-center gap-2 mt-0.5">
                            <span>{task.task_type}</span>
                            {task.due_date && <span>Due: {formatDate(task.due_date)}</span>}
                            {task.assigned_to_details && <span>{getUserName(task.assigned_to_details)}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", STATUS_STYLES[task.status])}>
                          {task.status}
                        </span>
                        {task.revenue_impact > 0 && (
                          <span className="text-[10px] text-emerald-400 font-mono">{formatCurrency(task.revenue_impact)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SalesTargetDetail;
