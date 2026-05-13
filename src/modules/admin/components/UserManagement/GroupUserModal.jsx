import React from "react";
import { createPortal } from "react-dom";
import { Users, User, Mail, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const GroupUserModal = ({
  department,
  users,
  onViewDetails,
  onRemoveUser,
  isRemovingUser,
  onClose,
}) => {
  if (!department) return null;

  const filteredUsers = users.filter(user => user.department?.id === department.id);

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">{department.name}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{filteredUsers.length} Users in this group</p>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="px-8 py-4 border-b border-zinc-800 bg-zinc-900/10 shrink-0">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">User</span>
            </div>
            <div className="col-span-4">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Email</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Role</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Action</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                No users in this group
              </p>
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-zinc-800/50">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="px-8 py-4 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-3 cursor-pointer" onClick={() => onViewDetails(user)}>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <User size={14} className="text-white/40" />
                    </div>
                    <h3 className="text-sm font-medium text-white uppercase tracking-wider truncate">
                      {user.first_name} {user.last_name}
                    </h3>
                  </div>
                  
                  <div className="col-span-4 cursor-pointer overflow-hidden" onClick={() => onViewDetails(user)}>
                    <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest">
                      <Mail size={10} className="shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 cursor-pointer" onClick={() => onViewDetails(user)}>
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest">
                      <Shield size={10} className={cn(
                        "shrink-0",
                        user.role === 'Superadmin' ? "text-purple-400" :
                        user.role === 'Admin' ? "text-blue-400" :
                        "text-white/40"
                      )} />
                      <span className={cn(
                        user.role === 'Superadmin' ? "text-purple-400" :
                        user.role === 'Admin' ? "text-blue-400" :
                        "text-white/40"
                      )}>{user.role}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveUser(user.id);
                      }}
                      disabled={isRemovingUser === user.id}
                      className="px-3 py-1 rounded-md border border-zinc-700 hover:bg-red-500/10 hover:border-red-500/30 text-[10px] uppercase tracking-widest text-zinc-600 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                      title="Remove from group"
                    >
                      {isRemovingUser === user.id ? <Loader2 size={14} className="animate-spin" /> : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
              {filteredUsers.length} User{filteredUsers.length === 1 ? '' : 's'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-medium text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-md cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  , document.body);
};

export default GroupUserModal;
