import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SearchDialog = ({ isOpen, onClose, searchQuery, setSearchQuery }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the input when the dialog opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Dialog Content */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
        <div className="flex items-center px-6 h-16 border-b border-white/5">
          <Search size={20} className="text-white/40 mr-4" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search deals, contacts, or pipelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-white/20"
          />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-1.5 py-1 rounded border border-white/10 bg-white/5 text-[10px] text-white/40 font-medium uppercase tracking-widest">
              <span>Esc</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-auto custom-scrollbar">
          {searchQuery ? (
            <div className="space-y-1">
              <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-widest text-white/20">Search Results</p>
              {/* This is a placeholder for actual search results */}
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-white/40">Searching for "{searchQuery}"...</p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search size={40} className="mx-auto mb-4 text-white/5" />
              <p className="text-sm text-white/20">Start typing to search across your CRM</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 uppercase tracking-widest font-medium">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="px-1 py-0.5 rounded border border-white/10 bg-white/5 text-white/40">Enter</span>
              to select
            </span>
            <span className="flex items-center gap-1.5">
              <span className="px-1 py-0.5 rounded border border-white/10 bg-white/5 text-white/40">↑↓</span>
              to navigate
            </span>
          </div>
          <p>Quick Search</p>
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
