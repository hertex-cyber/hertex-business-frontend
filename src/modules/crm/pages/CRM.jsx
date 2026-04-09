import React, { useState } from 'react';
import { Users, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanBoard';

const CRM = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 5,
      acceleration: false,
    })
  );

  const [deals, setDeals] = useState({
    'lead': [
      {
        id: 'deal-1',
        name: 'Acme Corp',
        email: 'contact@acmecorp.com',
        value: '$45,000',
        priority: 'Lead',
        lastContact: 'Yesterday',
      },
      {
        id: 'deal-2',
        name: 'Tech Innovations Inc',
        email: 'sales@techinnovations.com',
        value: '$62,000',
        priority: 'Lead',
        lastContact: '3 days ago',
      },
    ],
    'qualified': [
      {
        id: 'deal-3',
        name: 'Global Solutions Ltd',
        email: 'procurement@globalsolutions.com',
        value: '$85,000',
        priority: 'Qualified',
        lastContact: '2 hours ago',
      },
      {
        id: 'deal-4',
        name: 'Future Systems',
        email: 'buyer@futuresystems.com',
        value: '$120,000',
        priority: 'Qualified',
        lastContact: '1 hour ago',
      },
    ],
    'proposal': [
      {
        id: 'deal-5',
        name: 'Enterprise Co',
        email: 'decision@enterpriseco.com',
        value: '$250,000',
        priority: 'Proposal',
        lastContact: '30 mins ago',
      },
    ],
    'negotiation': [
      {
        id: 'deal-6',
        name: 'Premium Industries',
        email: 'cfo@premiumind.com',
        value: '$180,000',
        priority: 'Negotiation',
        lastContact: '1 day ago',
      },
    ],
    'won': [
      {
        id: 'deal-7',
        name: 'Victory Partners',
        email: 'admin@victorypartners.com',
        value: '$320,000',
        priority: 'Won',
        lastContact: 'Today',
      },
    ],
    'lost': [
      {
        id: 'deal-8',
        name: 'Closed Door LLC',
        email: 'contact@closeddoor.com',
        value: '$95,000',
        priority: 'Lost',
        lastContact: '1 week ago',
      },
    ],
  });

  const columns = [
    { id: 'lead', title: 'Lead' },
    { id: 'qualified', title: 'Qualified' },
    { id: 'proposal', title: 'Proposal' },
    { id: 'negotiation', title: 'Negotiation' },
    { id: 'won', title: 'Won' },
    { id: 'lost', title: 'Lost' },
  ];

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    let sourceColumn = null;
    let sourceIndex = -1;

    // Find the card's source column and index
    for (const [colId, cardList] of Object.entries(deals)) {
      const idx = cardList.findIndex(card => card.id === activeId);
      if (idx !== -1) {
        sourceColumn = colId;
        sourceIndex = idx;
        break;
      }
    }

    if (sourceColumn === null) return;

    // Determine destination column
    let destColumn = null;
    
    // Check if overId is a column
    if (columns.some(col => col.id === overId)) {
      destColumn = overId;
    } else {
      // Find which column the card being hovered is in
      for (const col of columns) {
        if (deals[col.id].some(card => card.id === overId)) {
          destColumn = col.id;
          break;
        }
      }
    }

    if (!destColumn) return;

    // Move the card
    const newDeals = { ...deals };
    const draggedCard = newDeals[sourceColumn][sourceIndex];

    if (sourceColumn === destColumn) {
      // Reorder within same column
      const destIndex = newDeals[destColumn].findIndex(c => c.id === overId);
      if (destIndex !== -1 && destIndex !== sourceIndex) {
        newDeals[sourceColumn].splice(sourceIndex, 1);
        newDeals[destColumn].splice(destIndex > sourceIndex ? destIndex - 1 : destIndex, 0, draggedCard);
      }
    } else {
      // Move to different column
      newDeals[sourceColumn].splice(sourceIndex, 1);
      newDeals[destColumn].push(draggedCard);
    }

    setDeals(newDeals);
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <Users size={10} />
            Customer Relations
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">CRM</h1>
          <p className="text-sm text-white/40 font-medium">Manage your customers and pipelines</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/40 transition-colors" size={16} />
            <Input 
              type="text" 
              placeholder="Search deals..." 
              className="rounded-full pl-10 w-64 h-9 bg-white/5 border-white/10 focus:border-white/20 transition-all text-xs"
            />
          </div>
          <Button variant="secondary" size="sm" className="h-9 px-4 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest">
            <Filter size={14} className="mr-2" />
            Filter
          </Button>
          <Button variant="default" size="sm" className="h-9 px-6 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus size={14} className="mr-2" />
            Add Deal
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 relative z-10 overflow-x-auto">
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
          <div className="flex gap-6 min-w-max pb-6">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={deals[column.id]}
              />
            ))}
          </div>
        </DndContext>
      </main>
    </div>
  );
};

export default CRM;
