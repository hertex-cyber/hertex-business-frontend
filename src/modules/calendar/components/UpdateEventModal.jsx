import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CalendarPlus, Trash2, Check, ChevronDown } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const EVENT_STATUSES = ['upcoming', 'live', 'cancelled', 'ended'];

const UpdateEventModal = ({ event, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isFullDay, setIsFullDay] = useState(false);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const statusRef = useRef(null);

  const isCreator = event?.user === user?.id;
  const isAdmin = user?.role === 'Superadmin' || user?.role === 'Admin';
  const canEdit = isCreator || isAdmin;

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setStart(event.start ? event.start.slice(0, 16) : '');
      setEnd(event.end ? event.end.slice(0, 16) : '');
      setIsFullDay(!!(event.end && event.start && new Date(event.end).getTime() === new Date(new Date(event.start).setHours(23, 59, 59, 999)).getTime()));
      setStatus(event.status || 'upcoming');
      setError('');
    }
  }, [isOpen, event]);

  const openStatusDropdown = () => {
    if (statusRef.current) {
      const rect = statusRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      setShowStatusDropdown(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setIsSubmitting(true);
    setError('');

    try {
      await axios.patch(`/api/calendar/todos/${event.id}/`, {
        title,
        description: description || undefined,
        status,
        start: start ? new Date(start).toISOString() : null,
        end: isFullDay
          ? (start ? new Date(new Date(start).setHours(23, 59, 59, 999)).toISOString() : null)
          : (end ? new Date(end).toISOString() : null),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Failed to update.';
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (data.detail) msg = data.detail;
        else {
          const firstKey = Object.keys(data)[0];
          msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
        }
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !event) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-medium text-white uppercase tracking-wider">{canEdit ? 'Event Update' : 'Event'}</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">{canEdit ? 'Edit event details' : 'Event details'}</p>
          </div>
          {canEdit && (
            <button type="button" onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} id="update-event-form">
            <div className="px-8 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Name</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} disabled={!canEdit}
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                  {canEdit ? (
                    <button ref={statusRef} type="button" onClick={openStatusDropdown}
                      className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize",
                        status === 'live' ? 'text-emerald-400' :
                        status === 'cancelled' ? 'text-red-400' :
                        status === 'ended' ? 'text-white/40' :
                        'text-blue-400')}>
                      <span>{status}</span>
                      <ChevronDown size={14} className="text-white/20" />
                    </button>
                  ) : (
                    <div className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm capitalize",
                      status === 'live' ? 'text-emerald-400' :
                      status === 'cancelled' ? 'text-red-400' :
                      status === 'ended' ? 'text-white/40' :
                      'text-blue-400')}>{status}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-[15px] pt-5">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-white leading-none">Single Day</label>
              {canEdit ? (
                <button type="button" onClick={() => {
                    if (!isFullDay && start) {
                      const d = new Date(start);
                      setStart(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00`);
                    }
                    setIsFullDay(!isFullDay);
                  }}
                  className={cn("w-11 h-6 rounded-full transition-all relative shrink-0",
                    isFullDay ? "bg-blue-500" : "bg-zinc-700")}>
                  <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all", isFullDay ? "left-6" : "left-1")} />
                </button>
              ) : (
                <div className={cn("w-11 h-6 rounded-full relative", isFullDay ? "bg-blue-500" : "bg-zinc-700")}>
                  <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all", isFullDay ? "left-6" : "left-1")} />
                </div>
              )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Date</label>
                  <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} disabled={!canEdit}
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">End Date</label>
                  <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} disabled={!canEdit || isFullDay}
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={!canEdit} rows={7}
                  className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed" />
              </div>
              {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
            </div>
          </form>
        </div>

        {showStatusDropdown && dropdownPos && canEdit && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowStatusDropdown(false); setDropdownPos(null); }} />
            <div style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              {EVENT_STATUSES.map(s => {
                const isDisabled = (status === 'live' || status === 'ended') && (s === 'upcoming' || s === 'cancelled');
                return (
                  <button key={s} type="button" disabled={isDisabled}
                    onClick={() => { if (!isDisabled) { setStatus(s); setShowStatusDropdown(false); setDropdownPos(null); } }}
                    className={cn("w-full px-4 py-2.5 flex items-center justify-between transition-all text-left capitalize",
                      isDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/[0.03]", status === s && "bg-blue-500/5")}>
                    <span className={cn("text-xs font-medium capitalize",
                      s === 'live' ? 'text-emerald-400' :
                      s === 'cancelled' ? 'text-red-400' :
                      s === 'ended' ? 'text-white/40' :
                      'text-blue-400')}>{s}</span>
                    {status === s && <Check size={12} className="text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="px-8 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
            Cancel
          </button>
          {canEdit && (
            <button type="submit" form="update-event-form" disabled={isSubmitting || !title.trim() || !start}
              className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CalendarPlus size={14} />Save</>}
            </button>
          )}
        </div>

        <ConfirmDeleteDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              await axios.delete(`/api/calendar/todos/${event.id}/`);
              setShowDeleteConfirm(false);
              onSuccess?.();
              onClose();
            } catch {
              setShowDeleteConfirm(false);
              setError('Failed to delete event.');
            } finally {
              setIsDeleting(false);
            }
          }}
          isDeleting={isDeleting}
          title="Delete Event"
          description="This will permanently remove this event."
        />
      </div>
    </div>,
    document.body
  );
};

export default UpdateEventModal;
