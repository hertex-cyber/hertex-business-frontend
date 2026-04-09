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
      'lead': 'from-blue-500/15 to-transparent border-blue-500/20',
      'qualified': 'from-purple-500/15 to-transparent border-purple-500/20',
      'proposal': 'from-amber-500/15 to-transparent border-amber-500/20',
      'negotiation': 'from-orange-500/15 to-transparent border-orange-500/20',
      'won': 'from-green-500/15 to-transparent border-green-500/20',
      'lost': 'from-red-500/15 to-transparent border-red-500/20',
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
            <p className="text-[9px] text-white/60 font-medium">{cards.length} deals</p>
          </div>
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Plus size={14} className="text-white/60 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'space-y-3 flex-1 rounded-lg p-4 min-h-[500px] transition-colors bg-white/5'
        )}
      >
        <SortableContext
          items={cards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.length === 0 ? (
            <div className={cn(
              'h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg transition-colors'
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
