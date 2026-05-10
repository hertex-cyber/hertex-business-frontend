import React from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Calendar, Tag, Clock, FileText, User, Trash2, Edit3, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DealDetailsDialog = ({ isOpen, onClose, deal }) => {
  if (!isOpen || !deal) return null;

  const getStatusColor = (status) => {
    const colors = {
      'Lead': 'text-blue-400 bg-blue-400/10 border-blue-500/20',
      'Prospect': 'text-purple-400 bg-purple-400/10 border-purple-500/20',
      'Customer': 'text-green-400 bg-green-400/10 border-green-500/20',
      'Inactive': 'text-zinc-400 bg-zinc-400/10 border-zinc-500/20',
    };
    return colors[status] || colors['Lead'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-400 bg-red-400/10 border-red-500/20',
      'Medium': 'text-amber-400 bg-amber-400/10 border-amber-500/20',
      'Low': 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
    };
    return colors[priority] || 'text-white/40 bg-white/5 border-white/10';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      {/* Dialog Content */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        {/* Header Section */}
        <div className="relative h-40 overflow-hidden bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
          
          <div className="relative h-full flex items-end justify-between px-8 pb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-2xl">
                <User size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight leading-none">{deal.name || 'Unknown Contact'}</h2>
                <div className="flex items-center gap-4 text-white/40">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Mail size={12} className="text-blue-400" />
                    {deal.email || 'No email'}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Phone size={12} className="text-purple-400" />
                    {deal.phone || 'No phone'}
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-8 space-y-8 bg-zinc-950">
          {/* Status & Priority Row */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Current Stage</label>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", deal.status === 'Won' ? 'bg-green-500' : 'bg-blue-500')} />
                <span className={cn("text-xs font-bold uppercase tracking-wider text-white")}>
                  {deal.status || 'Lead'}
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="space-y-1 text-right">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Priority Level</label>
              <span className={cn(
                "block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                getPriorityColor(deal.priority)
              )}>
                {deal.priority || 'Medium'}
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-white/20">
                <Wallet size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Deal Value</span>
              </div>
              <p className="text-lg font-bold text-emerald-400">{deal.value || '₹ 0'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-white/20">
                <Calendar size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Date Created</span>
              </div>
              <p className="text-sm font-bold text-white/60">{formatDate(deal.raw?.created_at)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-white/20">
                <Clock size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Last Activity</span>
              </div>
              <p className="text-sm font-bold text-white/60">{deal.lastContact || 'Today'}</p>
            </div>
          </div>

          {/* Additional Info / Meta Data */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
              <Tag size={12} />
              Additional Information
            </label>
            <div className="grid grid-cols-2 gap-3">
              {deal.raw?.contact_details?.additional_data && Object.keys(deal.raw.contact_details.additional_data).length > 0 ? (
                Object.entries(deal.raw.contact_details.additional_data).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-white/70 font-medium truncate">{String(value)}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-6 rounded-2xl bg-white/[0.01] border border-dashed border-white/5 flex items-center justify-center">
                  <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">No metadata available</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4 pb-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
                <FileText size={12} />
                Deal Notes
              </label>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 min-h-[100px]">
              {deal.raw?.notes ? (
                <p className="text-sm text-white/50 leading-relaxed italic">"{deal.raw.notes}"</p>
              ) : (
                <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em] text-center">No notes attached</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-zinc-900 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-9 px-4 text-white/40 hover:text-white hover:bg-white/5 gap-2">
              <Edit3 size={14} />
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-4 text-red-400/60 hover:text-red-400 hover:bg-red-400/5 gap-2">
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
          <Button variant="secondary" onClick={onClose} className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/10">
            Close
          </Button>
        </div>
      </div>
    </div>
    , document.body);
};

export default DealDetailsDialog;
