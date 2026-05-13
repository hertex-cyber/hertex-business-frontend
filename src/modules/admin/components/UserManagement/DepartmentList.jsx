import React from "react";
import { Users, User, Edit2 } from "lucide-react";
import RingLoader from "@/components/ui/RingLoader";

const DepartmentList = ({ departments, loading, error }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RingLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500/50">
          <Users size={24} />
        </div>
        <p className="text-sm text-white/30">Failed to load groups</p>
      </div>
    );
  }

  if (!departments.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/10">
          <Users size={24} />
        </div>
        <p className="text-sm text-white/20">No groups found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 hover:bg-white/[0.02] transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/15 group-hover:border-blue-500/30 transition-all">
                <Users size={18} />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/50 transition-colors">
                <Edit2 size={14} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="font-medium text-white truncate">{dept.name}</h3>
              {dept.description && (
                <p className="text-sm text-white/40 line-clamp-2">{dept.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-white/30 pt-1">
                <User size={11} />
                <span>
                  {dept.manager ? `Manager: ${dept.manager.first_name} ${dept.manager.last_name}` : 'No manager assigned'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentList;
