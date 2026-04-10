import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Users,
    Upload,
    Plus,
    Search,
    MoreHorizontal,
    Mail,
    Phone,
    ArrowUpRight,
    TrendingUp,
    UserCheck,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ImportModal from '../components/ImportModal';
import { cn } from '@/lib/utils';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 20;

    const fetchContacts = useCallback(async (page = 1, search = '') => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/contacts/', {
                params: {
                    page: page,
                    search: search
                }
            });

            // DRF Pagination returns { count, next, previous, results }
            setContacts(response.data.results);
            setTotalCount(response.data.count);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const handler = setTimeout(() => {
            setCurrentPage(1); // Reset to page 1 on search
            fetchContacts(1, searchQuery);
        }, 400);

        return () => clearTimeout(handler);
    }, [searchQuery, fetchContacts]);

    // Handle page change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchContacts(newPage, searchQuery);
    };

    const stats = [
        { label: 'Total Database', value: totalCount, icon: Users, trend: '+12%', color: 'blue' },
        { label: 'Growth Rate', value: '18%', icon: TrendingUp, trend: '+5%', color: 'purple' },
        { label: 'Active Leads', value: '142', icon: UserPlus, trend: '+2%', color: 'green' },
        { label: 'Connectivity', value: '99%', icon: UserCheck, trend: 'Stable', color: 'amber' },
    ];

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="flex flex-col bg-black">
            {/* Header Section per DESIGN ARCHITECTURE (px-10 py-8) */}
            <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
                <div className="space-y-1">

                    <h1 className="text-3xl font-bold tracking-tight text-white">Contacts</h1>
                    <p className="text-sm text-white/40 font-medium">Your customer repository</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/40 transition-colors" size={16} />
                        <Input
                            type="text"
                            placeholder="Instant server search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64 h-10 bg-white/5 border-white/10 focus:border-white/20 transition-all text-xs"
                        />
                    </div>
                    <Button
                        variant="secondary"
                        className="!w-auto h-10 px-4 border-white/5 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-[0.15em] font-bold"
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <Upload size={14} className="mr-2 opacity-50" />
                        Import
                    </Button>
                    <Button variant="default" className="!w-auto h-10 px-6 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Plus size={14} className="mr-2" />
                        New Contact
                    </Button>
                </div>
            </header>

            {/* Main Content (p-10 space-y-10) */}
            <main className="flex-1 p-10 space-y-10 relative z-10 overflow-y-auto custom-scrollbar">

                {/* Contacts Container */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-4">
                            <h3 className="text-white">Active Repository</h3>
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/40">Showing {contacts.length} of {totalCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white/20">Sort by</span>
                            <select className="bg-transparent text-white/60 focus:outline-none cursor-pointer">
                                <option>Recent</option>
                                <option>A-Z</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800 shadow-xl relative min-h-[500px]">
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] z-50 flex items-center justify-center transition-all duration-500">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-blue-500" size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Syncing Repository...</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-zinc-900/20 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-zinc-800">
                            <div className="col-span-4">Contact Detail</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-3">Unique Identifier</div>
                            <div className="col-span-2 text-right">Registered</div>
                            <div className="col-span-1"></div>
                        </div>

                        {contacts.length === 0 && !isLoading ? (
                            <div className="py-40 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/5 mb-6"><Users size={32} /></div>
                                <p className="text-md font-bold text-white uppercase tracking-widest opacity-20">Repository Empty</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800">
                                {contacts.map((contact) => (
                                    <div key={contact.id} className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-white/[0.02] transition-colors items-center group cursor-pointer relative">
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:border-blue-500/20 group-hover:bg-blue-500/5 group-hover:text-blue-400 transition-all font-bold">
                                                {contact.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{contact.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5 opacity-40 group-hover:opacity-60 transition-opacity">
                                                    <Mail size={10} />
                                                    <span className="text-[10px] font-medium truncate">{contact.email || '—'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-2 flex justify-center">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                contact.status === 'Customer' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    contact.status === 'Lead' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                        "bg-white/5 text-white/40 border-white/10"
                                            )}>
                                                {contact.status}
                                            </span>
                                        </div>

                                        <div className="col-span-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-white/60 tracking-tight">{contact.contact_id || 'CON-9999'}</span>
                                                <div className="flex items-center gap-2 text-[10px] text-white/20 mt-0.5">
                                                    <Phone size={10} />
                                                    <span>{contact.phone || '—'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-right">
                                            <p className="text-[10px] font-bold text-white/40">
                                                {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'Just now'}
                                            </p>
                                        </div>

                                        <div className="col-span-1 text-right">
                                            <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-colors">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Modern Pagination Footer */}
                        <div className="px-6 py-4 bg-white/[0.02] flex items-center justify-between">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                Page {currentPage} of {Math.max(1, totalPages)}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1 || isLoading}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="p-2 rounded-lg bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all"
                                >
                                    <ChevronLeft size={14} />
                                </button>

                                <div className="flex items-center px-2 gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        const pageNum = i + 1; // Simplistic for now
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                                                    currentPage === pageNum ? "bg-white text-black" : "text-white/40 hover:bg-white/5"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="p-2 rounded-lg bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    setIsImportModalOpen(false);
                    fetchContacts(1, searchQuery); // Refresh on success
                }}
            />
        </div>
    );
};

export default Contacts;
