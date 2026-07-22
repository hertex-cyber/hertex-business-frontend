import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CalendarPlus, Trash2, ChevronDown, Search, Check } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  MEETING_STATUS_OPTIONS, getMeetingStatusTextColor,
  getMeetingStatusDropdownItemStyle, getMeetingStatusDotColor
} from '../constants';

const UpdateMeetingModal = ({ event, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState('');
  const [meetingEndTime, setMeetingEndTime] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ status: null, user: null });
  const statusRef = useRef(null);
  const userRef = useRef(null);

  const isCreator = event?.user === user?.id;
  const canEdit = isCreator;

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setLocation(event.location || '');
      setStatus(event.status || 'upcoming');
      const s = event.start || '';
      setMeetingDate(s ? s.slice(0, 10) : '');
      setMeetingStartTime(s ? s.slice(11, 16) : '');
      setMeetingEndTime(event.end ? event.end.slice(11, 16) : '');
      setSelectedAttendees((event.attendees || []).map(a => ({ id: a.user, first_name: a.user_name })));
      setError('');

      setUsersLoading(true);
      axios.get('/api/auth/users/assignable/')
        .then(res => setUsers(res.data || []))
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }
  }, [isOpen, event]);

  const openStatusDropdown = () => {
    if (statusRef.current) {
      const rect = statusRef.current.getBoundingClientRect();
      setDropdownPos({ status: { top: rect.bottom + 4, left: rect.left, width: rect.width }, user: null });
      setShowUserDropdown(false);
      setShowStatusDropdown(true);
    }
  };

  const openUserDropdown = () => {
    if (userRef.current) {
      const rect = userRef.current.getBoundingClientRect();
      setDropdownPos({ user: { top: rect.bottom + 4, left: rect.left, width: rect.width }, status: null });
      setShowStatusDropdown(false);
      setShowUserDropdown(true);
    }
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

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
        location: location || undefined,
        attendee_ids: selectedAttendees.map(a => a.id),
        start: meetingDate && meetingStartTime ? new Date(`${meetingDate}T${meetingStartTime}`).toISOString() : null,
        end: meetingDate && meetingEndTime ? new Date(`${meetingDate}T${meetingEndTime}`).toISOString() : undefined,
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
            <h2 className="text-sm font-medium text-white uppercase tracking-wider">Update Meeting</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Edit meeting details</p>
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
              <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider">Read-only — only the creator can edit this meeting.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} id="update-meeting-form">
            <div className="px-8 py-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Meeting Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} disabled={!canEdit}
                  className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Agenda</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={!canEdit} rows={3}
                  className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Location / Link</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} disabled={!canEdit}
                    placeholder="Add meeting location or link..."
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Attendees (multi-select)</label>
                  {canEdit ? (
                    <button ref={userRef} type="button" onClick={openUserDropdown}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                      <span className={selectedAttendees.length > 0 ? 'text-white' : 'text-white/20'}>
                        {selectedAttendees.length === 0 ? 'Select attendees...' :
                          `${selectedAttendees[0].first_name || selectedAttendees[0].id}${selectedAttendees.length > 1 ? ` +${selectedAttendees.length - 1}` : ''}`}
                      </span>
                      <ChevronDown size={14} className="text-white/20 shrink-0" />
                    </button>
                  ) : (
                    <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">
                      {selectedAttendees.length > 0 ? selectedAttendees.map(a => a.first_name).join(', ') : 'None'}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                {canEdit ? (
                  <button ref={statusRef} type="button" onClick={openStatusDropdown}
                    className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getMeetingStatusTextColor(status))}>
                    <span>{status}</span>
                    <ChevronDown size={14} className="text-white/20" />
                  </button>
                ) : (
                  <div className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm capitalize", getMeetingStatusTextColor(status))}>{status}</div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Date</label>
                  <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} disabled={!canEdit}
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Start Time</label>
                  <input type="time" value={meetingStartTime} onChange={e => setMeetingStartTime(e.target.value)} disabled={!canEdit}
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">End Time</label>
                  <input type="time" value={meetingEndTime} onChange={e => setMeetingEndTime(e.target.value)} disabled={!canEdit}
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
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
            <button type="submit" form="update-meeting-form" disabled={isSubmitting || !title.trim() || !meetingDate || !meetingStartTime}
              className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CalendarPlus size={14} />Save</>}
            </button>
          )}
        </div>

        {showStatusDropdown && dropdownPos.status && canEdit && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowStatusDropdown(false); setDropdownPos(prev => ({ ...prev, status: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.status.top, left: dropdownPos.status.left, width: dropdownPos.status.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1">
              {MEETING_STATUS_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => { setStatus(opt.value); setShowStatusDropdown(false); setDropdownPos(prev => ({ ...prev, status: null })); }}
                  className={cn("w-full px-4 py-2.5 text-left text-xs font-medium rounded-lg transition-all capitalize flex items-center gap-2", getMeetingStatusDropdownItemStyle(opt.value, status === opt.value))}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", getMeetingStatusDotColor(opt.value))} />
                  {opt.label}
                  {status === opt.value && <Check size={12} className="ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}

        {showUserDropdown && dropdownPos.user && canEdit && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowUserDropdown(false); setDropdownPos(prev => ({ ...prev, user: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.user.top, left: dropdownPos.user.left, width: dropdownPos.user.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-2 border-b border-zinc-800">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input autoFocus value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-8 pl-8 pr-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-blue-500/40 transition-all" />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-blue-500/50" /></div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No users found</p>
                ) : (
                  filteredUsers.map(u => {
                    const isSelected = selectedAttendees.some(a => a.id === u.id);
                    return (
                      <button key={u.id} type="button" onClick={() => {
                        setSelectedAttendees(prev =>
                          prev.some(a => a.id === u.id) ? prev.filter(a => a.id !== u.id) : [...prev, u]
                        );
                      }}
                        className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", isSelected && "bg-blue-500/5")}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400 uppercase">
                            {(u.first_name?.[0] || u.email?.[0] || '?')}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">{u.first_name || u.email}</p>
                            {u.email && u.first_name && <p className="text-[9px] text-white/20">{u.email}</p>}
                          </div>
                        </div>
                        {isSelected && <Check size={12} className="text-blue-400 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

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
              setError('Failed to delete meeting.');
            } finally {
              setIsDeleting(false);
            }
          }}
          isDeleting={isDeleting}
          title="Delete Meeting"
          description="This will permanently remove this meeting."
        />
      </div>
    </div>,
    document.body
  );
};

export default UpdateMeetingModal;
