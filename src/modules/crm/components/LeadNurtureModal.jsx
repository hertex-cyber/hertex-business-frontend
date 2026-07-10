import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, HeartPulse, Search, Check, ChevronRight, Loader2, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import RingLoader from '@/components/ui/RingLoader';

const STEPS = [
    { id: 1, title: 'Select Stages', desc: 'Choose source stages' },
    { id: 2, title: 'Target Deals', desc: 'Select deals to retarget' },
    { id: 3, title: 'Create Pipeline', desc: 'Configure new pipeline' }
];

const LeadNurtureModal = ({ isOpen, onClose, pipeline, stages, departments = [], onPipelineCreated }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedStages, setSelectedStages] = useState([]);
    
    // Step 2 state
    const [isLoadingDeals, setIsLoadingDeals] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false); // only for step 1→2 button
    const [deals, setDeals] = useState([]);
    const [deselectedDealIds, setDeselectedDealIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [searchFields, setSearchFields] = useState(['name']);
    const [filterOpen, setFilterOpen] = useState(false);
    const [dealPage, setDealPage] = useState(1);
    const [hasMoreDeals, setHasMoreDeals] = useState(false);
    const [isLoadingMoreDeals, setIsLoadingMoreDeals] = useState(false);
    const [totalDealCount, setTotalDealCount] = useState(0);
    const abortControllerRef = useRef(null);
    
    // Step 3 state
    const [newPipelineName, setNewPipelineName] = useState('');
    const [newPipelineDesc, setNewPipelineDesc] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [assignmentType, setAssignmentType] = useState('manual');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressPhase, setProgressPhase] = useState('');
    const [progressCurrent, setProgressCurrent] = useState(0);
    const [progressTotal, setProgressTotal] = useState(0);
    const [error, setError] = useState('');
    const [showDepartments, setShowDepartments] = useState(false);
    const [deptSearchQuery, setDeptSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setSelectedStages([]);
            setDeals([]);
            setDeselectedDealIds(new Set());
            setHasMoreDeals(false);
            setIsLoadingMoreDeals(false);
            setSearchQuery('');
            setDebouncedSearchQuery('');
            setSearchFields(['name']);
            setFilterOpen(false);
            setDealPage(1);
            setTotalDealCount(0);
            setNewPipelineName('');
            setNewPipelineDesc('');
            setSelectedDepartments([]);
            setAssignmentType('manual');
            setError('');
            setIsProcessing(false);
            setProgressPhase('');
            setProgressCurrent(0);
            setProgressTotal(0);
            setShowDepartments(false);
            setDeptSearchQuery('');
        }
    }, [isOpen]);

    const toggleStage = (stageId) => {
        setSelectedStages(prev => 
            prev.includes(stageId) ? prev.filter(id => id !== stageId) : [...prev, stageId]
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchDeals = async (search = '', isInitial = false, page = 1, append = false) => {
        if (selectedStages.length === 0) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (append) {
            setIsLoadingMoreDeals(true);
        } else {
            setIsLoadingDeals(true);
        }

        try {
            const response = await axios.get("/api/crm/pipeline/", {
                params: { 
                    pipeline: pipeline.id, 
                    stages: selectedStages.join(','),
                    search: search,
                    search_by: searchFields.join(','),
                    page: page,
                    page_size: 50
                },
                signal: controller.signal,
            });
            const results = response.data.results || [];

            setDealPage(page);
            setHasMoreDeals(!!response.data.next);
            setTotalDealCount(response.data.count || results.length);

            if (append) {
                setDeals(prev => [...prev, ...results]);
            } else {
                setDeals(results);
                setDeselectedDealIds(new Set());
            }
        } catch (err) {
            if (axios.isCancel(err) || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return;
            }
            console.error("Failed to fetch deals", err);
            setError("Failed to fetch deals. Please try again.");
        } finally {
            if (abortControllerRef.current === controller) {
                if (append) {
                    setIsLoadingMoreDeals(false);
                } else {
                    setIsLoadingDeals(false);
                }
            }
        }
    };

    const toggleSearchField = (field) => {
        setSearchFields(prev => {
            if (prev.includes(field)) {
                // Prevent deselecting all — keep at least one
                if (prev.length === 1) return prev;
                return prev.filter(f => f !== field);
            }
            return [...prev, field];
        });
    };

    useEffect(() => {
        if (currentStep === 2) {
            fetchDeals(debouncedSearchQuery, false, 1, false);
        }
    }, [searchFields]);

    useEffect(() => {
        if (currentStep === 2) {
            fetchDeals(debouncedSearchQuery, false, 1, false);
        }
    }, [debouncedSearchQuery]);

    const handleNext = () => {
        if (currentStep === 1) {
            if (selectedStages.length === 0) {
                setError("Please select at least one stage.");
                return;
            }
            setError('');
            setIsTransitioning(true);
            fetchDeals('', true, 1, false).then(() => {
                setCurrentStep(2);
                setIsTransitioning(false);
            }).catch(() => setIsTransitioning(false));
        } else if (currentStep === 2) {
            if (totalDealCount - deselectedDealIds.size === 0) {
                setError("Please select at least one deal to retarget.");
                return;
            }
            setError('');
            setCurrentStep(3);
        }
    };

    const toggleDeal = (dealId) => {
        setDeselectedDealIds(prev => {
            const next = new Set(prev);
            if (next.has(dealId)) {
                next.delete(dealId);
            } else {
                next.add(dealId);
            }
            return next;
        });
    };

    const toggleSelectAllDeals = () => {
        if (deselectedDealIds.size > 0) {
            setDeselectedDealIds(new Set());
        } else {
            setDeselectedDealIds(new Set(deals.map(d => d.id)));
        }
    };

    const toggleDepartment = (deptId) => {
        setSelectedDepartments(prev => 
            prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
        );
    };

    const filteredDepartments = useMemo(() => {
        if (!deptSearchQuery) return departments;
        return departments.filter(dept =>
            dept.name.toLowerCase().includes(deptSearchQuery.toLowerCase())
        );
    }, [departments, deptSearchQuery]);

    const handleSubmit = async () => {
        if (!newPipelineName.trim()) {
            setError("Pipeline name is required.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        
        try {
            // 1. Create the new pipeline
            const pipelineRes = await axios.post("/api/crm/pipelines/", {
                name: newPipelineName,
                description: newPipelineDesc,
                departments: selectedDepartments,
                assignment_type: assignmentType
            });
            
            const newPipeline = pipelineRes.data;
            
            // 2. Collect all contact IDs (fetch remaining pages if needed)
            let allDeals = [...deals];
            if (hasMoreDeals) {
                setProgressPhase("Collecting deals...");
                let page = dealPage + 1;
                while (true) {
                    const res = await axios.get("/api/crm/pipeline/", {
                        params: {
                            pipeline: pipeline.id,
                            stages: selectedStages.join(','),
                            page: page,
                            page_size: 50
                        }
                    });
                    const results = res.data.results || [];
                    allDeals = [...allDeals, ...results];
                    setProgressCurrent(allDeals.length);
                    setProgressTotal(totalDealCount);
                    if (!res.data.next) break;
                    page++;
                }
                setDeals(allDeals);
            }
            
            const selectedDealsList = allDeals.filter(d => !deselectedDealIds.has(d.id));
            const allContactIds = selectedDealsList.map(d => d.contact);
            
            // 3. Move in chunks of 100
            const CHUNK_SIZE = 100;
            if (allContactIds.length > CHUNK_SIZE) {
                setIsProcessing(true);
                setProgressPhase("Moving deals to retarget pipeline...");
                setProgressTotal(allContactIds.length);
                setProgressCurrent(0);
                
                for (let i = 0; i < allContactIds.length; i += CHUNK_SIZE) {
                    const chunk = allContactIds.slice(i, i + CHUNK_SIZE);
                    await axios.post("/api/crm/pipeline/bulk-add-contacts/", {
                        pipeline_id: newPipeline.id,
                        contact_ids: chunk,
                        source_pipeline: pipeline.id
                    });
                    setProgressCurrent(Math.min(i + CHUNK_SIZE, allContactIds.length));
                }
            } else {
                await axios.post("/api/crm/pipeline/bulk-add-contacts/", {
                    pipeline_id: newPipeline.id,
                    contact_ids: allContactIds,
                    source_pipeline: pipeline.id
                });
            }
            
            if (onPipelineCreated) {
                onPipelineCreated(newPipeline);
            }
            onClose();
        } catch (err) {
            console.error("Failed to create retargeting pipeline", err);
            setError("An error occurred during creation.");
            setIsProcessing(false);
        } finally {
            setIsSubmitting(false);
        }
    };



    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />
            
            <div className={cn(
                                "relative w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200",
                                currentStep === 3 ? "max-w-xl" : "max-w-3xl"
                            )}>
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <HeartPulse size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-white uppercase tracking-wider">Lead Nurture Setup</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                                Source: <span className="text-blue-400 font-semibold">{pipeline?.name}</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 text-white/20 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center justify-between px-8 py-5 bg-zinc-900/30 border-b border-zinc-800 shrink-0">
                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white uppercase tracking-wider truncate">{STEPS.find(s => s.id === currentStep)?.title}</h3>
                        {currentStep === 2 && totalDealCount > 0 && (
                            <p className="text-[10px] text-blue-400 font-medium mt-1">
                                Total leads: {totalDealCount - deselectedDealIds.size}
                            </p>
                        )}
                        {currentStep !== 2 && (
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1 hidden sm:block">
                                {STEPS.find(s => s.id === currentStep)?.desc}
                            </p>
                        )}
                    </div>

                    {isProcessing ? (
                        <div className="w-48 space-y-1.5 shrink-0 ml-4">
                            <p className="text-[10px] text-blue-400 font-medium text-right">{progressPhase}</p>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progressTotal > 0 ? (progressCurrent / progressTotal) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-[9px] text-white/40 text-right">{progressCurrent} / {progressTotal}</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 shrink-0">
                            {STEPS.map((step, idx) => (
                                <React.Fragment key={step.id}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 shrink-0",
                                        currentStep > step.id ? "bg-blue-500 text-white shadow-[0_0_15px rgba(59,130,246,0.3)]" :
                                        currentStep === step.id ? "bg-blue-500/20 border border-blue-500/50 text-blue-400" :
                                        "bg-zinc-900 border border-zinc-800 text-white/20"
                                    )}>
                                        {currentStep > step.id ? <Check size={12} strokeWidth={3} /> : step.id}
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className="w-8 sm:w-16 h-1 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                                            <div className={cn(
                                                "h-full transition-all duration-500 ease-out bg-blue-500 shadow-[0_0_10px rgba(59,130,246,0.5)]",
                                                currentStep > step.id ? "w-full" : "w-0"
                                            )} />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}</div>

                {/* Content */}
                <div className={cn(
                    "flex-1 min-h-0 relative",
                    currentStep === 2 ? "flex flex-col overflow-hidden" : "overflow-y-auto custom-scrollbar"
                )}>
                    {error && (
                        <div className="mx-8 mt-8 mb-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium uppercase tracking-wider text-center">
                            {error}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {stages.map(stage => {
                                    const isSelected = selectedStages.includes(stage.id);
                                    return (
                                        <button
                                            key={stage.id}
                                            onClick={() => toggleStage(stage.id)}
                                            className={cn(
                                                "p-4 rounded-md border text-left transition-all duration-300 relative overflow-hidden group",
                                                isSelected 
                                                    ? "bg-blue-500/10 border-blue-500/50" 
                                                    : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity",
                                                isSelected && "opacity-100 to-blue-500/10"
                                            )} />
                                            <div className="relative flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        isSelected ? "text-blue-400" : "text-white/80"
                                                    )}>
                                                        {stage.name}
                                                    </span>
                                                </div>
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                    isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-700 text-transparent"
                                                )}>
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300 min-h-0">
                            <div className="z-20 bg-zinc-950/95 backdrop-blur-md flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0">
                                <div className="px-8 py-3 shrink-0">
                                    <div className="relative w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                        <Input
                                            placeholder={`Search by ${searchFields.join(', ')}...`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-9 pl-9 pr-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500/40 text-sm text-white placeholder:text-white/20"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <button
                                                onClick={() => setFilterOpen(o => !o)}
                                                className={cn(
                                                    "w-6 h-6 flex items-center justify-center rounded transition-all",
                                                    filterOpen || searchFields.length > 1
                                                        ? "text-blue-400 bg-blue-500/10"
                                                        : "text-white/30 hover:text-white/60"
                                                )}
                                            >
                                                <SlidersHorizontal size={13} />
                                            </button>
                                            {filterOpen && (
                                                <div className="absolute right-0 top-8 z-30 w-40 bg-zinc-900 border border-zinc-700/60 rounded-lg shadow-2xl overflow-hidden">
                                                    <div className="px-3 py-2 border-b border-zinc-800 text-[9px] font-medium uppercase tracking-widest text-white/30">
                                                        Search by
                                                    </div>
                                                    {['name', 'email', 'phone'].map(field => (
                                                        <button
                                                            key={field}
                                                            onClick={() => toggleSearchField(field)}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] transition-colors group"
                                                        >
                                                            <div className={cn(
                                                                "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0",
                                                                searchFields.includes(field)
                                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                                    : "border-zinc-600 text-transparent group-hover:border-zinc-400"
                                                            )}>
                                                                <Check size={8} strokeWidth={3} />
                                                            </div>
                                                            <span className={cn(
                                                                "text-[11px] font-medium capitalize",
                                                                searchFields.includes(field) ? "text-white/90" : "text-white/40"
                                                            )}>
                                                                {field}
                                                            </span>
                                                        </button>
                                                    ))}
</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 px-8 py-3 border-y border-zinc-800/50 bg-black/20 text-[10px] font-medium uppercase tracking-wider text-white/40 items-center">
                                    <div 
                                        className="col-span-1 flex justify-center cursor-pointer group"
                                        onClick={toggleSelectAllDeals}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                            deselectedDealIds.size === 0 && deals.length > 0
                                                ? "bg-blue-500 border-blue-500 text-white" 
                                                : "border-zinc-700 text-transparent group-hover:border-zinc-500"
                                        )}>
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="col-span-3">Contact Name</div>
                                    <div className="col-span-3">Email</div>
                                    <div className="col-span-3">Phone</div>
                                    <div className="col-span-2">Stage</div>
                                </div>
</div>

                            <div className="flex-1 bg-zinc-900/10 overflow-y-auto custom-scrollbar min-h-0 relative">
                                {isLoadingDeals && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px]">
                                        <RingLoader />
                                    </div>
                                )}
                                
                                {deals.length === 0 && !isLoadingDeals ? (
                                    <div className="p-8 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/30 font-medium">
                                        No deals found
                                    </div>
                                ) : (
                                    deals.map(deal => {
                                        const isSelected = !deselectedDealIds.has(deal.id);
                                        const stageName = stages.find(s => s.id === deal.stage)?.name || 'Unknown';
                                        return (
                                            <div 
                                                key={deal.id}
                                                onClick={() => toggleDeal(deal.id)}
                                                className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-zinc-800/20 items-center hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                            >
                                                <div className="col-span-1 flex justify-center">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                        isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-700 text-transparent group-hover:border-zinc-500"
                                                    )}>
                                                        <Check size={10} strokeWidth={3} />
                                                    </div>
                                                </div>
                                                <div className="col-span-3 flex items-center gap-2 min-w-0">
                                                    <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-white/60 uppercase shrink-0">
                                                        {(deal.contact_details?.name || 'U')[0]}
                                                    </div>
                                                    <span className="text-[10px] font-medium text-white/80 truncate min-w-0">
                                                        {deal.contact_details?.name || 'Unknown'}
                                                    </span>
                                                </div>
                                                <div className="col-span-3 text-[10px] text-white/40 truncate">
                                                    {deal.contact_details?.email || '-'}
                                                </div>
                                                <div className="col-span-3 text-[10px] text-white/40 truncate">
                                                    {deal.contact_details?.phone || '-'}
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900/50 text-[10px] font-medium text-white/60">
                                                        {stageName}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {hasMoreDeals && (
                                    <div className="px-8 py-4 flex items-center justify-center">
                                        <button
                                            onClick={() => fetchDeals(debouncedSearchQuery, false, dealPage + 1, true)}
                                            disabled={isLoadingMoreDeals}
                                            className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 text-white/50 hover:text-white hover:border-zinc-600 text-[9px] font-medium uppercase tracking-[0.15em] transition-all rounded-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isLoadingMoreDeals ? <Loader2 size={10} className="animate-spin" /> : null}
                                            Load More
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-white/40 uppercase">Pipeline Name</label>
                                    <Input 
                                        value={newPipelineName}
                                        onChange={e => setNewPipelineName(e.target.value)}
                                        className="h-11 bg-zinc-900/50 border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500/40 text-sm text-white"
                                        placeholder="RETARGET PIPELINE"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-white/40 uppercase">Description</label>
                                    <textarea 
                                        value={newPipelineDesc}
                                        onChange={e => setNewPipelineDesc(e.target.value)}
                                        className="w-full h-24 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none custom-scrollbar"
                                        placeholder="Optional description..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
<div className="flex items-center gap-3">
                                    <label className="text-xs text-white/60 uppercase tracking-wider font-medium">Assign Groups</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowDepartments(prev => !prev)}
                                        className={cn(
                                            "relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0",
                                            showDepartments ? "bg-blue-500" : "bg-zinc-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                                            showDepartments ? "translate-x-[18px]" : "translate-x-0.5"
                                        )} />
                                    </button>
                                    {selectedDepartments.length > 0 && (
                                        <span className="text-xs text-blue-400 font-medium ml-1">
                                            {selectedDepartments.length} selected
                                        </span>
                                    )}
                                </div>
                                {showDepartments && (
                                    <div className="border border-zinc-800 rounded-lg overflow-hidden">
                                        <div className="px-3 py-2 border-b border-zinc-800/50 bg-black/20">
                                            <div className="relative w-full">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" size={12} />
                                                <Input
                                                    placeholder="Search departments..."
                                                    value={deptSearchQuery}
                                                    onChange={(e) => setDeptSearchQuery(e.target.value)}
                                                    className="w-full h-8 pl-8 bg-zinc-900/50 border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500/40 text-xs text-white placeholder:text-white/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto custom-scrollbar max-h-28">
                                            {filteredDepartments.length === 0 ? (
                                                <div className="py-4 text-center text-[10px] text-white/20 uppercase tracking-wider font-medium">
                                                    No departments found
                                                </div>
                                            ) : (
                                                filteredDepartments.map(dept => {
                                                    const isSelected = selectedDepartments.includes(dept.id);
                                                    return (
                                                        <button
                                                            key={dept.id}
                                                            type="button"
                                                            onClick={() => toggleDepartment(dept.id)}
                                                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] transition-colors border-b border-zinc-800/20 last:border-b-0"
                                                        >
                                                            <span className={cn(
                                                                "text-xs font-medium",
                                                                isSelected ? "text-blue-400" : "text-white/70"
                                                            )}>
                                                                {dept.name}
                                                            </span>
                                                            <div className={cn(
                                                                "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0",
                                                                isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-700"
                                                            )}>
                                                                {isSelected && <Check size={8} strokeWidth={3} />}
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
                    {isProcessing ? (
                        <div className="w-full text-center">
                            <p className="text-[10px] text-white/40">Processing, please wait...</p>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={() => {
                                    if (currentStep > 1) {
                                        setCurrentStep(prev => prev - 1);
                                        setError('');
                                    } else {
                                        onClose();
                                    }
                                }}
                                disabled={isSubmitting || isLoadingDeals}
                                className="px-6 h-9 bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em] rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {currentStep > 1 ? (
                                    <><ArrowLeft size={12} /> <span className="leading-none mt-[1px]">Back</span></>
                                ) : <span className="leading-none mt-[1px]">Cancel</span>}
                            </button>

                            {currentStep < 3 ? (
                                <button 
                                    onClick={handleNext}
                                    disabled={isTransitioning}
                                    className="px-6 h-9 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-medium uppercase tracking-[0.2em] transition-all rounded-sm cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center gap-2"
                                >
                                    {isTransitioning ? <Loader2 size={12} className="animate-spin" /> : <span className="leading-none mt-[1px]">Next Step</span>}
                                    {!isTransitioning && <ChevronRight size={12} />}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isProcessing}
                                    className="px-6 h-9 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-medium uppercase tracking-[0.2em] transition-all rounded-sm cursor-pointer shadow-[0_0_15px rgba(59,130,246,0.15)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting || isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                                    <span className="leading-none mt-[1px]">{isProcessing ? "Processing..." : "Create & Retarget"}</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LeadNurtureModal;