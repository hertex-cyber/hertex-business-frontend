import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import KanbanColumn from "../components/KanbanBoard";
import { KanbanCardUI } from "../components/KanbanCard";
import RingLoader from "@/components/ui/RingLoader";
import PipelineSelector from "../components/PipelineSelector";
import CreatePipelineModal from "../components/CreatePipelineModal";
import SearchDialog from "../components/SearchDialog";
import DealDetailsDialog from "../components/DealDetailsDialog";
import AddLeadDialog from "../components/AddLeadDialog";
import AddLeadStructured from "../components/AddLeadStructured";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import Actions from "../components/Actions";
import { useAuth } from "@/context/AuthContext";
import { useUsers, useDepartments } from "../../admin/hooks/useUsers";
import { cn } from "@/lib/utils";

const CRM = () => {
  const { user } = useAuth();
  const isAdmin = ["Superadmin", "Admin"].includes(user?.role) || user?.is_superuser;

  // Guard: reset to pipeline tab if user is not an admin
  useEffect(() => {
    if (!isAdmin) {
      setActiveTab('pipeline');
    }
  }, [isAdmin]);

  const { users, fetchUsers } = useUsers();
  const { departments, refetch: fetchDepartments } = useDepartments();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 5,
      acceleration: false,
    }),
  );

  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);

  const selectPipeline = useCallback((pipeline) => {
    setSelectedPipeline(pipeline);
    if (pipeline?.id) {
      localStorage.setItem('crm_selected_pipeline_id', pipeline.id);
    }
  }, []);

  const [stages, setStages] = useState([]); // dynamic stages for selected pipeline
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' or 'actions'

  useEffect(() => {
    if (activeTab === 'actions') {
      fetchUsers();
      fetchDepartments();
    }
  }, [activeTab]);
  const [deals, setDeals] = useState({
    lead: { items: [], nextPage: null, hasMore: false, count: 0 },
    qualified: { items: [], nextPage: null, hasMore: false, count: 0 },
    proposal: { items: [], nextPage: null, hasMore: false, count: 0 },
    negotiation: { items: [], nextPage: null, hasMore: false, count: 0 },
    won: { items: [], nextPage: null, hasMore: false, count: 0 },
    lost: { items: [], nextPage: null, hasMore: false, count: 0 },
  });
  const [activeCardData, setActiveCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPipelinesLoading, setIsPipelinesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [viewingDeal, setViewingDeal] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const scrollContainerRef = useRef(null);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  const getEligibleUsersForPipeline = () => {
    if (!selectedPipeline || !users) return [];
    
    // Support both object-based and ID-based department lists
    const departments = selectedPipeline.departments || [];
    const pipelineDeptIds = departments.map(d => typeof d === 'object' ? d.id : d);
    
    if (pipelineDeptIds.length === 0) return [];

    return users.filter(user => 
      user.departments?.some(dept => {
        const deptId = typeof dept === 'object' ? dept.id : dept;
        return pipelineDeptIds.includes(deptId);
      })
    );
  };

  const transformDeal = (deal) => ({
    id: deal.id,
    name: deal.contact_details?.name || "Unknown",
    email: deal.contact_details?.email || "No Email",
    phone: deal.contact_details?.phone || "No Phone",
    status: deal.contact_details?.status || "Lead",
    value: `₹ ${deal.value}`,
    priority: deal.priority,
    lastContact: new Date(deal.updated_at).toLocaleDateString(),
    assigned_user: deal.assigned_user,
    assigned_user_details: deal.assigned_user_details,
    stage: deal.stage,
    raw: deal,
  });

  const fetchPipelines = useCallback(async () => {
    try {
      setIsPipelinesLoading(true);
      const response = await axios.get("/api/crm/pipelines/");
      const data = response.data.results || response.data;
      setPipelines(data);
      if (data.length > 0) {
        if (!selectedPipeline) {
          const savedId = localStorage.getItem('crm_selected_pipeline_id');
          const restored = savedId ? data.find(p => p.id === savedId) : null;
          selectPipeline(restored || data[0]);
        } else {
          const refreshedSelected = data.find(p => p.id === selectedPipeline.id);
          if (refreshedSelected) {
            setSelectedPipeline(refreshedSelected);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching pipelines:", error);
    } finally {
      setIsPipelinesLoading(false);
    }
  }, [selectedPipeline, selectPipeline]);

  const fetchStages = useCallback(async () => {
    if (!selectedPipeline) return;
    try {
      const res = await axios.get(`/api/crm/pipelines/${selectedPipeline.id}/stages/`);
      setStages(res.data.results || res.data);
    } catch (e) {
      console.error("Error fetching stages:", e);
    }
  }, [selectedPipeline]);

  const fetchDeals = useCallback(async () => {
    if (!selectedPipeline || stages.length === 0) return;
    try {
      setIsLoading(true);

      // Fetch first 100 deals per stage (server-side paginated)
      const promises = stages.map(stage =>
        axios.get("/api/crm/pipeline/", {
          params: { pipeline: selectedPipeline.id, stage: stage.id, page: 1, page_size: 100 }
        }).then(res => ({
          stageId: stage.id,
          items: (res.data.results || []).map(transformDeal),
          nextPage: res.data.next ? 2 : null,
          hasMore: !!res.data.next,
          count: res.data.count || 0
        })).catch(err => {
          console.error(`Failed to fetch deals for stage ${stage.id}:`, err);
          return { stageId: stage.id, items: [], nextPage: null, hasMore: false, count: 0 };
        })
      );

      const results = await Promise.all(promises);

      const newDeals = {};
      stages.forEach(stage => {
        newDeals[stage.id] = { items: [], nextPage: null, hasMore: false, count: 0, isLoadingMore: false };
      });
      results.forEach(r => {
        newDeals[r.stageId] = {
          items: r.items,
          nextPage: r.nextPage,
          hasMore: r.hasMore,
          count: r.count,
          isLoadingMore: false
        };
      });

      setDeals(newDeals);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPipeline, stages]);

  const fetchMoreDeals = async (stageId) => {
    const stageData = deals[stageId];
    if (!stageData?.nextPage || stageData.isLoadingMore) return;
    try {
      setDeals(prev => ({ ...prev, [stageId]: { ...prev[stageId], isLoadingMore: true } }));
      const response = await axios.get("/api/crm/pipeline/", {
        params: { pipeline: selectedPipeline.id, stage: stageId, page: stageData.nextPage, page_size: 100 }
      });
      const newItems = (response.data.results || []).map(transformDeal);
      setDeals(prev => ({
        ...prev,
        [stageId]: {
          items: [...prev[stageId].items, ...newItems],
          nextPage: response.data.next ? stageData.nextPage + 1 : null,
          hasMore: !!response.data.next,
          isLoadingMore: false,
          count: response.data.count || 0
        }
      }));
    } catch (err) {
      console.error("Load more failed:", err);
      setDeals(prev => ({ ...prev, [stageId]: { ...prev[stageId], isLoadingMore: false } }));
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipeline) {
      // Use stages already embedded in the pipeline object — no extra API call
      const embeddedStages = selectedPipeline.stages || [];
      if (embeddedStages.length > 0) {
        setIsLoading(true);
        setDeals({});
        setStages([...embeddedStages].sort((a, b) => a.order - b.order));
      } else {
        // Fallback: fetch stages if not embedded
        setIsLoading(true);
        setStages([]);
        setDeals({});
        fetchStages();
      }
    }
  }, [selectedPipeline]);

  useEffect(() => {
    if (stages.length > 0) {
      const emptyDeals = {};
      stages.forEach(s => {
        emptyDeals[s.id] = { items: [], nextPage: null, hasMore: false, count: 0 };
      });
      setDeals(emptyDeals);
      fetchDeals();
    }
  }, [stages]);

  const handleDragStart = (event) => {
    const { active } = event;
    for (const colData of Object.values(deals)) {
      const card = colData.items.find((c) => c.id === active.id);
      if (card) {
        setActiveCardData(card);
        break;
      }
    }
  };

  const handleDragEnd = async (event) => {
    setActiveCardData(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    let sourceColumn = null;
    let sourceIndex = -1;

    for (const [colId, colData] of Object.entries(deals)) {
      const idx = colData.items.findIndex((card) => card.id === activeId);
      if (idx !== -1) {
        sourceColumn = colId;
        sourceIndex = idx;
        break;
      }
    }

    if (sourceColumn === null) return;

    let destColumn = null;
    if (stages.some((s) => s.id === overId)) {
      destColumn = overId;
    } else {
      for (const s of stages) {
        if (deals[s.id]?.items.some((card) => card.id === overId)) {
          destColumn = s.id;
          break;
        }
      }
    }

    if (!destColumn || (sourceColumn === destColumn && overId === activeId))
      return;

    const newDeals = { ...deals };
    const draggedCard = newDeals[sourceColumn].items[sourceIndex];
    newDeals[sourceColumn].items.splice(sourceIndex, 1);

    if (sourceColumn === destColumn) {
      const destIndex = newDeals[destColumn].items.findIndex((c) => c.id === overId);
      newDeals[destColumn].items.splice(
        destIndex === -1 ? 0 : destIndex,
        0,
        draggedCard,
      );
    } else {
      newDeals[destColumn].items.push(draggedCard);
    }

    setDeals(newDeals);

    if (sourceColumn !== destColumn) {
      try {
        await axios.patch(`/api/crm/pipeline/${activeId}/`, {
          stage: destColumn,
        });
      } catch (err) {
        console.error("Failed to update stage:", err);
        fetchDeals();
      }
    }
  };

  const handleViewDeal = (card) => {
    setViewingDeal(card);
    setIsDetailsOpen(true);
  };

  const handleDeleteDeal = async () => {
    if (!dealToDelete) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/api/crm/pipeline/${dealToDelete.id}/`);
      
      // Find the stage ID from the deal's raw data
      const stageId = dealToDelete.raw?.stage;
      if (stageId) {
        setDeals(prev => ({
          ...prev,
          [stageId]: {
            ...prev[stageId],
            items: prev[stageId].items.filter(item => item.id !== dealToDelete.id),
            count: Math.max(0, (prev[stageId]?.count || 0) - 1)
          }
        }));
      }
      
      setIsDetailsOpen(false);
      setShowDeleteConfirm(false);
      setDealToDelete(null);
      setViewingDeal(null);
    } catch (err) {
      console.error("Failed to delete deal:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePipeline = (id) => {
    const updatedPipelines = pipelines.filter(p => p.id !== id);
    setPipelines(updatedPipelines);
    if (selectedPipeline?.id === id) {
      setSelectedPipeline(updatedPipelines[0] || null);
    }
  };

  const handleUpdatePipeline = (updated) => {
    setPipelines(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selectedPipeline?.id === updated.id) {
      setSelectedPipeline(updated);
    }
  };

  const handlePipelineUpdated = () => {
    fetchPipelines();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-8 flex justify-between items-end border-b border-zinc-800 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">CRM</h1>
          <p className="text-sm text-white/40 font-medium">
            Manage your customers and pipelines
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-10 pt-8 overflow-hidden relative z-10">
        
        {/* Top Control Bar with Tabs and Actions */}
        <div className="flex justify-between items-center mb-8 shrink-0">
          {/* Left: Tab Switcher with Sliding Highlighter */}
          <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
            {/* Sliding Highlighter */}
            <div 
              className={cn(
                "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
                activeTab === 'pipeline' 
                  ? "left-0 w-1/2 rounded-l rounded-r-none bg-blue-500/20" 
                  : "left-1/2 w-1/2 rounded-r rounded-l-none bg-blue-500/20"
              )}
            />

            <button 
              onClick={() => setActiveTab('pipeline')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === 'pipeline' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Pipeline
            </button>
            <button 
              onClick={() => isAdmin && setActiveTab('actions')}
              title={!isAdmin ? "Only admins can access actions" : undefined}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === 'actions' ? "text-blue-400" : "text-white/50",
                !isAdmin && "opacity-40 cursor-not-allowed",
                isAdmin && !(activeTab === 'actions') && "hover:text-white/80"
              )}
            >
              Actions
            </button>
          </div>

          {/* Right: Operational Tools */}
          <div className={cn("flex items-center transition-all duration-500 ease-out", activeTab === 'pipeline' ? "gap-4" : "gap-0")}>
            <div className={cn(
              "flex items-center gap-2 transition-all duration-500 ease-out overflow-hidden",
              activeTab === 'pipeline' 
                ? "opacity-100 w-[88px] pointer-events-auto" 
                : "opacity-0 w-0 pointer-events-none"
            )}>
              <button 
                onClick={() => setIsSearchDialogOpen(true)}
                className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Search Deals"
              >
                <Search size={14} className="group-hover:scale-110 transition-transform" />
              </button>

              <button 
                onClick={() => setIsAddLeadOpen(true)}
                className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Add Lead"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="w-48 transition-all duration-500 ease-out">
              <PipelineSelector 
                pipelines={pipelines}
                selectedPipeline={selectedPipeline}
                onSelect={selectPipeline}
                onCreateNew={() => setIsCreateModalOpen(true)}
              />
            </div>

            {/* Scroll Navigation Buttons */}
            <div className={cn(
              "flex items-center gap-2 transition-all duration-500 ease-out overflow-hidden",
              activeTab === 'pipeline' 
                ? "opacity-100 w-[88px] pointer-events-auto" 
                : "opacity-0 w-0 pointer-events-none"
            )}>
              <button 
                onClick={handleScrollLeft}
                className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Scroll Left"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleScrollRight}
                className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Scroll Right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'pipeline' ? (
            isPipelinesLoading || isLoading ? (
              <div className="h-full flex items-center justify-center">
                <RingLoader />
              </div>
            ) : pipelines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                {isAdmin ? (
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group relative"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 group-hover:scale-110 transition-all duration-500 shadow-[0_0_40px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.2)]">
                      <Plus size={40} className="group-hover:rotate-90 transition-transform duration-500" />
                    </div>
                    <div className="absolute -inset-4 bg-blue-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-center text-zinc-500">
                    <Search size={40} />
                  </div>
                )}
                <div className="space-y-2 relative">
                  <h3 className="text-xl font-semibold text-white tracking-tight">No Pipelines Found</h3>
                  <p className="text-sm text-white/40 max-w-xs mx-auto font-medium">
                    {isAdmin 
                      ? "Click the icon above to create your first sales pipeline and start managing deals."
                      : "You are not assigned to any pipeline groups. Please contact your administrator."}
                  </p>
                </div>
              </div>
            ) : (
              <div ref={scrollContainerRef} className="h-full overflow-auto custom-scrollbar">
                <DndContext
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  sensors={sensors}
                >
                  <div className="flex gap-4 min-w-max pb-4 h-full">
                    {stages.map((stage) => {
                      const stageData = deals[stage.id] || { items: [], count: 0, hasMore: false, isLoadingMore: false };
                      return (
                        <KanbanColumn
                          key={stage.id}
                          column={{ id: stage.id, title: stage.name, color: stage.color }}
                          cards={stageData.items}
                          totalCount={stageData.count}
                          hasMore={stageData.hasMore}
                          isLoadingMore={stageData.isLoadingMore}
                          onLoadMore={() => fetchMoreDeals(stage.id)}
                          onViewCard={handleViewDeal}
                        />
                      );
                    })}
                  </div>
                  <DragOverlay dropAnimation={null}>
                    {activeCardData ? (
                      <KanbanCardUI card={activeCardData} isOverlay />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            )
          ) : (
            <Actions 
              selectedPipeline={selectedPipeline} 
              pipelines={pipelines}
              stages={stages}
              departments={departments}
              users={users}
              onPipelineCreated={(newPipeline) => {
                setPipelines([...pipelines, newPipeline]);
                setSelectedPipeline(newPipeline);
                setActiveTab('pipeline');
              }}
              onPipelineDeleted={handleDeletePipeline}
              onPipelineUpdated={handleUpdatePipeline}
              onPipelineUpdatedForUsers={handlePipelineUpdated}
              onStagesChanged={() => { fetchStages(); }}
            />
          )}
        </div>
      </main>

      <SearchDialog 
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelect={(deal) => {
          handleViewDeal(transformDeal(deal));
          setIsSearchDialogOpen(false);
        }}
      />

      {selectedPipeline?.custom_fields_enabled ? (
        <AddLeadStructured
          isOpen={isAddLeadOpen}
          onClose={() => setIsAddLeadOpen(false)}
          pipeline={selectedPipeline}
          stages={stages}
          onSuccess={(newDealRaw) => {
            if (newDealRaw && newDealRaw.stage) {
              const transformedDeal = transformDeal(newDealRaw);
              setDeals(prev => {
                const stageId = newDealRaw.stage;
                const colData = prev[stageId] || { items: [], count: 0, hasMore: false, nextPage: null };
                return {
                  ...prev,
                  [stageId]: {
                    ...colData,
                    items: [transformedDeal, ...colData.items],
                    count: colData.count + 1
                  }
                };
              });
            }
          }}
        />
      ) : (
        <AddLeadDialog
          isOpen={isAddLeadOpen}
          onClose={() => setIsAddLeadOpen(false)}
          pipeline={selectedPipeline}
          stages={stages}
          onSuccess={(newDealRaw) => {
            if (newDealRaw && newDealRaw.stage) {
              const transformedDeal = transformDeal(newDealRaw);
              setDeals(prev => {
                const stageId = newDealRaw.stage;
                const colData = prev[stageId] || { items: [], count: 0, hasMore: false, nextPage: null };
                return {
                  ...prev,
                  [stageId]: {
                    ...colData,
                    items: [transformedDeal, ...colData.items],
                    count: colData.count + 1
                  }
                };
              });
            }
          }}
        />
      )}

      <CreatePipelineModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        pipelines={pipelines}
        onSuccess={(newPipeline) => {
          setPipelines([...pipelines, newPipeline]);
          setSelectedPipeline(newPipeline);
        }}
        onDelete={handleDeletePipeline}
        onUpdate={handleUpdatePipeline}
      />

      <DealDetailsDialog 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        deal={viewingDeal}
        eligibleUsers={getEligibleUsersForPipeline()}
        onUpdate={(updatedDeal) => {
          if (updatedDeal?.id) {
            // Patch just this deal in local state — no full reload
            setDeals(prev => {
              const next = { ...prev };
              for (const key of Object.keys(next)) {
                next[key] = {
                  ...next[key],
                  items: next[key].items.map(item =>
                    item.id === updatedDeal.id ? updatedDeal : item
                  )
                };
              }
              return next;
            });
            setViewingDeal(updatedDeal);
          }
        }}
        onDelete={(deal) => {
          setDealToDelete(deal);
          setShowDeleteConfirm(true);
        }}
      />

      <ConfirmDeleteDialog 
        isOpen={showDeleteConfirm}
        title="Delete Deal"
        description={`Are you sure you want to delete the deal for ${dealToDelete?.name}? This action cannot be undone.`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteDeal}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default CRM;
