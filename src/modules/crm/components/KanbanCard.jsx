import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';

export const KanbanCardUI = ({ card, isOverlay, onView }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Lead': 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
      'Prospect': 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
      'Customer': 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400',
      'Inactive': 'from-zinc-500/10 to-zinc-500/5 border-zinc-500/20 text-zinc-400',
      'Retarget': 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
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

  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-zinc-900/40 border border-white/5 cursor-grab active:cursor-grabbing transition-all duration-300 touch-none relative w-full group',
        !isOverlay && 'hover:border-blue-500/30 hover:bg-zinc-900/60',
        isOverlay && 'w-[288px] bg-zinc-900 border-blue-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02] z-50 cursor-grabbing'
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 pointer-events-none min-w-0">
            <h3 className="font-bold text-white text-[13px] leading-tight mb-1.5 truncate group-hover:text-blue-400 transition-colors">
              {card.name}
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-white/40 truncate">
                <span className="w-3.5 h-3.5 rounded-full bg-white/5 flex items-center justify-center text-[8px]">📧</span>
                {card.email}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/40 truncate">
                <span className="w-3.5 h-3.5 rounded-full bg-white/5 flex items-center justify-center text-[8px]">📞</span>
                {card.phone}
              </div>
            </div>
          </div>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer relative z-10"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 pointer-events-none">
            <span className={cn(
              'px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider border bg-gradient-to-b',
              getStatusColor(card.status)
            )}>
              {card.status}
            </span>
            <span className={cn(
              'px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border',
              getPriorityColor(card.priority)
            )}>
              {card.priority}
            </span>
          </div>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onView?.(card);
            }}
            style={{ pointerEvents: 'auto', cursor: 'pointer', zIndex: 100 }}
            className="px-3 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white transition-all border border-white/20 active:scale-95 cursor-pointer relative"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};



const KanbanCard = ({ card, onView }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <KanbanCardUI card={card} onView={onView} />
    </div>
  );
};

export default KanbanCard;
