import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPlus, Loader2, Check, ChevronDown, Search, X, ListChecks, Calendar, Bell, Users } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  MEETING_STATUS_OPTIONS, getMeetingStatusTextColor,
  getMeetingStatusDropdownItemStyle, getMeetingStatusDotColor,
  EVENT_STATUS_OPTIONS, getEventStatusTextColor,
  getEventStatusDropdownItemStyle, getEventStatusDotColor
} from '../constants';

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'followup', label: 'Follow Up', icon: Bell },
  { id: 'meetings', label: 'Meetings', icon: Users },
];

const AddEventModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Superadmin' || user?.role === 'Admin';
  const [activeTab, setActiveTab] = useState('tasks');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState(null);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [location, setLocation] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState('');
  const [meetingEndTime, setMeetingEndTime] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [eventStatus, setEventStatus] = useState('upcoming');
  const [isFullDay, setIsFullDay] = useState(false);
  const [followUpStatus, setFollowUpStatus] = useState('follow_up');
  const [meetingStatus, setMeetingStatus] = useState('upcoming');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showEventStatusDropdown, setShowEventStatusDropdown] = useState(false);
  const [showFollowUpStatusDropdown, setShowFollowUpStatusDropdown] = useState(false);
  const [showMeetingStatusDropdown, setShowMeetingStatusDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [pipelines, setPipelines] = useState([]);
  const [pipelinesLoading, setPipelinesLoading] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ priority: null, eventStatus: null, followUpStatus: null, meetingStatus: null, user: null, contact: null, pipeline: null });
  const priorityRef = useRef(null);
  const eventStatusRef = useRef(null);
  const followUpStatusRef = useRef(null);
  const meetingStatusRef = useRef(null);
  const userRef = useRef(null);
  const contactRef = useRef(null);
  const pipelineRef = useRef(null);
  const prevAssignedToId = useRef(null);

  useEffect(() => {
    if (isOpen) {
      reset();
      const now = new Date();
      const startStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00`;
      const endStr = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
      setStart(startStr);
      setEnd(endStr);
      setMeetingDate(now.toISOString().slice(0, 10));
      const defaultTime = now.toISOString().slice(11, 16);
      setMeetingStartTime(defaultTime);
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      setMeetingEndTime(end.toISOString().slice(11, 16));

      setUsersLoading(true);
      axios.get('/api/auth/users/assignable/')
        .then(res => {
          const usersData = res.data || [];
          setUsers(usersData);
          if (!isAdmin && user) {
            setAssignedTo({ id: user.id, first_name: user.first_name || user.email, email: user.email, role: user.role });
          }
        })
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));

      setPipelinesLoading(true);
      axios.get('/api/crm/pipelines/')
        .then(res => setPipelines(res.data.results || res.data || []))
        .catch(() => setPipelines([]))
        .finally(() => setPipelinesLoading(false));

    }
  }, [isOpen]);

  const loadContacts = useCallback((pipeline, userObj, search) => {
    if (pipeline?.id && userObj?.id) {
      setContactsLoading(true);
      const params = new URLSearchParams();
      params.set('pipeline', pipeline.id);
      params.set('assigned_user', userObj.id);
      if (search) params.set('search', search);
      axios.get(`/api/crm/pipeline/?${params}`)
        .then(res => {
          const items = res.data.results || res.data || [];
          setContacts(items.map(c => ({ id: c.contact_details?.id, name: c.contact_details?.name, email: c.contact_details?.email })));
        })
        .catch(() => setContacts([]))
        .finally(() => setContactsLoading(false));
    } else {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    if (selectedPipeline?.id && assignedTo?.id) {
      if (prevAssignedToId.current !== assignedTo.id) {
        setSelectedContact(null);
        setContactSearch('');
      }
      prevAssignedToId.current = assignedTo.id;
      loadContacts(selectedPipeline, assignedTo, '');
    } else {
      setContacts([]);
    }
  }, [selectedPipeline, assignedTo, loadContacts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedPipeline?.id && assignedTo?.id) {
        loadContacts(selectedPipeline, assignedTo, contactSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [contactSearch, selectedPipeline, assignedTo, loadContacts]);

  const reset = () => {
    setTitle(''); setDescription(''); setStart(''); setEnd('');
    setPriority('medium'); setEventStatus('upcoming'); setFollowUpStatus('follow_up'); setIsFullDay(false); setAssignedTo(null); setSelectedAttendees([]); setSelectedContact(null); setSelectedPipeline(null); setLocation(''); setMeetingDate(''); setMeetingStartTime(''); setMeetingEndTime(''); setUserSearch(''); setContactSearch(''); setError('');
    setShowPriorityDropdown(false); setShowEventStatusDropdown(false); setShowFollowUpStatusDropdown(false); setShowMeetingStatusDropdown(false); setShowUserDropdown(false); setShowContactDropdown(false); setShowPipelineDropdown(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const openPriorityDropdown = () => {
    if (priorityRef.current) {
      const rect = priorityRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, priority: { top: rect.bottom + 4, left: rect.left, width: rect.width }, eventStatus: null, user: null, contact: null }));
      setShowEventStatusDropdown(false);
      setShowUserDropdown(false);
      setShowContactDropdown(false);
      setShowPriorityDropdown(true);
    }
  };

  const openEventStatusDropdown = () => {
    if (eventStatusRef.current) {
      const rect = eventStatusRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, eventStatus: { top: rect.bottom + 4, left: rect.left, width: rect.width }, priority: null, user: null, contact: null }));
      setShowPriorityDropdown(false);
      setShowUserDropdown(false);
      setShowContactDropdown(false);
      setShowEventStatusDropdown(true);
    }
  };

  const openMeetingStatusDropdown = () => {
    if (meetingStatusRef.current) {
      const rect = meetingStatusRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, meetingStatus: { top: rect.bottom + 4, left: rect.left, width: rect.width }, priority: null, eventStatus: null, followUpStatus: null, user: null, contact: null }));
      setShowPriorityDropdown(false);
      setShowEventStatusDropdown(false);
      setShowFollowUpStatusDropdown(false);
      setShowMeetingStatusDropdown(true);
      setShowUserDropdown(false);
      setShowContactDropdown(false);
    }
  };

  const openFollowUpStatusDropdown = () => {
    if (followUpStatusRef.current) {
      const rect = followUpStatusRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, followUpStatus: { top: rect.bottom + 4, left: rect.left, width: rect.width }, priority: null, eventStatus: null, user: null, contact: null, pipeline: null }));
      setShowUserDropdown(false);
      setShowContactDropdown(false);
      setShowPipelineDropdown(false);
      setShowFollowUpStatusDropdown(true);
    }
  };

  const openUserDropdown = () => {
    if (userRef.current) {
      const rect = userRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, user: { top: rect.bottom + 4, left: rect.left, width: rect.width }, priority: null, eventStatus: null, contact: null, pipeline: null }));
      setShowContactDropdown(false);
      setShowPipelineDropdown(false);
      setShowUserDropdown(true);
    }
  };

  const openContactDropdown = () => {
    if (contactRef.current) {
      const rect = contactRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, contact: { top: rect.bottom + 4, left: rect.left, width: rect.width }, priority: null, eventStatus: null, user: null, pipeline: null }));
      setShowUserDropdown(false);
      setShowPipelineDropdown(false);
      setShowContactDropdown(true);
    }
  };

  const openPipelineDropdown = () => {
    if (pipelineRef.current) {
      const rect = pipelineRef.current.getBoundingClientRect();
      setDropdownPos(prev => ({ ...prev, pipeline: { top: rect.bottom + 4, left: rect.left, width: rect.width }, followUpStatus: null, user: null, contact: null }));
      setShowUserDropdown(false);
      setShowContactDropdown(false);
      setShowPipelineDropdown(true);
    }
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(userSearch.toLowerCase())
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
          status: eventStatus,
          start: start ? new Date(start).toISOString() : null,
          end: isFullDay
            ? (start ? new Date(new Date(start).setHours(23, 59, 59, 999)).toISOString() : null)
            : (end ? new Date(end).toISOString() : null),
        };
        break;
      case 'followup':
        payload = {
          ...basePayload,
          status: followUpStatus,
          pipeline: selectedPipeline?.id || null,
          contact: selectedContact?.id || null,
          assigned_to: assignedTo?.id || null,
          start: start ? new Date(start).toISOString() : null,
        };
        break;
      case 'meetings':
        payload = {
          ...basePayload,
          status: meetingStatus,
          location: location || undefined,
          attendee_ids: selectedAttendees.map(a => a.id),
          start: meetingDate && meetingStartTime ? new Date(`${meetingDate}T${meetingStartTime}`).toISOString() : null,
          end: meetingDate && meetingEndTime ? new Date(`${meetingDate}T${meetingEndTime}`).toISOString() : null,
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
                      {isAdmin ? (
                        <button ref={userRef} type="button" onClick={openUserDropdown}
                          className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                          {assignedTo ? <span className="text-white">{assignedTo.first_name || assignedTo.email}</span> : <span className="text-white/20">Select a team member...</span>}
                          <ChevronDown size={14} className="text-white/20" />
                        </button>
                      ) : (
                        <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{assignedTo?.first_name || 'Unassigned'}</div>
                      )}
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
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                      <button ref={eventStatusRef} type="button" onClick={openEventStatusDropdown}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getEventStatusTextColor(eventStatus))}>
                        <span>{eventStatus}</span>
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-[15px] pt-5">
                    <label className="text-xs font-medium uppercase tracking-[0.2em] text-white leading-none">Single Day</label>
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Date *</label>
                      <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">End Date</label>
                      <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} disabled={isFullDay}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Add details about this event..."
                      rows={7}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                  </div>
                </>
              )}

              {activeTab === 'followup' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Title *</label>
                      <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Enter follow-up title"
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                      <button ref={followUpStatusRef} type="button" onClick={openFollowUpStatusDropdown}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize",
                          followUpStatus === 'failed' ? 'text-red-400' :
                          followUpStatus === 'complete' ? 'text-emerald-400' :
                          followUpStatus === 'cancelled' ? 'text-white/40' :
                          'text-blue-400')}>
                        <span>{followUpStatus.replace('_', ' ')}</span>
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Pipeline</label>
                      <button ref={pipelineRef} type="button" onClick={openPipelineDropdown}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700", selectedPipeline ? "text-white" : "text-white/20")}>
                        <span>{selectedPipeline?.name || 'Select pipeline...'}</span>
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Date *</label>
                      <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assign To</label>
                      {isAdmin ? (
                        <button ref={userRef} type="button" onClick={openUserDropdown} disabled={!selectedPipeline}
                          className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all", selectedPipeline ? "text-white/60 hover:border-zinc-700 cursor-pointer" : "text-white/20 cursor-not-allowed opacity-40")}>
                          {assignedTo ? <span className="text-white">{assignedTo.first_name || assignedTo.email}</span> : <span className="text-white/20">Select a team member...</span>}
                          <ChevronDown size={14} className="text-white/20" />
                        </button>
                      ) : (
                        <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{assignedTo?.first_name || 'Unassigned'}</div>
                      )}
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Contact</label>
                      <button ref={contactRef} type="button" onClick={openContactDropdown} disabled={!assignedTo || !selectedPipeline}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all", assignedTo && selectedPipeline ? "text-white/60 hover:border-zinc-700 cursor-pointer" : "text-white/20 cursor-not-allowed opacity-40")}>
                        {selectedContact ? <span className="text-white">{selectedContact.name || selectedContact.email}</span> : <span className="text-white/20">Select a contact...</span>}
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Notes</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Add follow-up notes..."
                      rows={3}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                  </div>
                </>
              )}

              {activeTab === 'meetings' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Meeting Title *</label>
                      <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Enter meeting title"
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                      <button ref={meetingStatusRef} type="button" onClick={openMeetingStatusDropdown}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getMeetingStatusTextColor(meetingStatus))}>
                        <span>{meetingStatus}</span>
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
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
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Attendees (multi-select)</label>
                      <button ref={userRef} type="button" onClick={openUserDropdown}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                        <span className={selectedAttendees.length > 0 ? 'text-white' : 'text-white/20'}>
                          {selectedAttendees.length === 0 ? 'Select attendees...' :
                            `${selectedAttendees[0].first_name || selectedAttendees[0].email}${selectedAttendees.length > 1 ? ` +${selectedAttendees.length - 1}` : ''}`}
                        </span>
                        <ChevronDown size={14} className="text-white/20 shrink-0" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Date *</label>
                      <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Start Time *</label>
                      <input type="time" value={meetingStartTime} onChange={e => setMeetingStartTime(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">End Time *</label>
                      <input type="time" value={meetingEndTime} onChange={e => setMeetingEndTime(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                    </div>
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

        {showEventStatusDropdown && dropdownPos.eventStatus && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowEventStatusDropdown(false); setDropdownPos(prev => ({ ...prev, eventStatus: null })); }} />
            <div
              style={{ position: 'fixed', top: dropdownPos.eventStatus.top, left: dropdownPos.eventStatus.left, width: dropdownPos.eventStatus.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1"
          >
            {EVENT_STATUS_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => { setEventStatus(opt.value); setShowEventStatusDropdown(false); setDropdownPos(prev => ({ ...prev, eventStatus: null })); }}
                className={cn("w-full px-4 py-2.5 text-left text-xs font-medium rounded-lg transition-all capitalize flex items-center gap-2", getEventStatusDropdownItemStyle(opt.value, eventStatus === opt.value))}>
                <div className={cn("w-1.5 h-1.5 rounded-full", getEventStatusDotColor(opt.value))} />
                {opt.label}
                {eventStatus === opt.value && <Check size={12} className="ml-auto shrink-0" />}
              </button>
            ))}
          </div>
          </>
        )}

        {showFollowUpStatusDropdown && dropdownPos.followUpStatus && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowFollowUpStatusDropdown(false); setDropdownPos(prev => ({ ...prev, followUpStatus: null })); }} />
            <div
              style={{ position: 'fixed', top: dropdownPos.followUpStatus.top, left: dropdownPos.followUpStatus.left, width: dropdownPos.followUpStatus.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
          >
            {['follow_up', 'complete', 'cancelled'].map(s => (
              <button key={s} type="button" onClick={() => { setFollowUpStatus(s); setShowFollowUpStatusDropdown(false); setDropdownPos(prev => ({ ...prev, followUpStatus: null })); }}
                className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left capitalize", followUpStatus === s && "bg-blue-500/5")}>
                <span className={cn("text-xs font-medium capitalize",
                  s === 'failed' ? 'text-red-400' :
                  s === 'complete' ? 'text-emerald-400' :
                  s === 'cancelled' ? 'text-white/40' :
                  'text-blue-400')}>{s.replace('_', ' ')}</span>
                {followUpStatus === s && <Check size={12} className="text-blue-400 shrink-0" />}
              </button>
            ))}
          </div>
          </>
        )}

        {showMeetingStatusDropdown && dropdownPos.meetingStatus && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowMeetingStatusDropdown(false); setDropdownPos(prev => ({ ...prev, meetingStatus: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.meetingStatus.top, left: dropdownPos.meetingStatus.left, width: dropdownPos.meetingStatus.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1">
              {MEETING_STATUS_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => { setMeetingStatus(opt.value); setShowMeetingStatusDropdown(false); setDropdownPos(prev => ({ ...prev, meetingStatus: null })); }}
                  className={cn("w-full px-4 py-2.5 text-left text-xs font-medium rounded-lg transition-all capitalize flex items-center gap-2", getMeetingStatusDropdownItemStyle(opt.value, meetingStatus === opt.value))}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", getMeetingStatusDotColor(opt.value))} />
                  {opt.label}
                  {meetingStatus === opt.value && <Check size={12} className="ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}

        {showUserDropdown && dropdownPos.user && isAdmin && (
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
                filteredUsers.map(u => {
                  const isSelected = activeTab === 'meetings'
                    ? selectedAttendees.some(a => a.id === u.id)
                    : assignedTo?.id === u.id;
                  return (
                    <button key={u.id} type="button" onClick={() => {
                      if (activeTab === 'meetings') {
                        setSelectedAttendees(prev =>
                          prev.some(a => a.id === u.id) ? prev.filter(a => a.id !== u.id) : [...prev, u]
                        );
                      } else {
                        setAssignedTo(u);
                        setShowUserDropdown(false);
                        setDropdownPos(prev => ({ ...prev, user: null }));
                        setUserSearch('');
                      }
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

        {showPipelineDropdown && dropdownPos.pipeline && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowPipelineDropdown(false); setDropdownPos(prev => ({ ...prev, pipeline: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.pipeline.top, left: dropdownPos.pipeline.left, width: dropdownPos.pipeline.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {pipelinesLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-blue-500/50" /></div>
                ) : pipelines.length === 0 ? (
                  <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No pipelines found</p>
                ) : (
                  pipelines.map(p => (
                    <button key={p.id} type="button" onClick={() => { setSelectedPipeline(p); setAssignedTo(null); setSelectedContact(null); setShowPipelineDropdown(false); setDropdownPos(prev => ({ ...prev, pipeline: null })); }}
                      className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", selectedPipeline?.id === p.id && "bg-blue-500/5")}>
                      <span className="text-xs font-medium text-white">{p.name}</span>
                      {selectedPipeline?.id === p.id && <Check size={12} className="text-blue-400 shrink-0" />}
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
              ) : contacts.length === 0 ? (
                <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No contacts found</p>
              ) : (
                contacts.map(c => (
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
            disabled={isSubmitting || !title.trim() || (activeTab === 'meetings' ? (!meetingDate || !meetingStartTime || !meetingEndTime) : !start) || (activeTab === 'event' && !description.trim())}
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
