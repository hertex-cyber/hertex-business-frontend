import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Tag, Calendar, Database, ExternalLink, Copy, Check, Trash2, User } from 'lucide-react';
import { TbEdit } from "react-icons/tb";
import axios from 'axios';
import { cn } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

const STATUS_STYLES = {
    Lead:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Prospect: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Customer: 'bg-green-500/10 text-green-400 border-green-500/20',
    Inactive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const Field = ({ icon: Icon, label, value, actions }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
            <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
                <Icon size={13} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/30 mb-0.5">{label}</p>
                <p className="text-sm text-white truncate">{value}</p>
            </div>
            {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
        </div>
    );
};

const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500/60 hover:text-blue-400 transition-colors" title="Copy">
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
        </button>
    );
};

const ContactDetailModal = ({ contact, onClose, onDeleted }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!contact) return null;

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await axios.delete(`/api/contacts/${contact.id}/`);
            onDeleted?.(contact.id);
            onClose();
        } catch (err) {
            console.error('Delete failed:', err);
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const additionalEntries = Object.entries(contact.additional_data || {}).filter(
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

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                    <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 border-b border-white/5 shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl font-bold shrink-0">
                                        {contact.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">{contact.name || 'Unknown Contact'}</h2>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{contact.contact_id}</span>
                                            <span className={cn("text-[11px] px-3 py-1 rounded-md border font-semibold uppercase tracking-wider", STATUS_STYLES[contact.status] || STATUS_STYLES.Lead)}>
                                                {contact.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button className="p-2 rounded-md hover:bg-blue-500/10 text-blue-500/50 hover:text-blue-400 transition-colors">
                                        <TbEdit size={21} />
                                    </button>
                                    <button 
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="p-2 rounded-md hover:bg-red-500/10 text-red-500/50 hover:text-red-400 transition-colors"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={19} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Body - Two Column Layout */}
                        <div className="flex-1 overflow-hidden p-8">
                            <div className="grid grid-cols-2 gap-16 h-full relative">
                                {/* Vertical Separator - Connected to Header/Footer */}
                                <div className="absolute top-[-32px] bottom-[-32px] left-1/2 -ml-8 w-px bg-white/5" />
                                
                                {/* Left Column: Primary Data (Fixed) */}
                                <div className="space-y-8 overflow-y-auto custom-scrollbar pr-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <User size={14} className="text-blue-400" />
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Primary Identity</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Field 
                                                icon={Mail} label="Email Address" value={contact.email} 
                                                actions={contact.email && (
                                                    <a href={`https://mail.google.com/mail/?view=cm&to=${contact.email}`} target="_blank" rel="noreferrer"
                                                        className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500/60 hover:text-blue-400 transition-colors">
                                                        <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            />
                                            <Field 
                                                icon={Phone} label="Phone Number" value={contact.phone} 
                                                actions={contact.phone && <CopyButton text={contact.phone} />}
                                            />
                                            <Field icon={Tag} label="Lead Source" value={contact.source} />
                                            <Field icon={Calendar} label="Date Onboarded" value={formatDate(contact.created_at)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Registry & Metadata (Scrollable) */}
                                <div className="space-y-8 overflow-y-auto custom-scrollbar pr-4">
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
                                            <div className="h-full min-h-[300px] rounded-md border border-dashed border-white/5 flex flex-col items-center justify-center gap-3 bg-white/[0.01]">
                                                <Database size={20} className="text-white/5" />
                                                <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">No Extended Data</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-white/5 bg-zinc-900/30 flex items-center justify-end shrink-0">
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
            )}

            <ConfirmDeleteDialog
                isOpen={showDeleteDialog}
                title="Delete Contact"
                description={`Are you sure you want to delete ${contact.name}? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </>
    );
};

export default ContactDetailModal;
