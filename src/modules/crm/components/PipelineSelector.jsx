import React from 'react';
import { ChevronDown, Plus, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const PipelineSelector = ({ pipelines, selectedPipeline, onSelect, onCreateNew }) => {
  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-64 bg-white/5 border border-white/10 !h-10 px-4 rounded-lg flex items-center justify-between text-[10px] font-normal uppercase tracking-widest text-white hover:bg-white/10 transition-all outline-none focus:ring-0 focus:border-white/20">
          <span className="truncate">{selectedPipeline ? selectedPipeline.name : "Select Pipeline"}</span>
          <ChevronDown size={14} className="opacity-40" />
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64 bg-black border-white/10 shadow-[0_20px_50px_rgba(0,0,0,1)] p-1.5">
          {pipelines.map((p) => (
            <DropdownMenuItem 
              key={p.id} 
              onClick={() => onSelect(p)}
              className={cn(
                "cursor-pointer text-[10px] py-2.5 uppercase tracking-widest font-normal transition-colors",
                selectedPipeline?.id === p.id ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {p.name}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-white/5 my-1.5" />
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onCreateNew();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-[9px] font-normal uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all text-left"
          >
            <Plus size={12} />
            Create New Pipeline
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PipelineSelector;
