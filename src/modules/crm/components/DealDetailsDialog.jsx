import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Tag, Calendar, Database, FileText, User, Trash2, Wallet, Clock, Users, Save, ChevronDown, Check } from 'lucide-react';
import { TbEdit } from "react-icons/tb";
import { cn } from '@/lib/utils';
import axios from 'axios';

const STATUS_STYLES = {
    Lead:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Prospect: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Customer: 'bg-green-500/10 text-green-400 border-green-500/20',
    Inactive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    Won:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Lost:     'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_STYLES = {
    High:   'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Low:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const Field = ({ icon: Icon, label, value, colorClass }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
                <Icon size={12} className={colorClass} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] text-white/30 mb-0.5 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-white truncate">{value}</p>
            </div>
        </div>
    );
};

const DealDetailsDialog = ({ isOpen, onClose, deal, onDelete, eligibleUsers = [], onUpdate }) => {
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [localDeal, setLocalDeal] = useState(deal);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    useEffect(() => {
        setLocalDeal(deal);
    }, [deal]);

    console.log("DealDetailsDialog props:", { deal, eligibleUsers });

    useEffect(() => {
        if (localDeal?.assigned_user) {
            setSelectedUserId(localDeal.assigned_user);
        } else {
            setSelectedUserId(null);
        }
    }, [localDeal]);

    const handleSaveUser = async () => {
        if (!localDeal) return;
        
        setIsSaving(true);
        try {
            const response = await axios.patch(`/api/crm/pipeline/${localDeal.id}/`, {
                assigned_user: selectedUserId
            });
            
            // Transform the raw response to match the 'deal' object structure used in UI
            // In CRM.jsx, transformDeal is used. We should simulate that here or use the returned data.
            const updatedRaw = response.data;
            const transformed = {
                id: updatedRaw.id,
                name: updatedRaw.contact_details?.name || "Unknown",
                email: updatedRaw.contact_details?.email || "No Email",
                phone: updatedRaw.contact_details?.phone || "No Phone",
                status: updatedRaw.contact_details?.status || "Lead",
                value: `₹ ${updatedRaw.value}`,
                priority: updatedRaw.priority,
                lastContact: new Date(updatedRaw.updated_at).toLocaleDateString(),
                assigned_user: updatedRaw.assigned_user,
                assigned_user_details: updatedRaw.assigned_user_details,
                stage: updatedRaw.stage,
                raw: updatedRaw,
            };
            
            setLocalDeal(transformed);
            
            if (onUpdate) {
                onUpdate(transformed);
            }
            
            setIsEditingUser(false);
            setIsDropdownOpen(false);
            setError(null);
        } catch (err) {
            console.error("Error assigning user:", err);
            setError(err.response?.data?.detail || err.message || "Failed to assign user");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !deal || !localDeal) return null;

    const additionalEntries = Object.entries(deal.raw?.contact_details?.additional_data || {}).filter(
        ([, v]) => v !== null && v !== undefined && v !== ''
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const getAssignedUserName = () => {
        if (localDeal?.assigned_user_details) {
            return `${localDeal.assigned_user_details.first_name || ''} ${localDeal.assigned_user_details.last_name || ''}`.trim() || localDeal.assigned_user_details.email;
        }
        return 'Not Assigned';
    };    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-zinc-900 bg-white/[0.01] shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold shrink-0">
                                {localDeal?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white uppercase tracking-wider">{localDeal?.name || 'Unknown Deal'}</h2>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-[0.15em]", STATUS_STYLES[localDeal?.status] || STATUS_STYLES.Lead)}>
                                        {localDeal?.status}
                                    </span>
                                    <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-[0.15em]", PRIORITY_STYLES[localDeal?.priority] || PRIORITY_STYLES.Medium)}>
                                        {localDeal?.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group cursor-pointer">
                                <TbEdit size={16} />
                            </button>
                            <button 
                                onClick={() => onDelete?.(deal)}
                                className="h-9 w-9 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 transition-all flex items-center justify-center group cursor-pointer"
                                title="Delete Record"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button 
                                onClick={onClose}
                                className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group cursor-pointer"
                                title="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body - Two Column Layout */}
                <div className="overflow-hidden p-8 flex-1 min-h-0 flex flex-col">
                    <div className="flex relative flex-1 min-h-0">
                        
                        {/* Left Column: Primary Data - scrolls independently */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-6">
                            <div className="space-y-6 pb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <User size={14} className="text-blue-400" />
                                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Primary Contact</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Field icon={Mail} label="Email Address" value={localDeal?.email} />
                                        <Field icon={Phone} label="Phone Number" value={localDeal?.phone} />
                                        <Field icon={Wallet} label="Deal Value" value={localDeal?.value} colorClass="text-emerald-400" />
                                        <Field icon={Calendar} label="Date Created" value={formatDate(localDeal?.raw?.created_at)} />
                                    </div>
                                </div>

                                {/* Assigned User Section */}
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users size={14} className="text-purple-400" />
                                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Assigned To</p>
                                    </div>
                                    {isEditingUser ? (
                                        <div className="space-y-3">
                                            {/* Custom Dropdown */}
                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md px-4 py-2.5 text-[10px] font-medium uppercase tracking-widest text-white flex items-center justify-between hover:border-zinc-700 transition-colors focus:outline-none focus:border-blue-500/50"
                                                >
                                                    <span className="truncate">
                                                        {selectedUserId 
                                                            ? eligibleUsers.find(u => u.id === selectedUserId)?.first_name 
                                                                ? `${eligibleUsers.find(u => u.id === selectedUserId).first_name} ${eligibleUsers.find(u => u.id === selectedUserId).last_name || ''}`
                                                                : eligibleUsers.find(u => u.id === selectedUserId)?.email
                                                            : '-- Unassigned --'}
                                                    </span>
                                                    <ChevronDown size={14} className={cn("text-white/20 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                                                </button>

                                                {isDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl z-[1101] max-h-48 overflow-y-auto custom-scrollbar p-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUserId(null);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={cn(
                                                                "w-full text-left px-3 py-2 rounded text-[10px] font-medium uppercase tracking-wider transition-colors flex items-center justify-between",
                                                                !selectedUserId ? "bg-blue-500/10 text-blue-400" : "text-white/60 hover:bg-white/5"
                                                            )}
                                                        >
                                                            -- Unassigned --
                                                            {!selectedUserId && <Check size={12} />}
                                                        </button>
                                                        {eligibleUsers.map(user => (
                                                            <button
                                                                key={user.id}
                                                                onClick={() => {
                                                                    setSelectedUserId(user.id);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2 rounded text-[10px] font-medium uppercase tracking-wider transition-colors flex items-center justify-between mt-0.5",
                                                                    selectedUserId === user.id ? "bg-blue-500/10 text-blue-400" : "text-white/60 hover:bg-white/5"
                                                                )}
                                                            >
                                                                <span className="truncate">
                                                                    {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}
                                                                </span>
                                                                {selectedUserId === user.id && <Check size={12} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={handleSaveUser}
                                                    disabled={isSaving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer"
                                                >
                                                    {isSaving ? <Clock size={12} className="animate-spin" /> : <Save size={12} />}
                                                    Update Assignment
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingUser(false);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-white/[0.01] border border-zinc-900 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                                    <User size={12} className="text-white/40" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] text-white uppercase tracking-wider font-semibold">{getAssignedUserName()}</p>
                                                    {localDeal?.assigned_user_details?.email && (
                                                        <p className="text-[9px] text-white/30 tracking-widest uppercase leading-none mt-1">{localDeal?.assigned_user_details.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsEditingUser(true)}
                                                className="px-3 py-1.5 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 text-[9px] font-medium uppercase tracking-[0.15em] transition-all cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                    {error && (
                                        <p className="mt-2 text-[9px] text-red-500 font-medium uppercase tracking-wider">{error}</p>
                                    )}
                                </div>

                                {localDeal?.raw?.notes && (
                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText size={14} className="text-amber-400" />
                                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Intelligence / Notes</p>
                                        </div>
                                        <div className="p-5 rounded-lg bg-white/[0.01] border border-zinc-900">
                                            <p className="text-xs text-white/50 leading-relaxed italic uppercase tracking-wider font-medium">
                                                "{localDeal.raw.notes}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                             </div>
                         </div>

                         {/* Vertical Separator */}
                         <div className="w-px bg-zinc-900 self-stretch shrink-0 pointer-events-none" />

                         {/* Right Column: Registry & Metadata - no scroll */}
                         <div className="flex-1 pl-6 overflow-y-auto custom-scrollbar">
                             <div className="space-y-6 pb-4">
                                 <div>
                                     <div className="flex items-center gap-2 mb-4">
                                         <Database size={14} className="text-purple-400" />
                                         <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Additional Registry</p>
                                     </div>
                                     {additionalEntries.length > 0 ? (
                                         <div className="grid grid-cols-1 gap-3 pb-4">
                                             {additionalEntries.map(([key, value]) => (
                                                 <div key={key} className="px-4 py-3.5 rounded-lg bg-white/[0.01] border border-zinc-900 flex items-center justify-between group hover:bg-white/[0.02] transition-all duration-300">
                                                     <span className="text-[9px] font-medium text-white/30 uppercase tracking-[0.15em]">{key.replace(/_/g, ' ')}</span>
                                                     <span className="text-[10px] text-white uppercase tracking-wider font-semibold">{String(value)}</span>
                                                 </div>
                                             ))}
                                         </div>
                                     ) : (
                                         <div className="min-h-[250px] rounded-lg border border-dashed border-zinc-900 flex flex-col items-center justify-center gap-3 bg-white/[0.005]">
                                             <Database size={18} className="text-white/5" />
                                             <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No Extended Data</p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>

                     </div>
                 </div>

                 {/* Footer */}
                 <div className="px-8 py-6 border-t border-zinc-900 bg-white/[0.005] flex items-center justify-end shrink-0 gap-3">
                     <button 
                         onClick={onClose}
                         className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] cursor-pointer"
                     >
                         Close
                     </button>
                  </div>
              </div>
          </div>,
          document.body
      );
  };

  export default DealDetailsDialog;
