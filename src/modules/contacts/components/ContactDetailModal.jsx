import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Tag, Calendar, Database, ExternalLink, Copy, Check, Trash2 } from 'lucide-react';
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

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                    <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                        {/* Header */}
                        <div className="px-6 pt-6 pb-5 border-b border-white/5 shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-semibold shrink-0">
                                        {contact.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-white">{contact.name}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-white/30">{contact.contact_id}</span>
                                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", STATUS_STYLES[contact.status] || STATUS_STYLES.Lead)}>
                                                {contact.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500/50 hover:text-red-400 transition-colors"
                                        title="Delete contact"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-5">
                            <div>
                                <Field
                                    icon={Mail} label="Email" value={contact.email}
                                    actions={contact.email && (
                                        <a href={`https://mail.google.com/mail/?view=cm&to=${contact.email}`} target="_blank" rel="noreferrer"
                                            className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500/60 hover:text-blue-400 transition-colors" title="Open in Gmail">
                                            <ExternalLink size={12} />
                                        </a>
                                    )}
                                />
                                <Field
                                    icon={Phone} label="Phone" value={contact.phone}
                                    actions={contact.phone && <CopyButton text={contact.phone} />}
                                />
                                <Field icon={Tag}      label="Source" value={contact.source} />
                                <Field icon={Calendar} label="Added"  value={contact.created_at ? new Date(contact.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
                            </div>

                            {additionalEntries.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Database size={12} className="text-white/20" />
                                        <p className="text-xs text-white/30">Additional Details</p>
                                        <div className="flex-1 h-px bg-white/5" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {additionalEntries.map(([key, value]) => (
                                            <div key={key} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                                <p className="text-[10px] text-white/30 mb-1 truncate capitalize">{key.replace(/_/g, ' ')}</p>
                                                <p className="text-xs text-white truncate">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
