import React from "react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, getUserName } from "../utils/salesTaskUtils";

/**
 * ResourceLoadView — Resource allocation matrix
 * Extracted from SalesProgrammeDetail for reuse
 *
 * Props:
 *   members       — array of team member objects
 *   allocations   — array of resource allocation objects
 */
const ResourceLoadView = ({ members = [], allocations = [] }) => {
  return (
    <div className="space-y-6">
      {/* Team Members */}
      <div>
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          Team Members ({members.length})
        </h2>
        {members.length === 0 ? (
          <div className="p-8 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
            <Users size={24} className="text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/30">No team members assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {members.map((member) => {
              const alloc = allocations.find((a) => a.user_id === member.id);
              return (
                <div key={member.id} className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                    {`${member.first_name || ""} ${member.last_name || ""}`.trim().charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{getUserName(member)}</p>
                    {alloc ? (
                      <p className="text-[10px] text-white/30">
                        {alloc.role} · {alloc.allocation_pct}% allocation · {alloc.active_tasks} active tasks
                      </p>
                    ) : (
                      <p className="text-[10px] text-white/30">Member</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resource Allocations */}
      {allocations.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Resource Allocations
          </h2>
          <div className="space-y-2">
            {allocations.map((alloc, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{alloc.user_name}</p>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-sm border font-semibold", {
                    "text-emerald-400 border-emerald-500/20 bg-emerald-500/10": alloc.allocation_pct <= 50,
                    "text-amber-400 border-amber-500/20 bg-amber-500/10": alloc.allocation_pct <= 80,
                    "text-red-400 border-red-500/20 bg-red-500/10": alloc.allocation_pct > 80,
                  })}>
                    {alloc.allocation_pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className={cn("h-full rounded-full", {
                    "bg-emerald-500": alloc.allocation_pct <= 50,
                    "bg-amber-500": alloc.allocation_pct <= 80,
                    "bg-red-500": alloc.allocation_pct > 80,
                  })} style={{ width: `${Math.min(alloc.allocation_pct, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[9px] text-white/30">
                  <span>{alloc.role}</span>
                  <span>{formatDate(alloc.start_date)} → {formatDate(alloc.end_date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLoadView;
