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
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">New Pipeline</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Create operational workflow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Pipeline Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Enterprise Sales"
              className="bg-white/5 border-white/10 h-12 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 focus-visible:ring-0 outline-none transition-all font-medium rounded-md"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Details (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Define workflow objectives..."
              className="w-full bg-white/5 border border-white/10 rounded-md p-4 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 outline-none min-h-[100px] resize-none font-medium transition-all"
            />
          </div>

          {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 disabled:text-white/20 disabled:border-zinc-800 border border-blue-500/50 text-white font-medium text-[10px] uppercase tracking-[0.3em] rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  <Layout size={14} />
                  Create Pipeline
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePipelineModal;
