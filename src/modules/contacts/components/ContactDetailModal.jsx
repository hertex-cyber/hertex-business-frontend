import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Tag, Calendar, Database, ExternalLink, Copy, Check, Trash2, User, Plus, Loader2, Save } from 'lucide-react';
import { TbEdit } from "react-icons/tb";
import axios from 'axios';
import { cn } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import AddToCRMModal from './AddToCRMModal';

const STATUS_STYLES = {
    Lead:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Prospect: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Customer: 'bg-green-500/10 text-green-400 border-green-500/20',
    Inactive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const Field = ({ icon: Icon, label, value, actions, isEditing, children }) => {
    if (!value && !isEditing) return null;
    return (
        <div className="flex items-start gap-3 py-3.5 border-b border-zinc-900 last:border-0">
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
                <Icon size={12} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider font-semibold">{label}</p>
                {isEditing ? (
                    children
                ) : (
                    <p className="text-xs text-white uppercase tracking-wider font-semibold truncate">{value}</p>
                )}
            </div>
            {!isEditing && actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
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
        <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500/60 hover:text-blue-400 transition-colors cursor-pointer" title="Copy">
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
        </button>
    );
};

const ContactDetailModal = ({ contact, onClose, onDeleted, onUpdated }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Inline editing states
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'Lead',
        source: '',
    });
    const [editAdditionalData, setEditAdditionalData] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [pipelines, setPipelines] = useState([]);
    const [deletingDealId, setDeletingDealId] = useState(null);
    const [pipelineDealToDelete, setPipelineDealToDelete] = useState(null);
    const [showAddToCRM, setShowAddToCRM] = useState(false);

    useEffect(() => {
        if (contact) {
            setEditForm({
                name: contact.name || '',
                email: contact.email || '',
                phone: contact.phone || '',
                status: contact.status || 'Lead',
                source: contact.source || '',
            });
            const mapped = Object.entries(contact.additional_data || {}).map(([k, v], idx) => ({
                id: `${idx}-${Date.now()}`,
                key: k,
                value: String(v || ''),
            }));
            setEditAdditionalData(mapped);
            setPipelines(contact.pipelines || []);
            setIsEditing(false);
            setValidationError('');
        }
    }, [contact]);

    const handleConfirmDeletePipelineDeal = async () => {
        if (!pipelineDealToDelete) return;
        const dealId = pipelineDealToDelete.deal_id;
        setDeletingDealId(dealId);
        try {
            await axios.delete(`/api/crm/pipeline/${dealId}/`);
            const updatedPipelines = pipelines.filter(p => p.deal_id !== dealId);
            setPipelines(updatedPipelines);
            
            if (onUpdated) {
                onUpdated({
                    ...contact,
                    pipelines: updatedPipelines
                });
            }
            setPipelineDealToDelete(null);
        } catch (err) {
            console.error("Failed to remove contact from pipeline:", err);
            alert("An error occurred while removing the contact from the pipeline.");
        } finally {
            setDeletingDealId(null);
        }
    };

    const handleConfirmAddToCRM = async (pipelineId, stageId) => {
        if (!stageId) return;
        try {
            const res = await axios.post('/api/crm/pipeline/', { 
                contact: contact.id, 
                stage: stageId,
                pipeline: pipelineId
            });
            const newDeal = res.data;
            const addedPipeline = {
                deal_id: newDeal.id,
                pipeline_id: newDeal.pipeline,
                pipeline_name: newDeal.pipeline_details?.name || 'Unknown Pipeline',
                stage_id: newDeal.stage,
                stage_name: newDeal.stage_details?.name || 'Unknown Stage',
                priority: newDeal.priority || 'Medium',
                value: newDeal.value || 0
            };
            const updatedPipelines = [...pipelines, addedPipeline];
            setPipelines(updatedPipelines);
            
            if (onUpdated) {
                onUpdated({
                    ...contact,
                    pipelines: updatedPipelines
                });
            }
            setShowAddToCRM(false);
        } catch (err) {
            console.error('Failed to add to CRM:', err);
            alert('Failed to add contact to the selected CRM pipeline.');
        }
    };

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

    const handleStartEdit = () => {
        setValidationError('');
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            name: contact.name || '',
            email: contact.email || '',
            phone: contact.phone || '',
            status: contact.status || 'Lead',
            source: contact.source || '',
        });
        const mapped = Object.entries(contact.additional_data || {}).map(([k, v], idx) => ({
            id: `${idx}-${Date.now()}`,
            key: k,
            value: String(v || ''),
        }));
        setEditAdditionalData(mapped);
        setValidationError('');
    };

    const handleAddAdditionalField = () => {
        setEditAdditionalData(prev => [
            ...prev,
            { id: `new-${Date.now()}-${Math.random()}`, key: '', value: '' }
        ]);
    };

    const handleRemoveAdditionalField = (idx) => {
        setEditAdditionalData(prev => prev.filter((_, i) => i !== idx));
    };

    const handleUpdateAdditionalKey = (idx, newKey) => {
        setEditAdditionalData(prev => prev.map((item, i) => i === idx ? { ...item, key: newKey } : item));
    };

    const handleUpdateAdditionalValue = (idx, newValue) => {
        setEditAdditionalData(prev => prev.map((item, i) => i === idx ? { ...item, value: newValue } : item));
    };

    const handleSaveEdit = async () => {
        if (!editForm.name?.trim()) {
            setValidationError("Name is required.");
            return;
        }
        if (!editForm.email?.trim() && !editForm.phone?.trim()) {
            setValidationError("Either Email Address or Phone Number must be provided.");
            return;
        }

        setIsSaving(true);
        setValidationError('');

        try {
            const additionalDataObj = {};
            editAdditionalData.forEach(item => {
                const cleanKey = item.key?.trim()?.replace(/\s+/g, '_')?.toLowerCase();
                if (cleanKey) {
                    additionalDataObj[cleanKey] = item.value?.trim() || '';
                }
            });

            const payload = {
                name: editForm.name.trim(),
                email: editForm.email.trim() || null,
                phone: editForm.phone.trim() || null,
                status: editForm.status,
                source: editForm.source.trim() || null,
                additional_data: additionalDataObj,
            };

            const response = await axios.patch(`/api/contacts/${contact.id}/`, payload);
            setIsEditing(false);
            if (onUpdated) {
                onUpdated(response.data);
            }
        } catch (err) {
            console.error("Failed to update contact:", err);
            setValidationError(err.response?.data?.detail || err.message || "Failed to update contact.");
        } finally {
            setIsSaving(false);
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
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                    <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-zinc-900 bg-white/[0.01] shrink-0">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold shrink-0">
                                        {(isEditing ? editForm.name : contact.name)?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={editForm.name} 
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                placeholder="Contact Name"
                                                className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-white uppercase tracking-wider font-semibold focus:border-blue-500/50 outline-none w-full"
                                            />
                                        ) : (
                                            <h2 className="text-base font-semibold text-white uppercase tracking-wider truncate">{contact.name || 'Unknown Contact'}</h2>
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{contact.contact_id}</span>
                                            <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-[0.15em]", STATUS_STYLES[contact.status] || STATUS_STYLES.Lead)}>
                                                {contact.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {isEditing ? (
                                        <>
                                            <button 
                                                onClick={handleSaveEdit}
                                                disabled={isSaving}
                                                className="px-6 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 cursor-pointer"
                                            >
                                                {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                                            </button>
                                            <button 
                                                onClick={handleCancelEdit}
                                                className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={handleStartEdit}
                                                className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group cursor-pointer"
                                                title="Edit Record"
                                            >
                                                <TbEdit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setShowDeleteDialog(true)}
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
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Body - Two Column Layout */}
                        <div className="overflow-hidden p-8 flex-1 min-h-0 flex flex-col">
                            <div className="flex relative flex-1 min-h-0">
                                
                                {/* Left Column: Primary Data */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-6">
                                    <div className="space-y-6 pb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <User size={14} className="text-blue-400" />
                                                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Primary Identity</p>
                                            </div>
                                            {validationError && (
                                                <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-medium uppercase tracking-wider rounded">
                                                    {validationError}
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <Field 
                                                    icon={Mail} label="Email Address" value={contact.email} 
                                                    isEditing={isEditing}
                                                    actions={contact.email && (
                                                        <a href={`https://mail.google.com/mail/?view=cm&to=${contact.email}`} target="_blank" rel="noreferrer"
                                                            className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500/60 hover:text-blue-400 transition-colors">
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                >
                                                    <input 
                                                        type="email" 
                                                        value={editForm.email} 
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        placeholder="email@example.com"
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                                                    />
                                                </Field>
                                                <Field 
                                                    icon={Phone} label="Phone Number" value={contact.phone} 
                                                    isEditing={isEditing}
                                                    actions={contact.phone && <CopyButton text={contact.phone} />}
                                                >
                                                    <input 
                                                        type="text" 
                                                        value={editForm.phone} 
                                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                        placeholder="+1 234 567 8900"
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                                                    />
                                                </Field>
                                                <Field icon={Tag} label="Lead Source" value={contact.source} isEditing={isEditing}>
                                                    <input 
                                                        type="text" 
                                                        value={editForm.source} 
                                                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                                                        placeholder="Self-Registered, Import, etc."
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                                                    />
                                                </Field>
                                                <Field icon={Calendar} label="Date Onboarded" value={formatDate(contact.created_at)} isEditing={false} />

                                                {/* Active Pipelines Track */}
                                                <div className="pt-5 border-t border-zinc-900 mt-4">
                                                    <div className="flex items-center justify-between gap-2 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Database size={12} className="text-emerald-400" />
                                                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 font-semibold">Active Pipelines</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowAddToCRM(true)}
                                                            className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                                                            title="Add to Pipeline"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    {pipelines && pipelines.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {pipelines.map((deal) => (
                                                                <div 
                                                                    key={deal.deal_id} 
                                                                    className="px-3.5 py-3 rounded bg-emerald-500/[0.01] border border-emerald-500/10 hover:border-emerald-500/20 transition-all flex items-center justify-between group"
                                                                >
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-[10px] text-white uppercase tracking-wider font-semibold truncate">
                                                                            {deal.pipeline_name}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 text-white/40 uppercase tracking-widest font-mono">
                                                                                {deal.stage_name}
                                                                            </span>
                                                                            <span className={cn(
                                                                                "text-[8px] px-1.5 py-0.5 rounded-sm border uppercase tracking-wider font-bold",
                                                                                deal.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                                deal.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                            )}>
                                                                                {deal.priority}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                                                        {deal.value > 0 && (
                                                                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                                                                ₹ {deal.value}
                                                                            </p>
                                                                        )}
                                                                        <button
                                                                            onClick={() => setPipelineDealToDelete(deal)}
                                                                            disabled={deletingDealId === deal.deal_id}
                                                                            className="h-7 w-7 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                                                                            title="Remove from Pipeline"
                                                                        >
                                                                            {deletingDealId === deal.deal_id ? (
                                                                                <Loader2 size={12} className="animate-spin" />
                                                                            ) : (
                                                                                <Trash2 size={12} />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-4 px-3 rounded border border-dashed border-zinc-900 bg-white/[0.002] text-center">
                                                            <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-medium">No Active Pipelines</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Separator */}
                                <div className="w-px bg-zinc-900 self-stretch shrink-0 pointer-events-none" />

                                {/* Right Column: Registry & Metadata */}
                                <div className="flex-1 pl-6 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-6 pb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Database size={14} className="text-purple-400" />
                                                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Additional Registry</p>
                                            </div>
                                            {isEditing ? (
                                                <div className="space-y-3 pb-4">
                                                    {editAdditionalData.map((item, idx) => (
                                                        <div key={item.id} className="flex items-center gap-2">
                                                            <input 
                                                                type="text" 
                                                                value={item.key} 
                                                                onChange={(e) => handleUpdateAdditionalKey(idx, e.target.value)} 
                                                                placeholder="Field Name"
                                                                className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white font-medium uppercase tracking-wider outline-none focus:border-blue-500/50"
                                                            />
                                                            <input 
                                                                type="text" 
                                                                value={item.value} 
                                                                onChange={(e) => handleUpdateAdditionalValue(idx, e.target.value)} 
                                                                placeholder="Value"
                                                                className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white font-medium outline-none focus:border-blue-500/50"
                                                            />
                                                            <button 
                                                                onClick={() => handleRemoveAdditionalField(idx)}
                                                                className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0 cursor-pointer"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={handleAddAdditionalField}
                                                        className="w-full py-2 rounded-sm border border-dashed border-zinc-800 hover:border-zinc-700 text-white/40 hover:text-white/60 text-[9px] font-medium uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                                                    >
                                                        <Plus size={11} /> Add Field
                                                    </button>
                                                </div>
                                            ) : additionalEntries.length > 0 ? (
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
            )}

            <ConfirmDeleteDialog
                isOpen={showDeleteDialog}
                title="Delete Contact"
                description={`Are you sure you want to delete ${contact.name}? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
            />

            <ConfirmDeleteDialog
                isOpen={!!pipelineDealToDelete}
                title="Remove from Pipeline"
                description={`Are you sure you want to remove ${contact.name} from the pipeline "${pipelineDealToDelete?.pipeline_name}"?`}
                isDeleting={deletingDealId === pipelineDealToDelete?.deal_id}
                onConfirm={handleConfirmDeletePipelineDeal}
                onCancel={() => setPipelineDealToDelete(null)}
            />

            <AddToCRMModal
                isOpen={showAddToCRM}
                onClose={() => setShowAddToCRM(false)}
                contactCount={1}
                onConfirm={handleConfirmAddToCRM}
            />
        </>
    );
};

export default ContactDetailModal;
