import React from "react";
import { useNavigate } from "react-router-dom";
import { Target, Calendar, Clock, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyDashboard } from "../hooks/useDashboard";
import { useAuth } from "@/context/AuthContext";

const DashboardMyView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading } = useMyDashboard();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-8 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">My Mission Control</h1>
          <p className="text-sm text-white/40 font-medium">
            {user?.first_name ? `${user.first_name}'s Personal Dashboard` : "Your sales execution hub"}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 pt-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Target size={48} className="text-white/10" />
            <p className="text-lg text-white/30 font-medium">No active targets</p>
            <p className="text-sm text-white/20">Your manager hasn't assigned targets for an active cycle yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Target Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              {(data.targets || []).map((target) => {
                const pct = target.target_amount > 0
                  ? Math.round((target.achieved_amount || 0) / target.target_amount * 100)
                  : 0;
                return (
                  <div key={target.id} className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <Target size={16} className="text-blue-400" />
                      <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", {
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": target.status === "ACHIEVED" || target.status === "EXCEEDED",
                        "bg-amber-500/10 text-amber-400 border-amber-500/20": target.status === "IN_PROGRESS",
                        "bg-zinc-500/10 text-zinc-400 border-zinc-500/20": target.status === "NOT_STARTED",
                        "bg-red-500/10 text-red-400 border-red-500/20": target.status === "MISSED",
                      })}>
                        {target.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white font-mono">₹{(target.target_amount || 0).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-emerald-400 font-mono mt-1">
                      ₹{(target.achieved_amount || 0).toLocaleString("en-IN")} achieved
                    </p>
                    <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/30 mt-1.5 font-mono">{pct}% attainment</p>
                  </div>
                );
              })}
            </div>

            {/* Today's Tasks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} className="text-amber-400" />
                  Today's Must-Dos
                </h2>
                <button
                  onClick={() => navigate("/sales/tasks")}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-wider flex items-center gap-1"
                >
                  All Tasks <ArrowRight size={10} />
                </button>
              </div>
              {data.today_tasks?.length > 0 ? (
                <div className="space-y-2">
                  {data.today_tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between"
                      onClick={() => navigate(`/sales/tasks/${task.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", {
                          "bg-red-400": task.priority === "CRITICAL" || task.priority === "HIGH",
                          "bg-amber-400": task.priority === "MEDIUM",
                          "bg-emerald-400": task.priority === "LOW",
                        })} />
                        <div>
                          <p className="text-sm font-medium text-white">{task.title}</p>
                          <p className="text-[10px] text-white/30">{task.task_type}</p>
                        </div>
                      </div>
                      <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", {
                        "bg-blue-500/10 text-blue-400 border-blue-500/20": task.status === "TODO",
                        "bg-amber-500/10 text-amber-400 border-amber-500/20": task.status === "IN_PROGRESS",
                        "bg-red-500/10 text-red-400 border-red-500/20": task.status === "BLOCKED",
                      })}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
                  <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-white/30">All caught up! No tasks due today.</p>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Task Summary</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{data.task_summary?.total || 0}</p>
                    <p className="text-[8px] text-white/30">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-400">{data.task_summary?.done || 0}</p>
                    <p className="text-[8px] text-white/30">Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-400">{data.task_summary?.in_progress || 0}</p>
                    <p className="text-[8px] text-white/30">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-400">{data.task_summary?.blocked || 0}</p>
                    <p className="text-[8px] text-white/30">Blocked</p>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Time Logged Today</p>
                <p className="text-2xl font-bold text-white font-mono mt-2">{data.time_logged_today || 0}h</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardMyView;
