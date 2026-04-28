import React, { useState, useEffect } from 'react';
import { X, Rocket, Layout, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import axios from 'axios';

const AddToCRMModal = ({ isOpen, onClose, onConfirm, contactCount }) => {
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPipelines();
    }
  }, [isOpen]);

  const fetchPipelines = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/crm/pipelines/');
      const data = response.data.results || response.data;
      setPipelines(data);
      if (data.length > 0) {
        setSelectedPipeline(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch pipelines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedPipeline) return;
    setIsSubmitting(true);
    await onConfirm(selectedPipeline.id);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Rocket size={20} />
            </div>
            <div>
              <h2 className="text-lg font-normal text-white">Add to CRM</h2>
              <p className="text-xs text-white/40">Export {contactCount} contacts to pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {isLoading ? (
            <div className="py-10 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={24} />
              <p className="text-[10px] font-normal uppercase tracking-wider text-white/20">Loading Pipelines...</p>
            </div>
          ) : pipelines.length === 0 ? (
            <div className="py-6 text-center space-y-4">
              <p className="text-sm text-white/40">No pipelines found. Please create one in the CRM page first.</p>
              <Button onClick={onClose} variant="secondary" className="w-full font-normal">Close</Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-normal uppercase tracking-wider text-white/30">Select Target Pipeline</label>
                <div className="max-h-[240px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {pipelines.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPipeline(p)}
                      className={cn(
                        "w-full px-4 py-4 rounded-xl flex items-center justify-between transition-all duration-300 border",
                        selectedPipeline?.id === p.id 
                          ? "bg-blue-500/10 border-blue-500/40 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                          : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05] hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          selectedPipeline?.id === p.id ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/20"
                        )}>
                          <Layout size={14} />
                        </div>
                        <span className="text-[10px] font-normal uppercase tracking-widest">{p.name}</span>
                      </div>
                      {selectedPipeline?.id === p.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check size={12} strokeWidth={4} className="text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="secondary" onClick={onClose} className="flex-1 h-12 font-normal text-sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={isSubmitting || !selectedPipeline}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-500 text-white font-normal text-sm"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Export'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToCRMModal;
