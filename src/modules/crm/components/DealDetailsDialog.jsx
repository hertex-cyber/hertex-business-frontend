import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Tag, Calendar, Database, FileText, User, Trash2, Wallet, Clock, Users, Save, ChevronDown, Check, Plus, Loader2, MessageSquare } from 'lucide-react';
import { TbEdit } from "react-icons/tb";
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const STATUS_STYLES = {
    Lead:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Prospect: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Customer: 'bg-green-500/10 text-green-400 border-green-500/20',
    Inactive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    Won:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Lost:     'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_STYLES = {
    High:   'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Low:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const Field = ({ icon: Icon, label, value, colorClass, isEditing, children }) => {
    if (!value && !isEditing) return null;
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
                <Icon size={12} className={colorClass} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] text-white/30 mb-0.5 uppercase tracking-wider">{label}</p>
                {isEditing ? (
                    children
                ) : (
                    <p className="text-sm text-white truncate">{value}</p>
                )}
            </div>
        </div>
    );
};

const DealDetailsDialog = ({ isOpen, onClose, deal, onDelete, eligibleUsers = [], onUpdate }) => {
    const { user } = useAuth();
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [localDeal, setLocalDeal] = useState(deal);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isPaymentMethodDropdownOpen, setIsPaymentMethodDropdownOpen] = useState(false);
    const paymentMethodDropdownRef = useRef(null);

    // Inline Contact Edit States
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        source: '',
    });
    const [editAdditionalData, setEditAdditionalData] = useState([]);
    const [validationError, setValidationError] = useState('');
    const [isSavingContact, setIsSavingContact] = useState(false);

    // Tab & Payments State
    const [activeTab, setActiveTab] = useState('profile');
    const [paymentSubTab, setPaymentSubTab] = useState('pay');
    const [payments, setPayments] = useState([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentFor, setPaymentFor] = useState('');
    const [paymentRemarks, setPaymentRemarks] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [paymentInvoice, setPaymentInvoice] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [expandedPayments, setExpandedPayments] = useState({});

    const togglePaymentExpand = (id) => {
        setExpandedPayments(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const fetchPayments = async () => {
        if (!localDeal?.id) return;
        setIsLoadingPayments(true);
        try {
            const response = await axios.get(`/api/payments/?crm=${localDeal.id}`);
            setPayments(response.data.results || response.data);
        } catch (err) {
            console.error("Failed to fetch payments:", err);
        } finally {
            setIsLoadingPayments(false);
        }
    };

    // Activity Log States
    const [logs, setLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    const fetchLogs = async () => {
        const contactId = localDeal.raw?.contact_details?.id || localDeal.raw?.contact;
        if (!localDeal?.id || !contactId) return;
        setIsLoadingLogs(true);
        try {
            const response = await axios.get(`/api/contacts/logs/?crm=${localDeal.id}&contact=${contactId}`);
            setLogs(response.data.results || response.data);
        } catch (err) {
            console.error("Failed to fetch activity logs:", err);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    // Remarks States
    const [remarks, setRemarks] = useState([]);
    const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
    const [newRemarkText, setNewRemarkText] = useState('');
    const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
    const [isEditingRemark, setIsEditingRemark] = useState(false);

    const fetchRemarks = async () => {
        const contactId = localDeal.raw?.contact_details?.id || localDeal.raw?.contact;
        if (!localDeal?.id || !contactId) return;
        setIsLoadingRemarks(true);
        try {
            const response = await axios.get(`/api/contacts/remarks/?crm=${localDeal.id}&contact=${contactId}`);
            setRemarks(response.data.results || response.data);
        } catch (err) {
            console.error("Failed to fetch remarks:", err);
        } finally {
            setIsLoadingRemarks(false);
        }
    };

    const handleAddRemark = async (e) => {
        e.preventDefault();
        const contactId = localDeal.raw?.contact_details?.id || localDeal.raw?.contact;
        if (!newRemarkText.trim() || !contactId) return;
        setIsSubmittingRemark(true);
        try {
            await axios.post('/api/contacts/remarks/', {
                contact: contactId,
                crm: localDeal.id,
                text: newRemarkText.trim()
            });
            setNewRemarkText('');
            setIsEditingRemark(false);
            await fetchRemarks();
        } catch (err) {
            console.error("Failed to add remark:", err);
        } finally {
            setIsSubmittingRemark(false);
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'activity') {
            fetchLogs();
        }
    }, [isOpen, activeTab, localDeal]);

    useEffect(() => {
        if (isOpen && activeTab === 'profile') {
            fetchRemarks();
        }
    }, [isOpen, activeTab, localDeal]);

    useEffect(() => {
        if (isOpen) {
            fetchPayments();
        }
    }, [isOpen, localDeal]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
            if (paymentMethodDropdownRef.current && !paymentMethodDropdownRef.current.contains(e.target)) {
                setIsPaymentMethodDropdownOpen(false);
            }
        };
        if (isDropdownOpen || isPaymentMethodDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen, isPaymentMethodDropdownOpen]);

    useEffect(() => {
        setLocalDeal(deal);
    }, [deal]);

    useEffect(() => {
        if (localDeal?.assigned_user) {
            setSelectedUserId(localDeal.assigned_user);
        } else {
            setSelectedUserId(null);
        }
    }, [localDeal]);

    if (!isOpen || !deal || !localDeal) return null;

    const customFieldsEnabled = localDeal?.raw?.pipeline_details?.custom_fields_enabled;
    const dynamicCustomFields = (localDeal?.raw?.pipeline_details?.mandatory_fields || []).filter(
        f => !['name', 'email', 'phone', 'jobtitle', 'job_title', 'company', 'companyname', 'company_name', 'dealvalue', 'deal_value', 'value'].includes(f.toLowerCase().replace(/[\s_-]/g, ''))
    );

    // Read-only Additional Entries
    const displayEntries = (() => {
        const contactDetails = localDeal?.raw?.contact_details || {};
        const existingData = contactDetails.additional_data || {};
        if (customFieldsEnabled) {
            return dynamicCustomFields.map(field => {
                const cleanKey = field.trim().replace(/\s+/g, '_').toLowerCase();
                return [field, existingData[cleanKey] !== undefined ? existingData[cleanKey] : '—'];
            });
        }
        return Object.entries(existingData).filter(
            ([, v]) => v !== null && v !== undefined && v !== ''
        );
    })();

    const handleSaveUser = async () => {
        if (!localDeal) return;
        
        setIsSaving(true);
        try {
            const response = await axios.patch(`/api/crm/pipeline/${localDeal.id}/`, {
                assigned_user: selectedUserId
            });
            
            const updatedRaw = response.data;
            const transformed = {
                id: updatedRaw.id,
                name: updatedRaw.contact_details?.name || "Unknown",
                email: updatedRaw.contact_details?.email || "No Email",
                phone: updatedRaw.contact_details?.phone || "No Phone",
                status: updatedRaw.contact_details?.status || "Lead",
                value: `₹ ${updatedRaw.value}`,
                priority: updatedRaw.priority,
                lastContact: new Date(updatedRaw.updated_at).toLocaleDateString(),
                assigned_user: updatedRaw.assigned_user,
                assigned_user_details: updatedRaw.assigned_user_details,
                stage: updatedRaw.stage,
                raw: updatedRaw,
            };
            
            setLocalDeal(transformed);
            
            if (onUpdate) {
                onUpdate(transformed);
            }
            
            setIsEditingUser(false);
            setIsDropdownOpen(false);
            setError(null);
            await fetchLogs();
        } catch (err) {
            console.error("Error assigning user:", err);
            setError(err.response?.data?.detail || err.message || "Failed to assign user");
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartEditContact = () => {
        const contactDetails = localDeal?.raw?.contact_details || {};
        setEditForm({
            name: contactDetails.name || localDeal.name || '',
            email: contactDetails.email || localDeal.email || '',
            phone: contactDetails.phone || localDeal.phone || '',
            source: contactDetails.source || '',
        });

        const existingData = { ...(contactDetails.additional_data || {}) };
        const entries = [];

        if (customFieldsEnabled) {
            // Pipeline Custom Fields are strictly defined & locked
            dynamicCustomFields.forEach((field, idx) => {
                const cleanKey = field.trim().replace(/\s+/g, '_').toLowerCase();
                const existingValue = existingData[cleanKey] !== undefined ? existingData[cleanKey] : '';
                entries.push({
                    id: `custom-${idx}-${Date.now()}`,
                    key: field,
                    value: String(existingValue),
                    isPipelineConfigured: true
                });
            });
        } else {
            // Arbitrary custom fields allowed
            Object.entries(existingData).forEach(([k, v], idx) => {
                entries.push({
                    id: `adhoc-${idx}-${Date.now()}`,
                    key: k,
                    value: String(v || ''),
                    isPipelineConfigured: false
                });
            });
        }

        setEditAdditionalData(entries);
        setValidationError('');
        setIsEditingContact(true);
    };

    const handleCancelEditContact = () => {
        setIsEditingContact(false);
        setValidationError('');
    };

    const handleAddAdditionalField = () => {
        setEditAdditionalData(prev => [
            ...prev,
            { id: `new-${Date.now()}-${Math.random()}`, key: '', value: '', isPipelineConfigured: false }
        ]);
    };

    const handleRemoveAdditionalField = (idx) => {
        setEditAdditionalData(prev => prev.filter((_, i) => i !== idx));
    };

    const handleUpdateAdditionalKey = (idx, newKey) => {
        setEditAdditionalData(prev => prev.map((item, i) => i === idx ? { ...item, key: newKey } : item));
    };

    const handleUpdateAdditionalValue = (idx, newValue) => {
        setEditAdditionalData(prev => prev.map((item, i) => i === idx ? { ...item, value: newValue } : item));
    };

    const handleSaveEditContact = async () => {
        if (!editForm.name?.trim()) {
            setValidationError("Name is required.");
            return;
        }
        if (!editForm.email?.trim() && !editForm.phone?.trim()) {
            setValidationError("Either Email Address or Phone Number must be provided.");
            return;
        }

        setIsSavingContact(true);
        setValidationError('');

        try {
            const additionalDataObj = {};
            editAdditionalData.forEach(item => {
                const cleanKey = item.key?.trim()?.replace(/\s+/g, '_')?.toLowerCase();
                if (cleanKey) {
                    additionalDataObj[cleanKey] = item.value?.trim() || '';
                }
            });

            const payload = {
                name: editForm.name.trim(),
                email: editForm.email.trim() || null,
                phone: editForm.phone.trim() || null,
                source: editForm.source.trim() || null,
                additional_data: additionalDataObj,
            };

            const response = await axios.patch(`/api/contacts/${localDeal.raw.contact}/`, payload);
            
            const updatedRaw = {
                ...localDeal.raw,
                contact_details: response.data
            };
            const transformed = {
                ...localDeal,
                name: response.data.name || "Unknown",
                email: response.data.email || "No Email",
                phone: response.data.phone || "No Phone",
                status: response.data.status || "Lead",
                raw: updatedRaw,
            };

            setLocalDeal(transformed);
            setIsEditingContact(false);
            if (onUpdate) {
                onUpdate(transformed);
            }
        } catch (err) {
            console.error("Failed to update contact:", err);
            setValidationError(err.response?.data?.detail || err.message || "Failed to update contact.");
        } finally {
            setIsSavingContact(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const getAssignedUserName = () => {
        if (localDeal?.assigned_user_details) {
            return `${localDeal.assigned_user_details.first_name || ''} ${localDeal.assigned_user_details.last_name || ''}`.trim() || localDeal.assigned_user_details.email;
        }
        return 'Not Assigned';
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        if (!paymentAmount || Number(paymentAmount) <= 0) {
            setPaymentError("Please enter a valid amount.");
            return;
        }
        if (!paymentFor.trim()) {
            setPaymentError("Please enter payment description.");
            return;
        }

        setIsSubmittingPayment(true);
        setPaymentError('');

        try {
            const payload = {
                contact: localDeal.raw.contact_details.id,
                amount: paymentAmount,
                payment_for: paymentFor.trim(),
                payment_method: paymentMethod,
            };
            if (localDeal.id) {
                payload.crm = localDeal.id;
            }
            if (paymentRemarks.trim()) {
                payload.remarks = paymentRemarks.trim();
            }
            if (paymentInvoice.trim()) {
                payload.invoice = paymentInvoice.trim();
            }

            await axios.post('/api/payments/', payload);

            // Reset form
            setPaymentAmount('');
            setPaymentFor('');
            setPaymentRemarks('');
            setPaymentMethod('UPI');
            setPaymentInvoice('');

            await fetchPayments();
            await fetchLogs();
        } catch (err) {
            console.error("Failed to save payment:", err);
            setPaymentError(err.response?.data?.detail || err.message || "Failed to add payment.");
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const totalPaymentsSum = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-zinc-900 bg-white/[0.01] shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold shrink-0">
                                {(isEditingContact ? editForm.name : localDeal?.name)?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                {isEditingContact ? (
                                    <input 
                                        type="text" 
                                        value={editForm.name} 
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Contact Name"
                                        className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-white uppercase tracking-wider font-semibold focus:border-blue-500/50 outline-none w-full"
                                    />
                                ) : (
                                    <h2 className="text-base font-semibold text-white uppercase tracking-wider truncate">{localDeal?.name || 'Unknown Deal'}</h2>
                                )}
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-[0.15em]", STATUS_STYLES[localDeal?.status] || STATUS_STYLES.Lead)}>
                                        {localDeal?.status}
                                    </span>
                                    <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-[0.15em]", PRIORITY_STYLES[localDeal?.priority] || PRIORITY_STYLES.Medium)}>
                                        {localDeal?.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            {/* Tab Switcher */}
                            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80 shrink-0">
                                {[
                                    { id: 'profile', label: 'Profile', icon: User },
                                    { id: 'payments', label: 'Payments', icon: Wallet },
                                    { id: 'activity', label: 'Activity', icon: Clock },
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setIsEditingContact(false);
                                            }}
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
                    </div>
                </div>

                {/* Body - Columns Layout */}
                <div className="overflow-hidden p-8 flex-1 min-h-0 flex flex-col">
                    <div className="flex relative flex-1 min-h-0">
                        
                        {/* Left Column: Fixed Primary Contact Details */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-6">
                            <div className="space-y-6 pb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <User size={14} className="text-blue-400" />
                                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 font-semibold">Primary Contact</p>
                                    </div>
                                    {validationError && (
                                        <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-medium uppercase tracking-wider rounded">
                                            {validationError}
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <Field 
                                            icon={Mail} label="Email Address" value={localDeal?.email} 
                                            isEditing={isEditingContact}
                                        >
                                            <input 
                                                type="email" 
                                                value={editForm.email} 
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                placeholder="email@example.com"
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 mt-1"
                                            />
                                        </Field>

                                        <Field 
                                            icon={Phone} label="Phone Number" value={localDeal?.phone} 
                                            isEditing={isEditingContact}
                                        >
                                            <input 
                                                type="text" 
                                                value={editForm.phone} 
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                placeholder="+1 234 567 890"
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 mt-1"
                                            />
                                        </Field>

                                        <Field 
                                            icon={Tag} label="Lead Source" value={localDeal?.raw?.contact_details?.source} 
                                            isEditing={isEditingContact}
                                        >
                                            <input 
                                                type="text" 
                                                value={editForm.source} 
                                                onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                                                placeholder="e.g., Cold Email, Website, Referral"
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 mt-1"
                                            />
                                        </Field>

                                        <Field 
                                            icon={Wallet} 
                                            label="Deal Value" 
                                            value={`₹ ${totalPaymentsSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
                                            colorClass="text-emerald-400" 
                                        />
                                        <Field icon={Calendar} label="Date Created" value={formatDate(localDeal?.raw?.created_at)} />
                                    </div>
                                </div>

                                {/* Assigned User Section */}
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users size={14} className="text-purple-400" />
                                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 font-semibold">Assigned To</p>
                                    </div>
                                    {isEditingUser ? (
                                        <div className="space-y-3">
                                            {/* Custom Dropdown */}
                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md px-4 py-2.5 text-[10px] font-medium uppercase tracking-widest text-white flex items-center justify-between hover:border-zinc-700 transition-colors focus:outline-none focus:border-blue-500/50"
                                                >
                                                    <span className="truncate">
                                                        {selectedUserId 
                                                            ? eligibleUsers.find(u => u.id === selectedUserId)?.first_name 
                                                                ? `${eligibleUsers.find(u => u.id === selectedUserId).first_name} ${eligibleUsers.find(u => u.id === selectedUserId).last_name || ''}`
                                                                : eligibleUsers.find(u => u.id === selectedUserId)?.email
                                                            : '-- Unassigned --'}
                                                    </span>
                                                    <ChevronDown size={14} className={cn("text-white/20 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                                                </button>

                                                {isDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl z-[1101] max-h-48 overflow-y-auto custom-scrollbar p-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUserId(null);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={cn(
                                                                "w-full text-left px-3 py-2 rounded text-[10px] font-medium uppercase tracking-wider transition-colors flex items-center justify-between",
                                                                !selectedUserId ? "bg-blue-500/10 text-blue-400" : "text-white/60 hover:bg-white/5"
                                                            )}
                                                        >
                                                            -- Unassigned --
                                                            {!selectedUserId && <Check size={12} />}
                                                        </button>
                                                        {eligibleUsers.map(user => (
                                                            <button
                                                                key={user.id}
                                                                onClick={() => {
                                                                    setSelectedUserId(user.id);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2 rounded text-[10px] font-medium uppercase tracking-wider transition-colors flex items-center justify-between mt-0.5",
                                                                    selectedUserId === user.id ? "bg-blue-500/10 text-blue-400" : "text-white/60 hover:bg-white/5"
                                                                )}
                                                            >
                                                                <span className="truncate">
                                                                    {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}
                                                                </span>
                                                                {selectedUserId === user.id && <Check size={12} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={handleSaveUser}
                                                    disabled={isSaving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer"
                                                >
                                                    {isSaving ? <Clock size={12} className="animate-spin" /> : <Save size={12} />}
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingUser(false);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-white/[0.01] border border-zinc-900 flex items-center justify-between hover:bg-white/[0.02] transition-colors min-w-0 group relative">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                                    <User size={12} className="text-white/40" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] text-white uppercase tracking-wider font-semibold truncate">{getAssignedUserName()}</p>
                                                    {localDeal?.assigned_user_details?.email && (
                                                        <div className="flex items-center gap-1.5 mt-1.5 opacity-100 transition-all duration-200">
                                                            <Mail size={8} className="text-blue-400 shrink-0" />
                                                            <span className="text-[9px] text-white/50 tracking-wider truncate">{localDeal.assigned_user_details.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsEditingUser(true)}
                                                disabled={user?.role === 'Staff'}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-sm border text-[9px] font-medium uppercase tracking-[0.15em] transition-all self-start",
                                                    user?.role === 'Staff' 
                                                        ? "bg-zinc-950 border-zinc-900 text-white/20 cursor-not-allowed"
                                                        : "bg-zinc-900/50 border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 cursor-pointer"
                                                )}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                    {error && (
                                        <p className="mt-2 text-[9px] text-red-500 font-medium uppercase tracking-wider">{error}</p>
                                    )}
                                </div>

                                {localDeal?.raw?.notes && (
                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText size={14} className="text-amber-400" />
                                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 font-semibold">Intelligence / Notes</p>
                                        </div>
                                        <div className="p-5 rounded-lg bg-white/[0.01] border border-zinc-900">
                                            <p className="text-xs text-white/50 leading-relaxed italic uppercase tracking-wider font-medium">
                                                "{localDeal.raw.notes}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vertical Separator */}
                        <div className="w-px bg-zinc-900 self-stretch shrink-0 pointer-events-none" />

                        {/* Right Column: Tabbed Content (Profile/Registry, Payments [Pay/Ledger], Activity) */}
                        <div className="flex-1 pl-6 overflow-hidden flex flex-col">
                            {activeTab === 'profile' ? (
                                <div className="flex flex-col h-full pb-4">
                                    {/* Top 70% */}
                                    <div className="flex-[7] min-h-0 overflow-y-auto custom-scrollbar pr-6 space-y-6 pb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Database size={14} className="text-purple-400" />
                                                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 font-semibold">Additional Registry</p>
                                            </div>
                                            {isEditingContact ? (
                                                <div className="space-y-3 pb-4">
                                                    {editAdditionalData.map((item, idx) => (
                                                        <div key={item.id} className="flex items-center gap-2">
                                                            <input 
                                                                type="text" 
                                                                value={item.key} 
                                                                onChange={(e) => handleUpdateAdditionalKey(idx, e.target.value)} 
                                                                placeholder="Field Name"
                                                                disabled={item.isPipelineConfigured}
                                                                className={cn(
                                                                    "flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white font-medium uppercase tracking-wider outline-none focus:border-blue-500/50",
                                                                    item.isPipelineConfigured && "opacity-60 cursor-not-allowed border-zinc-900/50 bg-zinc-950/20"
                                                                )}
                                                            />
                                                            <input 
                                                                type="text" 
                                                                value={item.value} 
                                                                onChange={(e) => handleUpdateAdditionalValue(idx, e.target.value)} 
                                                                placeholder="Value"
                                                                className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white font-medium outline-none focus:border-blue-500/50"
                                                            />
                                                            {!item.isPipelineConfigured && (
                                                                <button 
                                                                    onClick={() => handleRemoveAdditionalField(idx)}
                                                                    className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0 cursor-pointer"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {!customFieldsEnabled && (
                                                        <button
                                                            onClick={handleAddAdditionalField}
                                                            className="w-full py-2 rounded-sm border border-dashed border-zinc-800 hover:border-zinc-700 text-white/40 hover:text-white/60 text-[9px] font-medium uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                                                        >
                                                            <Plus size={11} /> Add Field
                                                        </button>
                                                    )}
                                                </div>
                                            ) : displayEntries.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-3 pb-4">
                                                    {displayEntries.map(([key, value]) => (
                                                        <div key={key} className="px-4 py-3.5 rounded-lg bg-white/[0.01] border border-zinc-900 flex items-center justify-between group hover:bg-white/[0.02] transition-all duration-300">
                                                            <span className="text-[9px] font-medium text-white/30 uppercase tracking-[0.15em]">{key.replace(/_/g, ' ')}</span>
                                                            <span className="text-[10px] text-white uppercase tracking-wider font-semibold">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="min-h-[250px] rounded-lg border border-dashed border-zinc-900 flex flex-col items-center justify-center gap-3 bg-white/[0.005]">
                                                    <Database size={18} className="text-white/5" />
                                                    <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No Extended Data</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom 30% - Current Updates (Remarks) */}
                                    <div className="flex-[3] min-h-[30%] shrink-0 border-t border-zinc-900 pt-4 flex flex-col mr-6">
                                        <div className="flex items-center gap-2 mb-3 shrink-0">
                                            <MessageSquare size={14} className="text-pink-400" />
                                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Current Update</p>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center mb-3 pr-2">
                                            {isLoadingRemarks ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Loader2 size={16} className="animate-spin text-white/20" />
                                                </div>
                                            ) : remarks.length > 0 ? (
                                                <div className="bg-zinc-950/50 border border-zinc-900 rounded-md p-4 flex flex-col justify-between h-full relative group">
                                                    {isEditingRemark ? (
                                                        <textarea
                                                            autoFocus
                                                            value={newRemarkText}
                                                            onChange={(e) => setNewRemarkText(e.target.value)}
                                                            placeholder="Update current status..."
                                                            className="flex-1 w-full bg-zinc-900/50 border border-zinc-800 rounded px-2 py-1.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-colors resize-none custom-scrollbar min-h-[60px]"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleAddRemark(e);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="text-[12px] text-white/90 leading-relaxed break-words line-clamp-3 pr-6">{remarks[0].text}</p>
                                                    )}
                                                    
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            if (isEditingRemark) {
                                                                handleAddRemark(e);
                                                            } else {
                                                                setNewRemarkText(remarks[0].text);
                                                                setIsEditingRemark(true);
                                                            }
                                                        }}
                                                        disabled={isSubmittingRemark}
                                                        className="absolute top-3 right-3 p-1.5 rounded bg-zinc-900 border border-zinc-800 text-white/40 hover:text-white hover:border-zinc-700 transition-all opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-50"
                                                    >
                                                        {isSubmittingRemark ? <Loader2 size={12} className="animate-spin" /> : isEditingRemark ? <Check size={12} className="text-pink-400" /> : <TbEdit size={12} />}
                                                    </button>

                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 shrink-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[9px] font-mono text-white/50 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded leading-none">
                                                                {remarks[0].user_details 
                                                                    ? `${remarks[0].user_details.first_name || ''} ${remarks[0].user_details.last_name || ''}`.trim() || remarks[0].user_details.email
                                                                    : 'System'
                                                                }
                                                            </span>
                                                        </div>
                                                        <span className="text-[9px] font-mono text-white/30 uppercase">
                                                            {new Date(remarks[0].created_at).toLocaleDateString()} • {new Date(remarks[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 rounded-lg border border-dashed border-zinc-900 flex flex-col items-center justify-center gap-3 bg-white/[0.005]">
                                                    <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No recent updates</p>
                                                    {isEditingRemark ? (
                                                        <div className="w-full px-4 flex gap-2">
                                                            <input 
                                                                autoFocus
                                                                type="text"
                                                                value={newRemarkText}
                                                                onChange={(e) => setNewRemarkText(e.target.value)}
                                                                placeholder="Add an update..."
                                                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-colors"
                                                                onKeyDown={(e) => e.key === 'Enter' && handleAddRemark(e)}
                                                            />
                                                            <button 
                                                                onClick={handleAddRemark}
                                                                disabled={!newRemarkText.trim() || isSubmittingRemark}
                                                                className="px-3 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                                                            >
                                                                {isSubmittingRemark ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setIsEditingRemark(true)}
                                                            className="px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 text-white/40 hover:text-white text-[9px] uppercase tracking-wider font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <Plus size={10} /> Add Update
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'payments' ? (
                                <div className="space-y-4 pb-4 h-full flex flex-col">
                                    {/* Sub-tab Bar */}
                                    <div className="flex border-b border-zinc-900 pb-2 shrink-0 gap-2">
                                        <button
                                            onClick={() => setPaymentSubTab('pay')}
                                            className={cn(
                                                "px-3.5 py-1.5 text-[9px] font-medium uppercase transition-all rounded border font-mono cursor-pointer",
                                                paymentSubTab === 'pay' 
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                                    : "bg-zinc-950/20 border-zinc-900 text-white/40 hover:text-white/60"
                                            )}
                                        >
                                            Record Payment
                                        </button>
                                        <button
                                            onClick={() => setPaymentSubTab('ledger')}
                                            className={cn(
                                                "px-3.5 py-1.5 text-[9px] font-medium uppercase transition-all rounded border font-mono cursor-pointer",
                                                paymentSubTab === 'ledger' 
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                                    : "bg-zinc-950/20 border-zinc-900 text-white/40 hover:text-white/60"
                                            )}
                                        >
                                            Ledger ({payments.length})
                                        </button>
                                    </div>

                                    {/* Sub-tab Content */}
                                    {paymentSubTab === 'pay' ? (
                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 mt-2 pb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Plus size={14} className="text-emerald-400" />
                                                <h3 className="text-[10px] font-semibold text-white uppercase tracking-widest">New Payment</h3>
                                            </div>

                                            <form onSubmit={handleAddPayment} className="space-y-4">
                                                {paymentError && (
                                                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-wider font-semibold font-mono">
                                                        {paymentError}
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Amount (INR)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[11px] font-semibold">₹</span>
                                                        <input 
                                                            type="number"
                                                            required
                                                            min="1"
                                                            placeholder="0"
                                                            value={paymentAmount}
                                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                                            className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-7 py-2 text-xs text-white placeholder-white/10 outline-none focus:border-emerald-500/50 font-semibold font-mono"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Payment For</label>
                                                    <input 
                                                        type="text"
                                                        required
                                                        placeholder="e.g. Licensing Fee, Initial Setup"
                                                        value={paymentFor}
                                                        onChange={(e) => setPaymentFor(e.target.value)}
                                                        className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/15 outline-none focus:border-emerald-500/50"
                                                    />
                                                </div>

                                                <div className="relative" ref={paymentMethodDropdownRef}>
                                                    <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Payment Method</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsPaymentMethodDropdownOpen(!isPaymentMethodDropdownOpen)}
                                                        className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 flex items-center justify-between cursor-pointer font-mono select-none"
                                                    >
                                                        <span className="text-white/80 font-medium uppercase tracking-wider">{paymentMethod}</span>
                                                        <ChevronDown 
                                                            size={12} 
                                                            className={cn(
                                                                "text-white/30 transition-transform duration-200",
                                                                isPaymentMethodDropdownOpen && "rotate-180 text-emerald-400"
                                                            )} 
                                                        />
                                                    </button>
                                                    
                                                    {isPaymentMethodDropdownOpen && (
                                                        <div className="absolute left-0 right-0 mt-1.5 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl z-[100] overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                            {[
                                                                'UPI',
                                                                'Bank Transfer',
                                                                'Cash',
                                                                'Card',
                                                                'Net Banking',
                                                                'Other'
                                                            ].map(method => {
                                                                const isSelected = paymentMethod === method;
                                                                return (
                                                                    <button
                                                                        key={method}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setPaymentMethod(method);
                                                                            setIsPaymentMethodDropdownOpen(false);
                                                                        }}
                                                                        className={cn(
                                                                            "w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors text-left font-mono",
                                                                            isSelected 
                                                                                ? "bg-emerald-500/10 text-emerald-400 font-semibold" 
                                                                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                                                        )}
                                                                    >
                                                                        <span className="uppercase tracking-wider">{method}</span>
                                                                        {isSelected && <Check size={11} className="text-emerald-400" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Remarks (Optional)</label>
                                                    <textarea 
                                                        placeholder="References, remarks, transaction ID..."
                                                        value={paymentRemarks}
                                                        onChange={(e) => setPaymentRemarks(e.target.value)}
                                                        className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/15 outline-none focus:border-emerald-500/50 min-h-[60px] resize-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[8px] text-white/35 uppercase tracking-widest font-mono font-semibold mb-1.5">Invoice Number (Optional)</label>
                                                    <input 
                                                        type="text"
                                                        placeholder="e.g. INV-2026-001"
                                                        value={paymentInvoice}
                                                        onChange={(e) => setPaymentInvoice(e.target.value)}
                                                        className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-white/15 outline-none focus:border-emerald-500/50 font-mono"
                                                    />
                                                </div>

                                                <button 
                                                    type="submit"
                                                    disabled={isSubmittingPayment}
                                                    className="w-full py-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[9px] font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                                                >
                                                    {isSubmittingPayment ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={12} />} Record
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="flex-1 space-y-4 mt-2 flex flex-col overflow-hidden">
                                            <div className="flex items-center justify-between shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <Wallet size={14} className="text-emerald-400" />
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Ledger Entries</p>
                                                </div>
                                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider">{payments.length} Registered</span>
                                            </div>

                                            {isLoadingPayments ? (
                                                <div className="flex-1 flex items-center justify-center min-h-[250px]">
                                                    <Loader2 className="animate-spin text-emerald-400" size={20} />
                                                </div>
                                            ) : payments.length > 0 ? (
                                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                                                    <div className="space-y-2">
                                                    {payments.map(payment => {
                                                        const isExpanded = !!expandedPayments[payment.id];
                                                        return (
                                                            <div 
                                                                key={payment.id} 
                                                                className={cn(
                                                                    "border transition-all duration-300 rounded-md",
                                                                    isExpanded 
                                                                        ? "border-emerald-500/30 bg-emerald-500/[0.02] shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                                                                        : "border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/10"
                                                                )}
                                                            >
                                                                {/* Summary Header */}
                                                                <div 
                                                                    onClick={() => togglePaymentExpand(payment.id)}
                                                                    className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                                                                >
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <div className="text-[9px] font-mono text-white/30 shrink-0">
                                                                            {new Date(payment.created_at).toLocaleDateString()}
                                                                        </div>
                                                                        <div className="truncate">
                                                                            <p className="text-[10px] text-white font-semibold uppercase tracking-wider truncate">
                                                                                {payment.payment_for}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 shrink-0">
                                                                        <span className="text-[7.5px] px-1.5 py-0.5 rounded-sm border border-zinc-900 bg-zinc-950/60 text-white/40 uppercase tracking-wider font-mono">
                                                                            {payment.payment_method}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-emerald-400 font-mono">
                                                                            ₹{parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                        <ChevronDown 
                                                                            size={12} 
                                                                            className={cn(
                                                                                "text-white/30 transition-transform duration-300",
                                                                                isExpanded && "rotate-180 text-emerald-400"
                                                                            )} 
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Expandable Details Area */}
                                                                <div 
                                                                    className={cn(
                                                                        "grid transition-all duration-300 ease-in-out",
                                                                        isExpanded ? "grid-rows-[1fr] opacity-100 border-t border-zinc-900/50" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                                                                    )}
                                                                >
                                                                    <div className="overflow-hidden">
                                                                        <div className="p-4 space-y-3.5 text-[9px] text-white/50 uppercase tracking-wider">
                                                                            {payment.remarks ? (
                                                                                <div className="space-y-1">
                                                                                    <span className="text-[7.5px] text-white/20 font-mono tracking-widest block">Remarks / Notes</span>
                                                                                    <p className="text-[9.5px] text-white/70 italic leading-relaxed font-sans normal-case">
                                                                                        {payment.remarks}
                                                                                    </p>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="space-y-1">
                                                                                    <span className="text-[7.5px] text-white/20 font-mono tracking-widest block">Remarks / Notes</span>
                                                                                    <p className="text-[9.5px] text-white/25 italic leading-relaxed font-sans normal-case">
                                                                                        No additional remarks registered.
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                                                <div className="flex gap-4">
                                                                                    <div>
                                                                                        <span className="text-[7.5px] text-white/20 font-mono block leading-none mb-1">Transaction ID</span>
                                                                                        <span className="text-[8.5px] text-white/40 font-mono font-medium">#{payment.id.toString().slice(0, 8)}...</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-[7.5px] text-white/20 font-mono block leading-none mb-1">Invoice Number</span>
                                                                                        {payment.invoice ? (
                                                                                            <span className="text-[8.5px] text-white/70 font-mono font-medium">{payment.invoice}</span>
                                                                                        ) : (
                                                                                            <span className="text-[8.5px] text-white/25 font-mono">—</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-[7.5px] text-white/20 font-mono block leading-none mb-1">Recorded By</span>
                                                                                        {payment.recorded_by_details ? (
                                                                                            <span className="text-[8.5px] text-white/70 font-mono font-medium">
                                                                                                {payment.recorded_by_details.first_name 
                                                                                                    ? `${payment.recorded_by_details.first_name} ${payment.recorded_by_details.last_name || ''}`.trim() 
                                                                                                    : payment.recorded_by_details.email}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-[8.5px] text-white/25 font-mono">System</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 min-h-[250px] rounded-lg border border-dashed border-zinc-900 flex flex-col items-center justify-center gap-3 bg-white/[0.005]">
                                                    <Wallet size={20} className="text-white/5" />
                                                    <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No payments recorded yet</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-[300px] mt-2 overflow-hidden">
                                    <div className="flex items-center gap-2 mb-4 shrink-0">
                                        <Clock size={14} className="text-white/40" />
                                        <h3 className="text-[10px] font-semibold text-white uppercase tracking-widest">Activity History</h3>
                                    </div>

                                    {isLoadingLogs ? (
                                        <div className="flex-1 flex items-center justify-center min-h-[250px]">
                                            <Loader2 className="w-5 h-5 animate-spin text-white/20" />
                                        </div>
                                    ) : logs && logs.length > 0 ? (
                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                                            <div className="relative pl-5 border-l border-zinc-900 space-y-6 py-2 ml-2">
                                                {logs.map((log) => {
                                                    const date = new Date(log.created_at);
                                                    const formattedDate = date.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    });
                                                    const formattedTime = date.toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    });

                                                    return (
                                                        <div key={log.id} className="relative group">
                                                            {/* Timeline node */}
                                                            <div className={cn("absolute -left-[25px] top-1 w-2 h-2 rounded-full border transition-colors",
                                                                log.activity_type === 'Pipeline Changed'
                                                                    ? "bg-amber-500/40 border-amber-500/60"
                                                                    : "bg-zinc-950 border-zinc-800 group-hover:border-emerald-500/50"
                                                            )} />

                                                            <div className={cn("flex flex-col space-y-1.5 rounded p-3.5 transition-all duration-300",
                                                                log.activity_type === 'Pipeline Changed'
                                                                    ? "bg-amber-500/[0.06] border border-amber-500/20 hover:bg-amber-500/[0.1] hover:border-amber-500/30"
                                                                    : "bg-white/[0.04] border border-zinc-800 hover:bg-white/[0.06] hover:border-zinc-700"
                                                            )}>
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <span className="text-[9.5px] font-semibold text-white/90 uppercase tracking-wide leading-relaxed">
                                                                        {log.description}
                                                                    </span>
                                                                    <span className="text-[8px] font-mono text-white/30 uppercase shrink-0 mt-0.5">
                                                                        {formattedDate} • {formattedTime}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center justify-end pt-2 border-t border-white/5">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-widest">Actor</span>
                                                                        <span className="text-[8.5px] font-mono text-white/70 bg-zinc-900 border border-zinc-700 px-2.5 py-1 leading-none">
                                                                            {log.user_details 
                                                                                ? `${log.user_details.first_name || ''} ${log.user_details.last_name || ''}`.trim() || log.user_details.email
                                                                                : 'System'
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[250px] rounded-lg border border-dashed border-zinc-900 bg-white/[0.005]">
                                            <Clock size={20} className="text-white/5" />
                                            <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.15em]">No activity logs recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-zinc-900 bg-white/[0.005] flex items-center justify-between shrink-0 gap-3">
                    {/* Bottom Left Actions */}
                    <div className="flex items-center gap-2">
                        {!isEditingContact && activeTab === 'profile' && (
                            <>
                                <button 
                                    onClick={handleStartEditContact}
                                    className="h-9 w-9 rounded bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer"
                                    title="Edit Profile"
                                >
                                    <TbEdit size={15} />
                                </button>
                                <button 
                                    onClick={() => onDelete?.(deal)}
                                    className="h-9 w-9 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 transition-all flex items-center justify-center cursor-pointer"
                                    title="Delete Lead"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                        {isEditingContact && activeTab === 'profile' && (
                            <>
                                <button 
                                    onClick={handleSaveEditContact}
                                    disabled={isSavingContact}
                                    className="px-5 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    {isSavingContact ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                                </button>
                                <button 
                                    onClick={handleCancelEditContact}
                                    className="px-5 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>

                    <button 
                        onClick={onClose}
                        className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DealDetailsDialog;
