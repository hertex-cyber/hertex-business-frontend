export const MEETING_STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'ended', label: 'Ended' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const MEETING_STATUS_STYLES = {
  upcoming: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  live: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  ended: 'text-white/40 bg-white/5 border-white/10',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export function getMeetingStatusTextColor(status) {
  switch (status) {
    case 'live': return 'text-emerald-400';
    case 'cancelled': return 'text-red-400';
    case 'ended': return 'text-white/40';
    default: return 'text-blue-400';
  }
}

export function getMeetingStatusDropdownItemStyle(status, isSelected) {
  if (isSelected) {
    switch (status) {
      case 'live': return 'bg-emerald-500/10 text-emerald-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      case 'ended': return 'bg-white/5 text-white/40';
      default: return 'bg-blue-500/10 text-blue-400';
    }
  }
  switch (status) {
    case 'live': return 'text-emerald-400/60 hover:bg-emerald-500/10';
    case 'cancelled': return 'text-red-400/60 hover:bg-red-500/10';
    case 'ended': return 'text-white/20 hover:bg-white/5';
    default: return 'text-blue-400/60 hover:bg-blue-500/10';
  }
}

export function getMeetingStatusDotColor(status) {
  switch (status) {
    case 'live': return 'bg-emerald-400';
    case 'cancelled': return 'bg-red-400';
    case 'ended': return 'bg-white/20';
    default: return 'bg-blue-400';
  }
}
