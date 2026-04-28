import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Search, Rocket } from 'lucide-react';
import Button from '@/components/Button';
import ImportModal from '../components/ImportModal';
import ContactsTable from '../components/tabs/ContactsTable';
import ImportsTab from '../components/tabs/ImportsTab';
import { cn } from '@/lib/utils';
import RingLoader from '@/components/ui/RingLoader';
import AddToCRMModal from '../components/AddToCRMModal';

const TABS = { CONTACTS: 'contacts', IMPORTS: 'imports' };

const Contacts = () => {
    const [activeTab, setActiveTab] = useState(TABS.CONTACTS);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isAddToCRMModalOpen, setIsAddToCRMModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedIds, setSelectedIds] = useState([]);
    const [isAddingToCRM, setIsAddingToCRM] = useState(false);

    const handleImportSuccess = () => {
        setIsImportModalOpen(false);
        setActiveTab(TABS.IMPORTS);
        setRefreshKey(k => k + 1);
    };

    const handleAddToCRM = async (pipelineId) => {
        if (selectedIds.length === 0) return;
        setIsAddingToCRM(true);
        try {
            const promises = selectedIds.map(id => 
                axios.post('/api/crm/pipeline/', { 
                    contact: id, 
                    stage: 'lead',
                    pipeline: pipelineId
                })
            );
            await Promise.all(promises);
            setSelectedIds([]);
            // alert(`Successfully added ${selectedIds.length} contacts to CRM pipeline.`);
        } catch (err) {
            console.error('Failed to add to CRM:', err);
            alert('Failed to add some contacts to CRM.');
        } finally {
            setIsAddingToCRM(false);
        }
    };

    return (
        <div className="flex flex-col bg-black h-full">
            <header className="px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-semibold text-white">Contacts</h1>
                    <p className="text-sm text-white/40">Your customer repository</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && activeTab === TABS.CONTACTS && (
                        <Button
                            variant="secondary"
                            className="!w-auto h-9 px-4 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold"
                            onClick={() => setIsAddToCRMModalOpen(true)}
                            disabled={isAddingToCRM}
                        >
                            {isAddingToCRM ? <RingLoader size="1.2em" className="mr-2" /> : <Rocket size={14} className="mr-2" />}
                            Add to CRM ({selectedIds.length})
                        </Button>
                    )}

                    <Button
                        variant="secondary"
                        className="!w-auto h-9 px-4 border-white/5 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium"
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <Upload size={14} className="mr-2 opacity-50" />
                        Import
                    </Button>
                </div>
            </header>

            <main className="flex-1 px-10 pt-5 pb-10 relative z-10 overflow-hidden flex flex-col gap-4 min-h-0">
                <div className="flex items-center border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-1">
                        {[TABS.CONTACTS, TABS.IMPORTS].map(tab => (
                            <button
                                key={tab}
                                onClick={() => { 
                                    setActiveTab(tab); 
                                    setSelectedBatch(null); 
                                    setSearchQuery(''); 
                                    setSelectedIds([]);
                                }}
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
                    <ContactsTable 
                        key={refreshKey} 
                        searchQuery={searchQuery} 
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                    />
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
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                    />
                )}
            </main>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={handleImportSuccess}
            />

            <AddToCRMModal
                isOpen={isAddToCRMModalOpen}
                onClose={() => setIsAddToCRMModalOpen(false)}
                contactCount={selectedIds.length}
                onConfirm={handleAddToCRM}
            />
        </div>
    );
};

export default Contacts;
