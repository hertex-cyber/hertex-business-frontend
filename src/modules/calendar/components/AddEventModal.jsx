import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPlus, Loader2, Check, ChevronDown, Search, X, ListChecks, Calendar, Bell, Users } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'followup', label: 'Follow Up', icon: Bell },
  { id: 'meetings', label: 'Meetings', icon: Users },
];

const AddEventModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState(null);
  const [location, setLocation] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ priority: null, user: null, contact: null });
  const priorityRef = useRef(null);
  const userRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const startStr = now.toISOString().slice(0, 16);
      const endStr = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
      setStart(startStr);
      setEnd(endStr);

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
  }, [isOpen]);

  const reset = () => {
    setTitle(''); setDescription(''); setStart(''); setEnd('');
    setPriority('medium'); setAssignedTo(null); setSelectedContact(null); setLocation(''); setUserSearch(''); setContactSearch(''); setError('');
    setShowPriorityDropdown(false); setShowUserDropdown(false); setShowContactDropdown(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const openPriorityDropdown = () => {
    if (priorityRef.current) {
      const rect = priorityRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, priority: { top: rect.bottom + 4, left: rect.left, width: rect.width }, user: null, contact: null }));
      setShowUserDropdown(false);
      setShowContactDropdown(false);
      setShowPriorityDropdown(true);
    }
  };

  const openUserDropdown = () => {
    if (userRef.current) {
      const rect = userRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, user: { top: rect.bottom + 4, left: rect.left, width: rect.width }, priority: null, contact: null }));
      setShowPriorityDropdown(false);
      setShowContactDropdown(false);
      setShowUserDropdown(true);
    }
  };

  const openContactDropdown = () => {
    if (contactRef.current) {
      const rect = contactRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, contact: { top: rect.bottom + 4, left: rect.left, width: rect.width }, priority: null, user: null }));
      setShowPriorityDropdown(false);
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
    setIsSubmitting(true);
    setError('');

    const typeMap = { tasks: 'task', event: 'event', followup: 'followup', meetings: 'meeting' };

    const basePayload = {
      todo_type: typeMap[activeTab],
      title,
      description: description || undefined,
    };

    let payload;
    switch (activeTab) {
      case 'tasks':
        payload = {
          ...basePayload,
          priority,
          assigned_to: assignedTo?.id || null,
          start: start ? new Date(start).toISOString() : null,
        };
        break;
      case 'event':
        payload = {
          ...basePayload,
          start: start ? new Date(start).toISOString() : null,
        };
        break;
      case 'followup':
        payload = {
          ...basePayload,
          contact: selectedContact?.id || null,
          assigned_to: assignedTo?.id || null,
          start: start ? new Date(start).toISOString() : null,
        };
        break;
      case 'meetings':
        payload = {
          ...basePayload,
          location: location || undefined,
          assigned_to: assignedTo?.id || null,
          attendee_ids: assignedTo ? [assignedTo.id] : [],
          start: start ? new Date(start).toISOString() : null,
        };
        break;
      default:
        payload = basePayload;
    }

    try {
      await axios.post('/api/calendar/todos/', payload);
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Failed to save. Please check all required fields.';
      if (data) {
        if (typeof data === 'string') {
          msg = data;
        } else if (data.detail) {
          msg = data.detail;
        } else {
          const firstKey = Object.keys(data)[0];
          const firstError = data[firstKey];
          msg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CalendarPlus size={14} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white uppercase tracking-wider">Add Event</h2>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">New Calendar Entry</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80 shrink-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-semibold uppercase tracking-[0.1em] transition-all cursor-pointer",
                    isActive
                      ? "bg-white/10 text-white border border-white/5"
                      : "text-white/40 hover:text-white hover:bg-white/[0.02] border border-transparent"
                  )}
                >
                  <Icon size={10} className={isActive ? "text-blue-400" : "text-white/30"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} id="add-event-form">
            <div className="px-8 py-6 space-y-5 min-h-[360px]">

              {activeTab === 'tasks' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Task Name *</label>
                    <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="Enter task name"
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Add details about this task..."
                      rows={3}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Priority</label>
                      <button ref={priorityRef} type="button" onClick={openPriorityDropdown}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700", priority === 'high' ? 'text-red-400' : priority === 'medium' ? 'text-yellow-400' : 'text-blue-400')}>
                        <span className="capitalize">{priority}</span>
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assign To</label>
                      <button ref={userRef} type="button" onClick={openUserDropdown}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                        {assignedTo ? <span className="text-white">{assignedTo.first_name || assignedTo.email}</span> : <span className="text-white/20">Select a team member...</span>}
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Deadline *</label>
                    <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                  </div>
                </>
              )}

              {activeTab === 'event' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Name *</label>
                      <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Enter event name"
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Date *</label>
                      <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Add details about this event..."
                      rows={11}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                  </div>
                </>
              )}

              {activeTab === 'followup' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Title *</label>
                    <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="Enter follow-up title"
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Notes</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Add follow-up notes..."
                      rows={3}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Contact</label>
                      <button ref={contactRef} type="button" onClick={openContactDropdown}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                        {selectedContact ? <span className="text-white">{selectedContact.name || selectedContact.email}</span> : <span className="text-white/20">Select a contact...</span>}
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assign To</label>
                      <button ref={userRef} type="button" onClick={openUserDropdown}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                        {assignedTo ? <span className="text-white">{assignedTo.first_name || assignedTo.email}</span> : <span className="text-white/20">Select a team member...</span>}
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Date *</label>
                    <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                  </div>
                </>
              )}

              {activeTab === 'meetings' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Meeting Title *</label>
                    <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="Enter meeting title"
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Agenda</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Add meeting agenda..."
                      rows={3}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Location / Link</label>
                      <input value={location} onChange={e => setLocation(e.target.value)}
                        placeholder="Add meeting location or link..."
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assign To</label>
                      <button ref={userRef} type="button" onClick={openUserDropdown}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                        {assignedTo ? <span className="text-white">{assignedTo.first_name || assignedTo.email}</span> : <span className="text-white/20">Select a team member...</span>}
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Date & Time *</label>
                    <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                  </div>
                </>
              )}

              {error && (
                <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>
              )}
            </div>
          </form>
        </div>

        {showPriorityDropdown && dropdownPos.priority && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowPriorityDropdown(false); setDropdownPos(prev => ({ ...prev, priority: null })); }} />
            <div
              style={{ position: 'fixed', top: dropdownPos.priority.top, left: dropdownPos.priority.left, width: dropdownPos.priority.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
          >
            {['low', 'medium', 'high'].map(p => (
              <button key={p} type="button" onClick={() => { setPriority(p); setShowPriorityDropdown(false); setDropdownPos(prev => ({ ...prev, priority: null })); }}
                className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", priority === p && "bg-blue-500/5")}>
                <span className={cn("text-xs font-medium capitalize", p === 'high' ? 'text-red-400' : p === 'medium' ? 'text-yellow-400' : 'text-blue-400')}>{p}</span>
                {priority === p && <Check size={12} className="text-blue-400 shrink-0" />}
              </button>
            ))}
          </div>
          </>
        )}

        {showUserDropdown && dropdownPos.user && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowUserDropdown(false); setDropdownPos(prev => ({ ...prev, user: null })); }} />
            <div
              style={{ position: 'fixed', top: dropdownPos.user.top, left: dropdownPos.user.left, width: dropdownPos.user.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
          >
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
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={16} className="animate-spin text-blue-500/50" />
                </div>
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

        {showContactDropdown && dropdownPos.contact && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowContactDropdown(false); setDropdownPos(prev => ({ ...prev, contact: null })); }} />
            <div
              style={{ position: 'fixed', top: dropdownPos.contact.top, left: dropdownPos.contact.left, width: dropdownPos.contact.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
          >
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
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={16} className="animate-spin text-blue-500/50" />
                </div>
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

        <div className="px-8 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-event-form"
            disabled={isSubmitting || !title.trim() || !start}
            className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2"
          >
            {isSubmitting
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : <><CalendarPlus size={14} />Save Event</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddEventModal;
