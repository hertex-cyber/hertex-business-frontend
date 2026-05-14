import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Tag, Calendar, Database, FileText, User, Trash2, Wallet, Clock, Users, Save } from 'lucide-react';
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
        <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
            <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
                <Icon size={13} className={colorClass} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/30 mb-0.5">{label}</p>
                <p className="text-sm text-white truncate">{value}</p>
            </div>
        </div>
    );
};

const DealDetailsDialog = ({ isOpen, onClose, deal, onDelete, eligibleUsers = [], onUpdate }) => {
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    console.log("DealDetailsDialog props:", { deal, eligibleUsers });

    useEffect(() => {
        if (deal?.assigned_user) {
            setSelectedUserId(deal.assigned_user);
        } else {
            setSelectedUserId(null);
        }
    }, [deal]);

    const handleSaveUser = async () => {
        if (!deal) return;
        
        setIsSaving(true);
        try {
            await axios.patch(`/api/crm/pipeline/${deal.id}/`, {
                assigned_user: selectedUserId
            });
            
            if (onUpdate) {
                onUpdate();
            }
            
            setIsEditingUser(false);
        } catch (err) {
            console.error("Error assigning user:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !deal) return null;

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
        if (deal.assigned_user_details) {
            return `${deal.assigned_user_details.first_name || ''} ${deal.assigned_user_details.last_name || ''}`.trim() || deal.assigned_user_details.email;
        }
        return 'Not Assigned';
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-white/5 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl font-bold shrink-0">
                                {deal.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{deal.name || 'Unknown Deal'}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={cn("text-[11px] px-3 py-1 rounded-md border font-semibold uppercase tracking-wider", STATUS_STYLES[deal.status] || STATUS_STYLES.Lead)}>
                                        {deal.status}
                                    </span>
                                    <span className={cn("text-[11px] px-3 py-1 rounded-md border font-semibold uppercase tracking-wider", PRIORITY_STYLES[deal.priority] || PRIORITY_STYLES.Medium)}>
                                        {deal.priority}
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
                </div>

                {/* Body - Two Column Layout */}
                <div className="flex-1 p-8 overflow-hidden">
                    <div className="grid grid-cols-2 gap-16 h-full relative">
                        {/* Vertical Separator - Connected to Header/Footer */}
                        <div className="absolute top-[-32px] bottom-[-32px] left-1/2 -ml-8 w-px bg-white/5" />
                        
                        {/* Left Column: Primary Data (Scrollable) */}
                        <div className="flex flex-col overflow-y-auto custom-scrollbar pr-4 h-full">
                            <div className="space-y-8 flex-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <User size={14} className="text-blue-400" />
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Primary Contact</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Field icon={Mail} label="Email Address" value={deal.email} />
                                        <Field icon={Phone} label="Phone Number" value={deal.phone} />
                                        <Field icon={Wallet} label="Deal Value" value={deal.value} colorClass="text-emerald-400" />
                                        <Field icon={Calendar} label="Date Created" value={formatDate(deal.raw?.created_at)} />
                                        <Field icon={Clock} label="Last Activity" value={formatDate(deal.raw?.updated_at)} />
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
                                            <select
                                                value={selectedUserId || ''}
                                                onChange={(e) => setSelectedUserId(e.target.value || null)}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                            >
                                                <option value="">-- Unassigned --</option>
                                                {eligibleUsers.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveUser}
                                                    disabled={isSaving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-all disabled:opacity-50"
                                                >
                                                    {isSaving ? <Clock size={14} className="animate-spin" /> : <Save size={14} />}
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingUser(false)}
                                                    className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                                    <User size={12} className="text-white/40" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white">{getAssignedUserName()}</p>
                                                    {deal.assigned_user_details?.email && (
                                                        <p className="text-xs text-white/40">{deal.assigned_user_details.email}</p>
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
                                </div>

                                {deal.raw?.notes && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText size={14} className="text-amber-400" />
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Intelligence / Notes</p>
                                        </div>
                                        <div className="p-5 rounded-md bg-white/[0.02] border border-white/5">
                                            <p className="text-sm text-white/50 leading-relaxed italic">
                                                "{deal.raw.notes}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Registry & Metadata (Scrollable) */}
                        <div className="flex flex-col overflow-y-auto custom-scrollbar pr-4 h-full">
                            <div className="space-y-8 flex-1">
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
