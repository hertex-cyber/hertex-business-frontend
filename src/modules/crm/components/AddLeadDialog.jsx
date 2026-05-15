import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, Mail, Building, Briefcase, DollarSign, Loader2, Plus, Trash2, Database } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const AddLeadDialog = ({ isOpen, onClose, pipeline, stages, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        job_title: '',
        company_name: '',
        deal_value: '0',
    });

    const [customFields, setCustomFields] = useState([]);

    if (!isOpen) return null;

    const handleAddCustomField = () => {
        setCustomFields([...customFields, { key: '', value: '' }]);
    };

    const handleUpdateCustomField = (index, field, val) => {
        const updated = [...customFields];
        updated[index][field] = val;
        setCustomFields(updated);
    };

    const handleRemoveCustomField = (index) => {
        const updated = customFields.filter((_, i) => i !== index);
        setCustomFields(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name) {
            setError("Name is required.");
            return;
        }

        if (!formData.email && !formData.phone) {
            setError("Either Email or Phone is required.");
            return;
        }

        if (!pipeline || !stages || stages.length === 0) {
            setError("Cannot add lead: Selected pipeline has no stages configured.");
            return;
        }

        setIsSubmitting(true);

        try {
            const customFieldsObj = {};
            customFields.forEach(f => {
                if (f.key.trim()) {
                    customFieldsObj[f.key.trim()] = f.value;
                }
            });

            const contactPayload = {
                name: formData.name,
                email: formData.email || null,
                phone: formData.phone || null,
                job_title: formData.job_title || null,
                company_name: formData.company_name || null,
                custom_fields: customFieldsObj
            };

            const contactRes = await axios.post('/api/contacts/', contactPayload);
            const contactId = contactRes.data.id;

            const firstStage = stages.sort((a, b) => a.order - b.order)[0];
            
            const dealPayload = {
                contact: contactId,
                pipeline: pipeline.id,
                stage: firstStage.id,
                value: parseFloat(formData.deal_value) || 0,
                priority: 'Medium'
            };

            const dealRes = await axios.post('/api/crm/pipeline/', dealPayload);

            if (onSuccess) onSuccess(dealRes.data);
            onClose();

            setFormData({
                name: '', email: '', phone: '', job_title: '', company_name: '', deal_value: '0'
            });
            setCustomFields([]);

        } catch (err) {
            console.error("Failed to add lead:", err);
            if (err.response?.data) {
                const data = err.response.data;
                const msg = typeof data === 'object' ? Object.values(data).flat().join(', ') : data;
                setError(msg);
            } else {
                setError("An error occurred while adding the lead.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => !isSubmitting && onClose()}
            />
            
            {/* The Industrial Registry Modal Base */}
            <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                
                {/* Header (Top-Down Illumination) */}
                <div className="px-6 py-5 border-b border-zinc-800 flex items-start justify-between shrink-0 bg-black/50 backdrop-blur-xl rounded-t-lg">
                    <div className="flex items-start justify-between gap-4 w-full">
                        <div className="flex items-center gap-5">
                            <div>
                                <h2 className="text-lg font-medium text-white">Add New Lead</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] px-3 py-1 rounded-md border font-medium uppercase tracking-[0.2em] bg-blue-500/10 text-blue-400 border-blue-500/20">
                                        Pipeline: {pipeline?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="p-2 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form Content - Split Screen */}
                <form id="add-lead-form" onSubmit={handleSubmit} className="overflow-hidden p-6 flex flex-col min-h-0 bg-zinc-900/30">
                    
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-[0.2em] font-medium shrink-0">
                            {error}
                        </div>
                    )}

                    <div className="flex relative min-h-0 flex-1">
                        
                        {/* Left Column: Primary Details */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: '420px' }}>
                            <div className="space-y-6 pb-4 pr-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <User size={14} className="text-blue-400" />
                                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">Primary Details</p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Name *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white/60 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all hover:bg-white/[0.02]"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white/60 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all hover:bg-white/[0.02]"
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Phone</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white/60 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all hover:bg-white/[0.02]"
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-emerald-500/80 uppercase tracking-[0.2em] font-medium">Deal Value</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.deal_value}
                                                onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                                                className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white/60 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all hover:bg-white/[0.02]"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Job Title</label>
                                                <input
                                                    type="text"
                                                    value={formData.job_title}
                                                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                                    className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white/60 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all hover:bg-white/[0.02]"
                                                    placeholder="CEO"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Company</label>
                                                <input
                                                    type="text"
                                                    value={formData.company_name}
                                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                    className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white/60 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all hover:bg-white/[0.02]"
                                                    placeholder="Acme Corp"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Exact Divider Spanning Full Height */}
                        <div className="w-[1px] bg-white/5 mx-6 shrink-0 relative" />

                        {/* Right Column: Additional Registry */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: '420px' }}>
                            <div className="space-y-6 pb-4 pr-3">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Database size={14} className="text-amber-400" />
                                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">Additional Registry</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddCustomField}
                                            className="h-8 px-3 rounded-md bg-zinc-900/50 border border-zinc-800 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-zinc-800 transition-all font-medium flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Add Field
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {customFields.length === 0 ? (
                                            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] text-center py-8 border border-dashed border-zinc-800 rounded-md bg-black/20">
                                                No registry entries
                                            </p>
                                        ) : (
                                            customFields.map((field, idx) => (
                                                <div key={idx} className="flex flex-col gap-2 p-4 rounded-md border border-zinc-800 bg-black/40 hover:bg-white/[0.02] transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-medium">Field #{idx + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCustomField(idx)}
                                                            className="h-6 w-6 rounded-md bg-zinc-900/50 border border-zinc-800 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center shrink-0"
                                                            title="Delete Entry"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={field.key}
                                                        onChange={(e) => handleUpdateCustomField(idx, 'key', e.target.value)}
                                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md px-3 py-1.5 text-[11px] text-white/60 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:bg-black/60 transition-all"
                                                        placeholder="Registry Key (e.g. Industry)"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={(e) => handleUpdateCustomField(idx, 'value', e.target.value)}
                                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md px-3 py-1.5 text-[11px] text-white/60 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:bg-black/60 transition-all"
                                                        placeholder="Value (e.g. Technology)"
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex justify-end gap-3 shrink-0 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-lead-form"
                        disabled={isSubmitting || !formData.name || (!formData.email && !formData.phone)}
                        className="px-6 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={14} className="animate-spin" /> Saving...</>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddLeadDialog;
