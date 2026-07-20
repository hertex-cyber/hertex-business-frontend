import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CalendarPlus, Trash2 } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const UpdateEventModal = ({ event, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const isCreator = event?.user === user?.id;
  const canEdit = isCreator;

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setStart(event.start ? event.start.slice(0, 16) : '');
      setError('');
    }
  }, [isOpen, event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setIsSubmitting(true);
    setError('');

    try {
      await axios.patch(`/api/calendar/todos/${event.id}/`, {
        title,
        description: description || undefined,
        start: start ? new Date(start).toISOString() : null,
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
            <h2 className="text-sm font-medium text-white uppercase tracking-wider">Update Event</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Edit event details</p>
          </div>
          {isCreator && (
            <button type="button" onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {!canEdit && (
            <div className="px-8 py-3 bg-red-500/10 border-b border-red-500/20">
              <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider">Read-only — only the creator can edit this event.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} id="update-event-form">
            <div className="px-8 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Name</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} disabled={!canEdit}
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Date</label>
                  <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} disabled={!canEdit}
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={!canEdit} rows={11}
                  className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed" />
              </div>
              {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
            </div>
          </form>
        </div>

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
