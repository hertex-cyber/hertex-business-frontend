import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Users, X, CheckCircle2, Circle, User, Mail, Shield, Loader2, ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import CRMApiService from "../services/crmService";

const UserPipelineManager = ({ 
  isOpen, 
  onClose, 
  departments = [], 
  users = [],
  selectedPipeline = null,
  onPipelineUpdated
}) => {
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [expandedDepartments, setExpandedDepartments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentType, setAssignmentType] = useState('manual');

  useEffect(() => {
    if (selectedPipeline) {
      setSelectedDepartments(selectedPipeline.departments || []);
      setAssignmentType(selectedPipeline.assignment_type || 'manual');
    }
  }, [selectedPipeline]);

  const toggleDepartment = (e, dept) => {
    e.stopPropagation();
    const isSelected = selectedDepartments.some(d => d.id === dept.id);
    if (isSelected) {
      setSelectedDepartments(selectedDepartments.filter(d => d.id !== dept.id));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  const toggleExpand = (dept) => {
    const isExpanded = expandedDepartments.some(d => d.id === dept.id);
    if (isExpanded) {
      setExpandedDepartments(expandedDepartments.filter(d => d.id !== dept.id));
    } else {
      setExpandedDepartments([...expandedDepartments, dept]);
    }
  };

  const getDeptUsers = (dept) => {
    return users.filter(user => 
      user.departments?.some(d => d.id === dept.id)
    );
  };

  // Filter groups and users based on search
  const filteredDepartments = useMemo(() => {
    if (!searchQuery) return departments;
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [departments, searchQuery]);

  // Get unique users from selected departments
  const uniqueSelectedUsers = useMemo(() => {
    const userMap = new Map();
    selectedDepartments.forEach(dept => {
      const deptUsers = users.filter(user => 
        user.departments?.some(d => d.id === dept.id)
      );
      deptUsers.forEach(user => {
        if (!userMap.has(user.id)) {
          userMap.set(user.id, user);
        }
      });
    });
    return Array.from(userMap.values());
  }, [selectedDepartments, users]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return uniqueSelectedUsers;
    return uniqueSelectedUsers.filter(user => 
      (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueSelectedUsers, searchQuery]);

  const handleSave = async () => {
    if (!selectedPipeline) return;
    
    setIsSaving(true);
    try {
      await CRMApiService.updatePipeline(selectedPipeline.id, {
        department_ids: selectedDepartments.map(d => d.id),
        assignment_type: assignmentType
      });
      
      if (onPipelineUpdated) {
        onPipelineUpdated();
      }
      
      onClose();
    } catch (err) {
      console.error("Error updating pipeline:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 pt-8 pb-3 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">Manage Pipeline Users</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                Assign groups to {selectedPipeline?.name || "pipeline"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Subheader with Search and Tabs */}
        <div className="px-8 py-4 border-b border-zinc-800 bg-zinc-900/10 shrink-0">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              <input
                type="text"
                placeholder={activeTab === 'groups' ? "Search groups..." : "Search users..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-950 transition-all"
              />
            </div>

            {/* Tabs */}
            <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
              <div 
                className={cn(
                  "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
                  activeTab === 'groups' 
                    ? "left-0 w-1/3 rounded-l rounded-r-none bg-blue-500/20" 
                    : activeTab === 'users'
                    ? "left-1/3 w-1/3 bg-blue-500/20"
                    : "left-2/3 w-1/3 rounded-r rounded-l-none bg-blue-500/20"
                )}
              />
              <button
                onClick={() => setActiveTab('groups')}
                className={cn(
                  "relative z-10 px-4 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 w-1/3",
                  activeTab === 'groups' ? "text-blue-400" : "text-white/50 hover:text-white/80"
                )}
              >
                Groups
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={cn(
                  "relative z-10 px-4 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 w-1/3",
                  activeTab === 'users' ? "text-blue-400" : "text-white/50 hover:text-white/80"
                )}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('assign')}
                className={cn(
                  "relative z-10 px-4 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 w-1/3",
                  activeTab === 'assign' ? "text-blue-400" : "text-white/50 hover:text-white/80"
                )}
              >
                Assign
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {selectedPipeline ? (
            activeTab === 'groups' ? (
              // Groups Tab
              <div className="space-y-3">
                {filteredDepartments.map((dept) => {
                  const isSelected = selectedDepartments.some(d => d.id === dept.id);
                  const isExpanded = expandedDepartments.some(d => d.id === dept.id);
                  const deptUsers = getDeptUsers(dept);

                  return (
                    <div 
                      key={dept.id}
                      className={`rounded-lg border transition-all ${
                        isSelected 
                          ? "bg-blue-500/10 border-blue-500/30" 
                          : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50"
                      }`}
                    >
                      {/* Group Header */}
                      <div 
                        className="flex items-center gap-3 p-4 cursor-pointer"
                        onClick={() => toggleExpand(dept)}
                      >
                        <button
                          onClick={(e) => toggleDepartment(e, dept)}
                          className="shrink-0"
                        >
                          {isSelected ? (
                            <CheckCircle2 size={18} className="text-blue-400" />
                          ) : (
                            <Circle size={18} className="text-white/30" />
                          )}
                        </button>
                        
                        <div className="flex-1 text-left">
                          <h4 className="text-sm font-medium text-white">{dept.name}</h4>
                          <p className="text-xs text-white/40">{dept.user_count || 0} users</p>
                        </div>

                        <button
                          className="shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-white/30" />
                          ) : (
                            <ChevronRight size={16} className="text-white/30" />
                          )}
                        </button>
                      </div>

                      {/* Users List */}
                      {isExpanded && (
                        <div className="border-t border-zinc-800/50 px-4 py-3">
                          {deptUsers.length === 0 ? (
                            <p className="text-xs text-white/20 uppercase tracking-widest py-2 text-center">
                              No users in this group
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                              {deptUsers.map((user) => (
                                <div 
                                  key={user.id} 
                                  className="flex items-center gap-3 p-3 rounded-md bg-zinc-900/30"
                                >
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                    <User size={12} className="text-white/40" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-white truncate">
                                      {user.first_name} {user.last_name}
                                    </h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Mail size={9} className="text-white/40 shrink-0" />
                                      <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Shield size={9} className={
                                      user.role === 'Superadmin' ? "text-purple-400" :
                                      user.role === 'Admin' ? "text-blue-400" :
                                      "text-white/40"
                                    } />
                                    <span className={`text-[9px] uppercase tracking-widest font-medium ${
                                      user.role === 'Superadmin' ? "text-purple-400" :
                                      user.role === 'Admin' ? "text-blue-400" :
                                      "text-white/40"
                                    }`}>
                                      {user.role}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : activeTab === 'users' ? (
              // Users Tab
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium">
                      {searchQuery ? "No users found" : (selectedDepartments.length === 0 ? "Select groups to see users" : "No users in selected groups")}
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                          <User size={16} className="text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {user.first_name} {user.last_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail size={10} className="text-white/40 shrink-0" />
                            <p className="text-xs text-white/40 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield size={10} className={
                            user.role === 'Superadmin' ? "text-purple-400" :
                            user.role === 'Admin' ? "text-blue-400" :
                            "text-white/40"
                          } />
                          <span className={`text-[10px] uppercase tracking-widest font-medium ${
                            user.role === 'Superadmin' ? "text-purple-400" :
                            user.role === 'Admin' ? "text-blue-400" :
                            "text-white/40"
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Assign Tab
              <div className="space-y-3">
                {/* Assignment Type Options - One Below Other */}
                {[
                  { id: 'round_robin', label: 'Round Robin', description: 'Distribute deals evenly' },
                  { id: 'least_loaded', label: 'Least Loaded', description: 'Assign to user with fewest deals' },
                  { id: 'manual', label: 'Manual', description: 'Assign deals manually' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setAssignmentType(type.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-all",
                      assignmentType === type.id
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {assignmentType === type.id ? (
                        <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-white/30 shrink-0" />
                      )}
                      <div className="flex-1">
                        <h4 className={cn(
                          "text-sm font-medium",
                          assignmentType === type.id ? "text-blue-400" : "text-white/80"
                        )}>
                          {type.label}
                        </h4>
                        <p className="text-xs text-white/40 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium">
                Select a pipeline first in the top-right selector
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-end shrink-0 gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-medium text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-md cursor-pointer"
          >
            Close
          </button>
          {selectedPipeline && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-[9px] font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 hover:border-blue-500/40 uppercase tracking-widest transition-all rounded-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              Save
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserPipelineManager;
