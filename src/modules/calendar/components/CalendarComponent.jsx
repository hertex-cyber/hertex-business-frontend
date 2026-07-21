import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, ChevronRight, Loader, Plus } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO,
} from 'date-fns';
import EventsPanel from './EventsPanel';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarComponent = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        if (!mounted.current) setInitialLoading(true);
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const res = await axios.get('/api/calendar/todos/', {
          params: { start: monthStart.toISOString(), end: monthEnd.toISOString() },
        });
        setEvents(res.data.results || []);
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setInitialLoading(false);
        mounted.current = true;
      }
    };
    fetchEvents();
  }, [user, currentDate, refreshTrigger]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const start = parseISO(ev.start);
      const dates = ev.end
        ? eachDayOfInterval({ start, end: parseISO(ev.end) })
        : [start];
      dates.forEach((d) => {
        const key = format(d, 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      });
    });
    return map;
  }, [events]);

  const selectedKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const selectedEvents = useMemo(() => eventsByDate[selectedKey] || [], [eventsByDate, selectedKey]);

  const prevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const nextMonth = () => setCurrentDate((d) => addMonths(d, 1));

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-white/20">
        <Loader size={24} className="animate-spin" />
      </div>
    );
  }

  if (initialLoading && error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400/60">
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-[minmax(220px,25%)_1fr] gap-6">
      <div className="h-full min-h-0">
        <EventsPanel selectedDate={selectedDate} onEventCreated={() => setRefreshTrigger(t => t + 1)} />
      </div>

      <div className="space-y-6 pr-4 h-full min-h-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-end gap-4">
          <h2 className="text-lg font-bold text-white tracking-tight">{format(selectedDate, 'MMMM d, yyyy')}</h2>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-white/5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[key] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(day)}
                  className={`relative flex flex-col items-center justify-start p-2 min-h-[72px] border-b border-r border-white/[0.03] transition-all hover:bg-white/[0.03] ${
                    isSelected ? 'bg-blue-500/10' : ''
                  } ${!isCurrentMonth ? 'opacity-20' : ''}`}
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      isTodayDate ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]' : ''
                    } ${isSelected && !isTodayDate ? 'text-blue-400' : ''} ${!isSelected && !isTodayDate ? 'text-white/70' : ''}`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((ev) => {
                        const dotColor =
                          ev.todo_type === 'task' ? 'bg-blue-500' :
                          ev.todo_type === 'event' ? 'bg-emerald-500' :
                          ev.todo_type === 'followup' ? 'bg-amber-500' :
                          ev.todo_type === 'meeting' ? 'bg-purple-500' :
                          'bg-white/30';
                        return <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />;
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-white/30 font-bold">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
