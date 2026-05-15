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
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 pt-6 pb-4 border-b border-white/5 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl font-bold shrink-0">
                                {localDeal?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">{localDeal?.name || 'Unknown Deal'}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={cn("text-[11px] px-3 py-1 rounded-md border font-semibold uppercase tracking-wider", STATUS_STYLES[localDeal?.status] || STATUS_STYLES.Lead)}>
                                        {localDeal?.status}
                                    </span>
                                    <span className={cn("text-[11px] px-3 py-1 rounded-md border font-semibold uppercase tracking-wider", PRIORITY_STYLES[localDeal?.priority] || PRIORITY_STYLES.Medium)}>
                                        {localDeal?.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button className="p-2 rounded-md hover:bg-blue-500/10 text-blue-500/50 hover:text-blue-400 transition-colors">
                                <TbEdit size={21} />
                            </button>
                            <button 
                                onClick={() => onDelete?.(deal)}
                                className="p-2 rounded-md hover:bg-red-500/10 text-red-500/50 hover:text-red-400 transition-colors"
                                title="Delete Record"
                            >
                                <Trash2 size={19} />
                            </button>
                        </div>
                    </div>
                </div>                {/* Body - Two Column Layout */}
                <div className="overflow-hidden p-6">
                    <div className="flex relative">
                        
                        {/* Left Column: Primary Data - scrolls independently */}
                        <div
                            className="flex-1 overflow-y-auto custom-scrollbar"
                            style={{ maxHeight: '380px' }}
                        >
                            <div className="space-y-6 pb-4 pr-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <User size={14} className="text-blue-400" />
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Primary Contact</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Field icon={Mail} label="Email Address" value={localDeal?.email} />
                                        <Field icon={Phone} label="Phone Number" value={localDeal?.phone} />
                                        <Field icon={Wallet} label="Deal Value" value={localDeal?.value} colorClass="text-emerald-400" />
                                        <Field icon={Calendar} label="Date Created" value={formatDate(localDeal?.raw?.created_at)} />
                                    </div>
                                </div>

                                {/* Assigned User Section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users size={14} className="text-purple-400" />
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Assigned To</p>
                                    </div>
                                    {isEditingUser ? (
                                        <div className="space-y-3">
                                            {/* Custom Dropdown */}
                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md px-4 py-2.5 text-sm text-white flex items-center justify-between hover:border-zinc-700 transition-colors focus:outline-none focus:border-blue-500/50"
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
                                                                    "w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-between",
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
                                                                        "w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-between mt-0.5",
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

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveUser}
                                                    disabled={isSaving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-all disabled:opacity-50"
                                                >
                                                    {isSaving ? <Clock size={14} className="animate-spin" /> : <Save size={14} />}
                                                    Update Assignment
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingUser(false);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="px-4 py-2.5 rounded-md bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                                    <User size={11} className="text-white/40" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white">{getAssignedUserName()}</p>
                                                    {localDeal?.assigned_user_details?.email && (
                                                        <p className="text-[10px] text-white/40 leading-none mt-0.5">{localDeal?.assigned_user_details.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsEditingUser(true)}
                                                className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white/60 transition-all"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                    {error && (
                                        <p className="mt-2 text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>
                                    )}
                                </div>

                                {localDeal?.raw?.notes && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText size={14} className="text-amber-400" />
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Intelligence / Notes</p>
                                        </div>
                                        <div className="p-5 rounded-md bg-white/[0.02] border border-white/5">
                                            <p className="text-sm text-white/50 leading-relaxed italic">
                                                "{localDeal.raw.notes}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vertical Separator - sits right next to the scrollbar */}
                        <div className="mx-6 w-px bg-white/5 self-stretch shrink-0 pointer-events-none" />

                        {/* Right Column: Registry & Metadata - no scroll */}
                        <div className="flex-1">
                            <div className="space-y-6 pb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Database size={14} className="text-purple-400" />
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Additional Registry</p>
                                    </div>
                                    {additionalEntries.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3 pb-4">
                                            {additionalEntries.map(([key, value]) => (
                                                <div key={key} className="px-4 py-3 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                                                    <span className="text-xs text-white/80 font-medium">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="min-h-[300px] rounded-md border border-dashed border-white/5 flex flex-col items-center justify-center gap-3 bg-white/[0.01]">
                                            <Database size={20} className="text-white/5" />
                                            <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">No Extended Data</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-white/5 bg-zinc-900/30 flex items-center justify-end shrink-0 gap-3">
                    <button 
                        onClick={onClose}
                        className="px-8 py-2.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all active:scale-95"
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
