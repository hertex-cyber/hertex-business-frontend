import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';

export const KanbanCardUI = ({ card, isOverlay }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Lead': 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
      'Qualified': 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
      'Proposal': 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
      'Negotiation': 'from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-400',
      'Won': 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400',
      'Lost': 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-400',
    };
    return colors[status] || colors['Lead'];
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-white/5 border border-white/10 cursor-grab active:cursor-grabbing transition-colors duration-200 touch-none relative min-w-80',
        !isOverlay && 'hover:border-white/20',
        isOverlay && 'bg-white/10 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-105 z-50 cursor-grabbing'
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 pointer-events-none">
            <h3 className="font-bold text-white text-sm">{card.name}</h3>
            <p className="text-[10px] text-white/40">{card.email}</p>
          </div>
          <button className="p-1 rounded hover:bg-white/5 transition-colors opacity-0 hover:opacity-100">
            <MoreVertical size={14} className="text-white/40" />
          </button>
        </div>

        <div className="pointer-events-none">
          <p className="text-xs text-white/40 mb-1">Value</p>
          <p className="font-bold text-white text-sm">{card.value}</p>
        </div>

        <div className="flex gap-2 pointer-events-none">
          <span className={cn(
            'px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border',
            getStatusColor(card.priority)
          )}>
            {card.priority}
          </span>
        </div>

        <p className="text-[9px] text-white/30 font-medium pointer-events-none">📅 {card.lastContact}</p>
      </div>
    </div>
  );
};

const KanbanCard = ({ card }) => {
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
      <KanbanCardUI card={card} />
    </div>
  );
};

export default KanbanCard;
