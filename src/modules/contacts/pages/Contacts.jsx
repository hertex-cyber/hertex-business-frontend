import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Search, Rocket, Plus, UserPlus, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Button from '@/components/Button';
import ImportModal from '../components/ImportModal';
import AddContactModal from '../components/AddContactModal';
import ContactsTable from '../components/tabs/ContactsTable';
import ImportsTab from '../components/tabs/ImportsTab';
import { cn } from '@/lib/utils';
import RingLoader from '@/components/ui/RingLoader';
import AddToCRMModal from '../components/AddToCRMModal';
import { useAuth } from '@/context/AuthContext';

const TABS = { CONTACTS: 'contacts', IMPORTS: 'imports' };

const Contacts = () => {
    const { user } = useAuth();
    const isAdmin = ["Superadmin", "Admin"].includes(user?.role) || user?.is_superuser;

    // Guard: reset to contacts tab if user is not an admin
    useEffect(() => {
        if (!isAdmin) {
            setActiveTab(TABS.CONTACTS);
        }
    }, [isAdmin]);

    const [activeTab, setActiveTab] = useState(TABS.CONTACTS);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
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

    const handleAddToCRM = async (pipelineId, stageId) => {
        if (selectedIds.length === 0 || !stageId) return;
        setIsAddingToCRM(true);
        try {
            const promises = selectedIds.map(id => 
                axios.post('/api/crm/pipeline/', { 
                    contact: id,
                    stage: stageId,
                    pipeline: pipelineId
                })
            );
            await Promise.all(promises);
            setSelectedIds([]);
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
            </header>

            <main className="flex-1 px-10 pt-5 pb-10 relative z-10 overflow-hidden flex flex-col gap-4 min-h-0">
                <div className="flex items-center justify-between shrink-0 pb-4">
                    <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
                        <div 
                            className={cn(
                                "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
                                activeTab === TABS.CONTACTS 
                                    ? "left-0 w-1/2 rounded-l rounded-r-none bg-blue-500/20" 
                                    : "left-1/2 w-1/2 rounded-r rounded-l-none bg-blue-500/20"
                            )}
                        />
                        {[TABS.CONTACTS, TABS.IMPORTS].map(tab => {
                            const isImportsTab = tab === TABS.IMPORTS;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        if (isImportsTab && !isAdmin) return;
                                        setActiveTab(tab); 
                                        setSelectedBatch(null); 
                                        setSearchQuery(''); 
                                        setSelectedIds([]);
                                    }}
                                    title={isImportsTab && !isAdmin ? "Only admins can access imports" : undefined}
                                    className={cn(
                                        "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                                        activeTab === tab ? "text-blue-400" : "text-white/50",
                                        isImportsTab && !isAdmin && "opacity-40 cursor-not-allowed",
                                        isImportsTab && isAdmin && !(activeTab === tab) && "hover:text-white/80",
                                        !isImportsTab && !(activeTab === tab) && "hover:text-white/80"
                                    )}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "relative overflow-hidden transition-all duration-300 ease-in-out",
                            activeTab === TABS.CONTACTS ? "w-52 opacity-100" : "w-0 opacity-0 pointer-events-none"
                        )}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={13} />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 h-8 w-52 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-all"
                            />
                        </div>
                        <div className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            selectedIds.length > 0 ? "max-w-[220px] mr-0" : "max-w-0 mr-0"
                        )}>
                            <div style={{
                                opacity: selectedIds.length > 0 ? 1 : 0,
                                transition: 'opacity 200ms ease-in-out',
                                transitionDelay: selectedIds.length > 0 ? '250ms' : '0ms',
                            }}>
                                <button
                                    onClick={() => setIsAddToCRMModalOpen(true)}
                                    disabled={isAddingToCRM}
                                    className="px-4 h-8 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-medium uppercase tracking-[0.2em] transition-all rounded-sm cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAddingToCRM ? <RingLoader size="1.2em" /> : <Rocket size={12} />}
                                    Add to CRM ({selectedIds.length})
                                </button>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="!h-8 px-3 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/60 hover:bg-white/10 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed" disabled={!isAdmin} title={!isAdmin ? "Only admins can import contacts" : undefined}>
                                <Plus size={12} className="opacity-60" />
                                Add
                                <ChevronDown size={10} className="opacity-40" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40 mt-1 bg-zinc-900 rounded-lg" align="end">
                                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => setIsAddContactModalOpen(true)}>
                                    <UserPlus size={13} className="mr-2 opacity-50" />
                                    Create
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => setIsImportModalOpen(true)}>
                                    <Upload size={13} className="mr-2 opacity-50" />
                                    Import
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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

            <AddContactModal
                isOpen={isAddContactModalOpen}
                onClose={() => setIsAddContactModalOpen(false)}
                onSuccess={() => { setIsAddContactModalOpen(false); setRefreshKey(k => k + 1); }}
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
