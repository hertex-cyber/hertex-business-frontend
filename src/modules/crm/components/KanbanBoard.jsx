import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ column, cards }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getColumnColor = (columnId) => {
    const colors = {
      'lead': 'from-blue-500/5 to-transparent border-blue-500/10',
      'qualified': 'from-purple-500/5 to-transparent border-purple-500/10',
      'proposal': 'from-amber-500/5 to-transparent border-amber-500/10',
      'negotiation': 'from-orange-500/5 to-transparent border-orange-500/10',
      'won': 'from-green-500/5 to-transparent border-green-500/10',
      'lost': 'from-red-500/5 to-transparent border-red-500/10',
    };
    return colors[columnId] || colors['lead'];
  };

  return (
    <div className="flex flex-col gap-4 min-w-80 flex-shrink-0">
      {/* Column Header */}
      <div className={cn(
        'rounded-lg border p-4 bg-gradient-to-b',
        getColumnColor(column.id)
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-sm">{column.title}</h2>
            <p className="text-[9px] text-white/40 font-medium">{cards.length} deals</p>
          </div>
          <button className="p-1.5 rounded hover:bg-white/5 transition-colors">
            <Plus size={14} className="text-white/40 hover:text-white/60" />
          </button>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'space-y-3 flex-1 rounded-lg p-4 min-h-[500px] transition-all bg-white/[0.02]',
          isOver && 'bg-white/[0.06] border border-white/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]'
        )}
      >
        <SortableContext
          items={cards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.length === 0 ? (
            <div className={cn(
              'h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg transition-all',
              isOver && 'border-blue-500/30 bg-blue-500/5'
            )}>
              <p className="text-[9px] text-white/20 font-medium uppercase tracking-widest">
                Drop deals here
              </p>
            </div>
          ) : (
            cards.map((card) => (
              <KanbanCard 
                key={card.id} 
                card={card}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
