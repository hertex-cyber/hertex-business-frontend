import React from 'react';
import { format, parseISO } from 'date-fns';
import { Users } from 'lucide-react';

const MeetingCard = ({ event }) => {
  return (
    <div className="p-3 bg-white/[0.06] border border-white/10 rounded-xl space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded flex items-center justify-center border text-purple-400 bg-purple-500/10 border-purple-500/20">
            <Users size={10} />
          </span>
          <p className="text-sm font-bold text-white leading-tight truncate">{event.title}</p>
        </div>
        <span className="shrink-0 px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border-purple-500/20">Meeting</span>
      </div>
      <div className="text-[10px] text-white/30 font-medium space-y-0.5">
        {event.start && <p>{format(parseISO(event.start), 'h:mm a')}</p>}
        {event.contact_name && <p>Contact: {event.contact_name}</p>}
        {event.assigned_to_name && <p>Assigned to: {event.assigned_to_name}</p>}
        {event.user_name && <p>Created by: {event.user_name}</p>}
      </div>
    </div>
  );
};

export default MeetingCard;
