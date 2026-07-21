import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const EventCard = ({ event, onClick }) => {
  return (
    <div className={cn("p-3 rounded-xl space-y-1.5 cursor-pointer transition-all",
      event.status === 'cancelled' ? "bg-red-500/10 border border-red-500/30 hover:bg-red-500/15" :
      "bg-white/[0.06] border border-white/10 hover:bg-white/[0.08]")}
      onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded flex items-center justify-center border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
            <Calendar size={10} />
          </span>
          <p className="text-sm font-bold text-white leading-tight truncate">{event.title}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {event.status === 'live' ? (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider text-emerald-400">Live</span>
          ) : event.status === 'cancelled' ? (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-wider text-red-400">Cancelled</span>
          ) : event.status === 'ended' ? (
            <span className="px-1.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[8px] font-black uppercase tracking-wider text-white/40">Ended</span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-black uppercase tracking-wider text-blue-400">Upcoming</span>
          )}
        </div>
      </div>
      <div className="text-[10px] text-white/30 font-medium space-y-0.5">
        {event.start && <p>{format(parseISO(event.start), 'MMM d, h:mm a')}</p>}
        {event.contact_name && <p>Contact: {event.contact_name}</p>}
        {event.user_name && <p>Created by: {event.user_name}</p>}
      </div>
    </div>
  );
};

export default EventCard;
