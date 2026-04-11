import React, { useState } from 'react';
import { Upload, Search } from 'lucide-react';
import Button from '@/components/Button';
import ImportModal from '../components/ImportModal';
import ContactsTable from '../components/tabs/ContactsTable';
import ImportsTab from '../components/tabs/ImportsTab';
import { cn } from '@/lib/utils';

const TABS = { CONTACTS: 'contacts', IMPORTS: 'imports' };

const Contacts = () => {
    const [activeTab, setActiveTab] = useState(TABS.CONTACTS);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const handleImportSuccess = () => {
        setIsImportModalOpen(false);
        setActiveTab(TABS.IMPORTS);
        setRefreshKey(k => k + 1);
    };

    return (
        <div className="flex flex-col bg-black h-full">
            <header className="px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-semibold text-white">Contacts</h1>
                    <p className="text-sm text-white/40">Your customer repository</p>
                </div>
                <Button
                    variant="secondary"
                    className="!w-auto h-9 px-4 border-white/5 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium"
                    onClick={() => setIsImportModalOpen(true)}
                >
                    <Upload size={14} className="mr-2 opacity-50" />
                    Import
                </Button>
            </header>

            <main className="flex-1 px-10 pt-5 pb-10 relative z-10 overflow-hidden flex flex-col gap-4 min-h-0">
                {/* Tabs + Search */}
                <div className="flex items-center border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-1">
                        {[TABS.CONTACTS, TABS.IMPORTS].map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setSelectedBatch(null); setSearchQuery(''); }}
                                className={cn(
                                    "px-4 py-2.5 text-sm capitalize transition-all border-b-2 -mb-px",
                                    activeTab === tab
                                        ? "text-white border-blue-500 font-medium"
                                        : "text-white/30 border-transparent hover:text-white/60"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {activeTab === TABS.CONTACTS && (
                        <div className="ml-auto relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={13} />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 h-8 w-52 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-all"
                            />
                        </div>
                    )}
                </div>

                {activeTab === TABS.CONTACTS && (
                    <ContactsTable key={refreshKey} searchQuery={searchQuery} />
                )}
                {activeTab === TABS.IMPORTS && !selectedBatch && (
                    <ImportsTab key={refreshKey} onViewBatch={(batch) => setSelectedBatch(batch)} />
                )}
                {activeTab === TABS.IMPORTS && selectedBatch && (
                    <ContactsTable
                        batchId={selectedBatch.id}
                        batchName={selectedBatch.name}
                        onBack={() => setSelectedBatch(null)}
                        searchQuery={searchQuery}
                    />
                )}
            </main>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default Contacts;
