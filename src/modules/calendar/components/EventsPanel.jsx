import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Plus, Loader2 } from 'lucide-react';
import AddEventModal from './AddEventModal';
import TaskCard from './TaskCard';
import EventCard from './EventCard';
import FollowUpCard from './FollowUpCard';
import MeetingCard from './MeetingCard';



const EventsPanel = memo(({ selectedDate, onEventCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDayEvents = async () => {
      setLoading(true);
      try {
        const dayStart = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);
        const res = await axios.get('/api/calendar/todos/', {
          params: { start: dayStart.toISOString(), end: dayEnd.toISOString() },
        });
        setEvents(res.data.results || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDayEvents();
  }, [selectedDate]);

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-white tracking-tight">Schedule</h3>
          <p className="text-[10px] text-white/30 font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-3 h-7 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-medium transition-all">
          <Plus size={12} />
          Add Event
        </button>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white/20 min-h-0">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white/20 border border-dashed border-white/20 rounded-xl min-h-0">
          <p className="text-xs font-medium">Nothing scheduled</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 space-y-2 pr-1">
          {events.map((ev) => {
            switch (ev.todo_type) {
              case 'task': return <TaskCard key={ev.id} task={ev} />;
              case 'event': return <EventCard key={ev.id} event={ev} />;
              case 'followup': return <FollowUpCard key={ev.id} event={ev} />;
              case 'meeting': return <MeetingCard key={ev.id} event={ev} />;
              default: return null;
            }
          })}
        </div>
      )}

      <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); onEventCreated?.(); }} />
    </div>
  );
});

export default EventsPanel;
