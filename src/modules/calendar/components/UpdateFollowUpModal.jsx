import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CalendarPlus, Trash2, ChevronDown, Search, Check } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const UpdateFollowUpModal = ({ event, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [assignedTo, setAssignedTo] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ user: null, contact: null });
  const userRef = useRef(null);
  const contactRef = useRef(null);

  const isCreator = event?.user === user?.id;
  const canEdit = isCreator;

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setStart(event.start ? event.start.slice(0, 16) : '');
      setAssignedTo(event.assigned_to ? { id: event.assigned_to, first_name: event.assigned_to_name } : null);
      setSelectedContact(event.contact ? { id: event.contact, name: event.contact_name } : null);
      setError('');

      setUsersLoading(true);
      axios.get('/api/auth/users/assignable/')
        .then(res => setUsers(res.data || []))
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));

      setContactsLoading(true);
      axios.get('/api/contacts/')
        .then(res => setContacts(res.data.results || res.data || []))
        .catch(() => setContacts([]))
        .finally(() => setContactsLoading(false));
    }
  }, [isOpen, event]);

  const openUserDropdown = () => {
    if (userRef.current) {
      const rect = userRef.current.getBoundingClientRect();
      setDropdownPos({ user: { top: rect.bottom + 4, left: rect.left, width: rect.width }, contact: null });
      setShowContactDropdown(false);
      setShowUserDropdown(true);
    }
  };

  const openContactDropdown = () => {
    if (contactRef.current) {
      const rect = contactRef.current.getBoundingClientRect();
      setDropdownPos({ contact: { top: rect.bottom + 4, left: rect.left, width: rect.width }, user: null });
      setShowUserDropdown(false);
      setShowContactDropdown(true);
    }
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    !contactSearch || c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(contactSearch.toLowerCase())
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
        assigned_to: assignedTo?.id || null,
        contact: selectedContact?.id || null,
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
            <h2 className="text-sm font-medium text-white uppercase tracking-wider">Update Follow Up</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Edit follow-up details</p>
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
              <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider">Read-only — only the creator can edit this follow-up.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} id="update-followup-form">
            <div className="px-8 py-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} disabled={!canEdit}
                  className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Notes</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={!canEdit} rows={3}
                  className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Contact</label>
                  {canEdit ? (
                    <button ref={contactRef} type="button" onClick={openContactDropdown}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                      {selectedContact ? <span className="text-white">{selectedContact.name || selectedContact.id}</span> : <span className="text-white/20">Select contact...</span>}
                      <ChevronDown size={14} className="text-white/20" />
                    </button>
                  ) : (
                    <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{selectedContact?.name || 'None'}</div>
                  )}
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assign To</label>
                  {canEdit ? (
                    <button ref={userRef} type="button" onClick={openUserDropdown}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                      {assignedTo ? <span className="text-white">{assignedTo.first_name || assignedTo.id}</span> : <span className="text-white/20">Unassigned</span>}
                      <ChevronDown size={14} className="text-white/20" />
                    </button>
                  ) : (
                    <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{assignedTo?.first_name || 'Unassigned'}</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Date</label>
                <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} disabled={!canEdit}
                  className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
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
            <button type="submit" form="update-followup-form" disabled={isSubmitting || !title.trim() || !start}
              className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CalendarPlus size={14} />Save</>}
            </button>
          )}
        </div>

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
                  filteredUsers.map(u => (
                    <button key={u.id} type="button" onClick={() => { setAssignedTo(u); setShowUserDropdown(false); setDropdownPos(prev => ({ ...prev, user: null })); setUserSearch(''); }}
                      className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", assignedTo?.id === u.id && "bg-blue-500/5")}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400 uppercase">
                          {(u.first_name?.[0] || u.email?.[0] || '?')}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{u.first_name || u.email}</p>
                          {u.email && u.first_name && <p className="text-[9px] text-white/20">{u.email}</p>}
                        </div>
                      </div>
                      {assignedTo?.id === u.id && <Check size={12} className="text-blue-400 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {showContactDropdown && dropdownPos.contact && canEdit && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowContactDropdown(false); setDropdownPos(prev => ({ ...prev, contact: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.contact.top, left: dropdownPos.contact.left, width: dropdownPos.contact.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-2 border-b border-zinc-800">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input autoFocus value={contactSearch} onChange={e => setContactSearch(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-8 pl-8 pr-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-blue-500/40 transition-all" />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {contactsLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-blue-500/50" /></div>
                ) : filteredContacts.length === 0 ? (
                  <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No contacts found</p>
                ) : (
                  filteredContacts.map(c => (
                    <button key={c.id} type="button" onClick={() => { setSelectedContact(c); setShowContactDropdown(false); setDropdownPos(prev => ({ ...prev, contact: null })); setContactSearch(''); }}
                      className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", selectedContact?.id === c.id && "bg-blue-500/5")}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400 uppercase">
                          {(c.name?.[0] || c.email?.[0] || '?')}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{c.name || c.email}</p>
                          {c.email && c.name && <p className="text-[9px] text-white/20">{c.email}</p>}
                        </div>
                      </div>
                      {selectedContact?.id === c.id && <Check size={12} className="text-blue-400 shrink-0" />}
                    </button>
                  ))
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
              setError('Failed to delete follow-up.');
            } finally {
              setIsDeleting(false);
            }
          }}
          isDeleting={isDeleting}
          title="Delete Follow Up"
          description="This will permanently remove this follow-up."
        />
      </div>
    </div>,
    document.body
  );
};

export default UpdateFollowUpModal;
