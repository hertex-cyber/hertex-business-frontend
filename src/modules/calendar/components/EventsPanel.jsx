import React, { useState, memo } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus } from 'lucide-react';
import AddEventModal from './AddEventModal';

const EventsPanel = memo(({ selectedDate, events }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-white tracking-tight">Tasks</h3>
          <p className="text-[10px] text-white/30 font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-3 h-7 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-medium transition-all">
          <Plus size={12} />
          Add Event
        </button>
      </div>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-white/20 border border-dashed border-white/20 rounded-xl">
          <p className="text-xs font-medium">No events</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="p-3 bg-white/[0.06] border border-white/10 rounded-xl space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-white leading-tight">{ev.title}</p>
                {ev.priority === 'high' && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-wider text-red-400">
                    High
                  </span>
                )}
              </div>
              <div className="text-[10px] text-white/30 font-medium space-y-0.5">
                <p>{format(parseISO(ev.start), 'h:mm a')} - {format(parseISO(ev.end), 'h:mm a')}</p>
                {ev.location && <p>{ev.location}</p>}
              </div>
              {ev.description && (
                <p className="text-[11px] text-white/50 leading-relaxed">{ev.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => setIsModalOpen(false)} />
    </div>
  );
});

export default EventsPanel;
