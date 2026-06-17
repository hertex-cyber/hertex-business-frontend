import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Target, BarChart3, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useManagerDashboard } from "../hooks/useDashboard";

const DashboardManager = () => {
  const navigate = useNavigate();
  const { data, loading } = useManagerDashboard();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-8 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Team Dashboard</h1>
          <p className="text-sm text-white/40 font-medium">
            {data ? `${data.team_size || 0} team members` : "Your team's performance overview"}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 pt-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Users size={48} className="text-white/10" />
            <p className="text-lg text-white/30 font-medium">No team data available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={16} className="text-blue-400" />
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">Team Size</p>
                </div>
                <p className="text-2xl font-bold text-white">{data.team_size || 0}</p>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center gap-3 mb-2">
                  <Target size={16} className="text-purple-400" />
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">Total Target</p>
                </div>
                <p className="text-2xl font-bold text-white font-mono">₹{(data.total_target || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 size={16} className="text-emerald-400" />
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">Achieved</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400 font-mono">₹{(data.total_achieved || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={16} className="text-amber-400" />
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">Tasks Done</p>
                </div>
                <p className="text-2xl font-bold text-white">{data.task_summary?.done || 0}/{data.task_summary?.total || 0}</p>
                <p className="text-[10px] text-white/30 mt-1">
                  {data.task_summary?.blocked > 0 && `${data.task_summary.blocked} blocked`}
                </p>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} className="text-blue-400" />
                  Team Members
                </h2>
              </div>
              <div className="space-y-2">
                {(data.team_members || []).map((member) => {
                  const pct = member.target > 0 ? Math.round(member.achieved / member.target * 100) : 0;
                  return (
                    <div key={member.id} className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-white">{member.name}</p>
                        <span className={cn("text-[10px] font-mono font-bold", {
                          "text-emerald-400": pct >= 80,
                          "text-amber-400": pct >= 50 && pct < 80,
                          "text-red-400": pct < 50,
                        })}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", {
                            "bg-emerald-500": pct >= 80,
                            "bg-amber-500": pct >= 50 && pct < 80,
                            "bg-red-500": pct < 50,
                          })}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <p className="text-[9px] text-white/30 font-mono">₹{(member.target || 0).toLocaleString("en-IN")} target</p>
                        <p className="text-[9px] text-white/30 font-mono">₹{(member.achieved || 0).toLocaleString("en-IN")} achieved</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardManager;
