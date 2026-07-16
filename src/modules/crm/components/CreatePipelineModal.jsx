import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Layout, Loader2, Plus, ChevronRight, Pencil, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { cn } from '@/lib/utils';

const CreatePipelineModal = ({ isOpen, onClose, onSuccess, onDelete, onUpdate, pipelines = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // stores id of pipeline being deleted
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [localPipelines, setLocalPipelines] = useState(pipelines);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Sync with prop when it changes or modal opens
  useEffect(() => {
    if (isOpen && !searchQuery) {
      setLocalPipelines(pipelines);
    }
  }, [pipelines, isOpen, searchQuery]);

  // Debounced server-side search
  useEffect(() => {
    if (!isOpen) return;
    if (!searchQuery.trim()) {
      setLocalPipelines(pipelines);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingList(true);
      try {
        const response = await axios.get('/api/crm/pipelines/', {
          params: { search: searchQuery }
        });
        const data = response.data.results || response.data;
        setLocalPipelines(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoadingList(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, pipelines]);

  // Reset form and search when modal opens or form toggles
  useEffect(() => {
    if (!showForm) {
      setName('');
      setDescription('');
      setEditingPipeline(null);
      setError('');
    }
  }, [showForm, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      if (editingPipeline) {
        const response = await axios.patch(`/api/crm/pipelines/${editingPipeline.id}/`, {
          name,
          description
        });
        if (onUpdate) onUpdate(response.data);
      } else {
        const response = await axios.post('/api/crm/pipelines/', {
          name,
          description
        });
        onSuccess(response.data);
      }
      setShowForm(false);
    } catch (err) {
      setError(`Failed to ${editingPipeline ? 'update' : 'create'} pipeline. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(confirmDeleteId === id ? null : id);
  };

  const confirmDelete = async (id) => {
    setIsDeleting(id);
    setConfirmDeleteId(null);
    try {
      await axios.delete(`/api/crm/pipelines/${id}/`);
      if (onDelete) onDelete(id);
    } catch (err) {
      setError('Failed to delete pipeline.');
    } finally {
      setIsDeleting(null);
    }
  };

  const startEdit = (pipeline) => {
    setEditingPipeline(pipeline);
    setName(pipeline.name);
    setDescription(pipeline.description || '');
    setShowForm(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">Pipeline Manager</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Registry & Configuration</p>
            </div>
          </div>
        </div>

        {/* Sub-Header (Search & Add) */}
        {!showForm && (
          <div className="px-8 py-4 border-b border-zinc-800 flex items-center gap-4 bg-zinc-900/10 shrink-0">
            <div className="relative flex-1">
              <Search size={14} className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
                isLoadingList ? "text-blue-500" : "text-white/20"
              )} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white/5 border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-[10px] text-white placeholder:text-white/10 focus:border-blue-500/40 outline-none transition-all uppercase tracking-widest font-medium"
              />
              {isLoadingList && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                   <Loader2 size={10} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 rounded-md text-[10px] font-medium uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        )}

        {/* Form specific header (Cancel button) */}
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {showForm ? (
            /* Creation/Edit Form */
            <form onSubmit={handleSubmit} className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
                  {editingPipeline ? 'Edit Name' : 'Pipeline Name'}
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Enterprise Sales"
                  className="bg-white/5 border-zinc-800 h-12 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 focus-visible:ring-0 outline-none transition-all font-medium rounded-md"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Details (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Define workflow objectives..."
                  className="w-full bg-white/5 border border-zinc-800 rounded-md p-4 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 outline-none min-h-[100px] resize-none font-medium transition-all"
                />
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
                      <Layout size={14} />
                      {editingPipeline ? 'Update Pipeline' : 'Save Pipeline'}
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Registry List with Fixed Height for ~4 items */
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-zinc-800/50">
              {localPipelines.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                    {searchQuery ? 'No matching pipelines' : 'No pipelines configured'}
                  </p>
                </div>
              ) : (
                localPipelines.map((pipeline) => (
                  <div key={pipeline.id}>
                    <div className="group px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-default">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-white uppercase tracking-wider">{pipeline.name}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium line-clamp-1">
                          {pipeline.description || "No description provided"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={cn("flex items-center gap-2 transition-opacity", isDeleting === pipeline.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                          <button 
                            onClick={() => startEdit(pipeline)}
                            className="p-2 rounded-md hover:bg-blue-500/10 text-zinc-600 hover:text-blue-400 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(pipeline.id)}
                            disabled={isDeleting === pipeline.id}
                            className="p-2 rounded-md hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >
                            {isDeleting === pipeline.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    {confirmDeleteId === pipeline.id && (
                      <div className="px-8 pb-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="bg-red-500/5 border border-red-500/20 rounded-md p-4 flex items-center justify-between">
                          <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider">
                            Warning. All associated contacts will be removed from this pipeline.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white/60 hover:text-white text-[9px] font-medium uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => confirmDelete(pipeline.id)}
                              disabled={isDeleting === pipeline.id}
                              className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-[9px] font-medium uppercase tracking-wider rounded-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              {isDeleting === pipeline.id ? <Loader2 size={10} className="animate-spin" /> : null}
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
              {pipelines.length} Active {pipelines.length === 1 ? 'Pipeline' : 'Pipelines'}
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

export default CreatePipelineModal;
