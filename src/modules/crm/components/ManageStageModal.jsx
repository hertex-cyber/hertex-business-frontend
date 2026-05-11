import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { cn } from '@/lib/utils';

const COLOR_OPTIONS = [
    { value: 'blue',   bg: 'bg-blue-500',   ring: 'ring-blue-400' },
    { value: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-400' },
    { value: 'amber',  bg: 'bg-amber-500',  ring: 'ring-amber-400' },
    { value: 'orange', bg: 'bg-orange-500', ring: 'ring-orange-400' },
    { value: 'green',  bg: 'bg-green-500',  ring: 'ring-green-400' },
    { value: 'red',    bg: 'bg-red-500',    ring: 'ring-red-400' },
    { value: 'pink',   bg: 'bg-pink-500',   ring: 'ring-pink-400' },
    { value: 'cyan',   bg: 'bg-cyan-500',   ring: 'ring-cyan-400' },
];

const ManageStageModal = ({ isOpen, onClose, pipeline, onStagesChanged }) => {
    const [stages, setStages] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingStage, setEditingStage] = useState(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);
    const [error, setError] = useState('');

    const fetchStages = async () => {
        if (!pipeline) return;
        setIsLoadingList(true);
        try {
            const res = await axios.get(`/api/crm/pipelines/${pipeline.id}/stages/`);
            setStages(res.data.results || res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => {
        if (isOpen && pipeline) {
            fetchStages();
            setShowForm(false);
            setError('');
        }
    }, [isOpen, pipeline]);

    useEffect(() => {
        if (!showForm) {
            setName('');
            setColor('blue');
            setEditingStage(null);
            setError('');
        }
    }, [showForm]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSubmitting(true);
        setError('');
        try {
            if (editingStage) {
                const res = await axios.patch(
                    `/api/crm/pipelines/${pipeline.id}/stages/${editingStage.id}/`,
                    { name: name.trim(), color }
                );
                setStages(prev => prev.map(s => s.id === editingStage.id ? res.data : s));
            } else {
                const res = await axios.post(
                    `/api/crm/pipelines/${pipeline.id}/stages/`,
                    { name: name.trim(), color, order: stages.length }
                );
                setStages(prev => [...prev, res.data]);
            }
            onStagesChanged?.();
            setShowForm(false);
        } catch (err) {
            setError(`Failed to ${editingStage ? 'update' : 'create'} stage. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        setIsDeleting(id);
        try {
            await axios.delete(`/api/crm/pipelines/${pipeline.id}/stages/${id}/`);
            setStages(prev => prev.filter(s => s.id !== id));
            onStagesChanged?.();
        } catch (err) {
            setError('Failed to delete stage.');
        } finally {
            setIsDeleting(null);
        }
    };

    const startEdit = (stage) => {
        setEditingStage(stage);
        setName(stage.name);
        setColor(stage.color);
        setShowForm(true);
    };

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-white uppercase tracking-wider">Stage Manager</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{pipeline?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Sub-Header: Add button */}
                {!showForm && (
                    <div className="px-8 py-4 border-b border-zinc-800 flex items-center justify-end bg-zinc-900/10 shrink-0">
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 rounded-md text-[10px] font-medium uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap"
                        >
                            <Plus size={14} />
                            Add Stage
                        </button>
                    </div>
                )}

                {/* Form sub-header: Cancel */}
                {showForm && (
                    <div className="px-8 py-4 border-b border-zinc-800 flex justify-end bg-zinc-900/10 shrink-0">
                        <button
                            onClick={() => setShowForm(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white/60 hover:text-white rounded-md text-[10px] font-medium uppercase tracking-widest transition-all cursor-pointer"
                        >
                            <X size={14} />
                            Cancel
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {showForm ? (
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
                                    {editingStage ? 'Edit Stage Name' : 'Stage Name'}
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Discovery"
                                    className="bg-white/5 border-zinc-800 h-12 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 focus-visible:ring-0 outline-none transition-all font-medium rounded-md"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Stage Color</label>
                                <div className="flex items-center gap-3">
                                    {COLOR_OPTIONS.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setColor(c.value)}
                                            className={cn(
                                                "w-7 h-7 rounded-full transition-all",
                                                c.bg,
                                                color === c.value ? `ring-2 ring-offset-2 ring-offset-zinc-950 ${c.ring}` : 'opacity-50 hover:opacity-100'
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}

                            <div className="pt-4 pb-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !name.trim()}
                                    className="w-full h-12 bg-blue-500/10 hover:bg-blue-500/20 disabled:bg-zinc-900/50 disabled:text-white/10 disabled:border-zinc-800/50 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 disabled:text-white/20 font-medium text-[10px] uppercase tracking-[0.3em] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (
                                        <>
                                            <Layers size={14} />
                                            {editingStage ? 'Update Stage' : 'Save Stage'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-zinc-800/50">
                            {isLoadingList ? (
                                <div className="p-12 flex items-center justify-center">
                                    <Loader2 size={20} className="animate-spin text-blue-500" />
                                </div>
                            ) : stages.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">No stages configured</p>
                                </div>
                            ) : (
                                stages.map((stage) => {
                                    const colorDot = COLOR_OPTIONS.find(c => c.value === stage.color);
                                    return (
                                        <div key={stage.id} className="group px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-default">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", colorDot?.bg || 'bg-blue-500')} />
                                                <div className="space-y-0.5">
                                                    <h3 className="text-sm font-medium text-white uppercase tracking-wider">{stage.name}</h3>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Order {stage.order}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEdit(stage)}
                                                    className="p-2 rounded-md hover:bg-blue-500/10 text-zinc-600 hover:text-blue-400 transition-colors cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(stage.id)}
                                                    disabled={isDeleting === stage.id}
                                                    className="p-2 rounded-md hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {isDeleting === stage.id
                                                        ? <Loader2 size={18} className="animate-spin" />
                                                        : <Trash2 size={18} />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
                    <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
                        {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'} Configured
                    </span>
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

export default ManageStageModal;
