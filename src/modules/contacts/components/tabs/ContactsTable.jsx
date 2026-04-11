import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Users, Mail, Phone, Eye, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ContactsTable = ({ batchId = null, batchName = null, onBack = null, searchQuery = '' }) => {
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 100;
    const listRef = useRef(null);

    const fetchContacts = useCallback(async (page = 1, search = '') => {
        try {
            setIsLoading(true);
            const params = { page, search };
            if (batchId) params.batch = batchId;
            const response = await axios.get('/api/contacts/', { params });
            setContacts(response.data.results);
            setTotalCount(response.data.count);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
        } finally {
            setIsLoading(false);
        }
    }, [batchId]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setCurrentPage(1);
            fetchContacts(1, searchQuery);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery, fetchContacts]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchContacts(newPage, searchQuery);
        listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4">
            {batchName && (
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{batchName}</span>
                    <span className="text-xs text-white/30">{totalCount} contacts</span>
                </div>
            )}

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800 shadow-xl relative flex flex-col min-h-0 flex-1">
                {isLoading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-blue-500" size={28} />
                            <span className="text-xs text-white/40">Syncing...</span>
                        </div>
                    </div>
                )}

                <div className="px-8 py-3 bg-zinc-900/20 border-b border-zinc-800 shrink-0">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-white/30">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Name</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-2">Phone</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>
                </div>

                {contacts.length === 0 && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                        <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/10 mb-4">
                            <Users size={28} />
                        </div>
                        <p className="text-sm text-white/20">No contacts found</p>
                    </div>
                ) : (
                    <div ref={listRef} className="divide-y divide-zinc-800 overflow-y-auto custom-scrollbar flex-1">
                        {contacts.map((contact, index) => (
                            <div key={contact.id} className="grid grid-cols-12 gap-4 px-8 py-3.5 hover:bg-white/[0.02] transition-colors items-center group cursor-pointer">
                                <div className="col-span-1 text-xs text-white/25">
                                    {(currentPage - 1) * pageSize + index + 1}
                                </div>
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:border-blue-500/20 group-hover:bg-blue-500/5 group-hover:text-blue-400 transition-all text-xs font-medium shrink-0">
                                        {contact.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-white group-hover:text-blue-400 transition-colors truncate">{contact.name}</span>
                                </div>
                                <div className="col-span-4 flex items-center gap-2 text-white/40">
                                    <Mail size={11} className="shrink-0" />
                                    <span className="text-xs truncate">{contact.email || '—'}</span>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 text-white/40">
                                    <Phone size={11} className="shrink-0" />
                                    <span className="text-xs truncate">{contact.phone || '—'}</span>
                                </div>
                                <div className="col-span-2 flex items-center justify-end gap-1">
                                    <button className="p-1.5 rounded-lg hover:bg-blue-500/10 text-white/20 hover:text-blue-400 transition-colors" title="View">
                                        <Eye size={14} />
                                    </button>
                                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors" title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="px-6 py-3 bg-white/[0.02] flex items-center justify-between shrink-0">
                    <p className="text-xs text-white/30">
                        Page {currentPage} of {Math.max(1, totalPages)}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button disabled={currentPage === 1 || isLoading} onClick={() => handlePageChange(currentPage - 1)}
                            className="p-2 rounded-xs bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all">
                            <ChevronLeft size={14} />
                        </button>
                        <div className="flex items-center gap-1 px-1">
                            {(() => {
                                const start = Math.max(1, currentPage - 2);
                                const end = Math.min(totalPages, currentPage + 2);
                                return [...Array(end - start + 1)].map((_, i) => {
                                    const pageNum = start + i;
                                    return (
                                        <button key={pageNum} onClick={() => handlePageChange(pageNum)}
                                            className={cn("w-8 h-8 rounded-xs text-xs transition-all",
                                                currentPage === pageNum ? "bg-white text-black font-semibold" : "text-white/40 hover:bg-white/5")}>
                                            {pageNum}
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                        <button disabled={currentPage === totalPages || totalPages === 0 || isLoading} onClick={() => handlePageChange(currentPage + 1)}
                            className="p-2 rounded-xs bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactsTable;
