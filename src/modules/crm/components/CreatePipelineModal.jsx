import React, { useState } from 'react';
import { X, Layout, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

const CreatePipelineModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const response = await axios.post('/api/crm/pipelines/', {
        name,
        description
      });
      onSuccess(response.data);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError('Failed to create pipeline. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">New Pipeline</h2>
              <p className="text-xs text-white/40">Create a separate flow for deals</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-wider text-white/30">Pipeline Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Enterprise Sales"
              className="bg-white/5 border-white/10 h-12 text-sm focus:border-blue-500/50 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-wider text-white/30">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this pipeline for?"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/50 transition-all outline-none min-h-[100px] resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Create Pipeline'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePipelineModal;
