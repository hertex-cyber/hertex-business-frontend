import React from "react";
import { useNavigate } from "react-router-dom";
import { Target, BarChart3, TrendingUp, AlertTriangle, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExecutiveDashboard } from "../hooks/useDashboard";

const DashboardExecutive = () => {
  const navigate = useNavigate();
  const { data, loading } = useExecutiveDashboard();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-8 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Executive Dashboard</h1>
          <p className="text-sm text-white/40 font-medium">Enterprise-wide sales performance overview</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 pt-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <BarChart3 size={48} className="text-white/10" />
            <p className="text-lg text-white/30 font-medium">No executive data available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2 font-semibold">Total Target</p>
                <p className="text-2xl font-bold text-white font-mono">₹{(data.total_target || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2 font-semibold">Total Achieved</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono">₹{(data.total_achieved || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2 font-semibold">Attainment</p>
                <div className="flex items-center gap-3">
                  <p className={cn("text-2xl font-bold font-mono", {
                    "text-emerald-400": (data.attainment_pct || 0) >= 80,
                    "text-amber-400": (data.attainment_pct || 0) >= 50 && (data.attainment_pct || 0) < 80,
                    "text-red-400": (data.attainment_pct || 0) < 50,
                  })}>
                    {data.attainment_pct || 0}%
                  </p>
                  {(data.attainment_pct || 0) < 50 && <AlertTriangle size={16} className="text-red-400" />}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2 font-semibold">Active Programmes</p>
                <p className="text-2xl font-bold text-white">{data.active_programmes || 0}</p>
                {(data.at_risk_programmes || 0) > 0 && (
                  <p className="text-[10px] text-red-400 mt-1 font-semibold">{data.at_risk_programmes} at risk</p>
                )}
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-emerald-400" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Top Performers</h2>
              </div>
              <div className="grid gap-3">
                {(data.top_performers || []).map((performer, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        {performer.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{performer.name}</p>
                        <p className="text-[10px] text-white/30 font-mono">
                          ₹{(performer.target || 0).toLocaleString("en-IN")} target
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-emerald-400 font-mono">{performer.attainment_pct || 0}%</p>
                      <p className="text-[10px] text-white/30 font-mono">₹{(performer.achieved || 0).toLocaleString("en-IN")} achieved</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardExecutive;
