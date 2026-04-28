import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Users, Search, Filter, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const COLUMNS = [
  { id: "lead", title: "Lead" },
  { id: "qualified", title: "Qualified" },
  { id: "proposal", title: "Proposal" },
  { id: "negotiation", title: "Negotiation" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
];

const CRM = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 5,
      acceleration: false,
    }),
  );

  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deals, setDeals] = useState({
    lead: [],
    qualified: [],
    proposal: [],
    negotiation: [],
    won: [],
    lost: [],
  });
  const [activeCardData, setActiveCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPipelinesLoading, setIsPipelinesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const fetchPipelines = useCallback(async () => {
    try {
      setIsPipelinesLoading(true);
      const response = await axios.get("/api/crm/pipelines/");
      setPipelines(response.data.results || response.data);
      if (response.data.results?.length > 0 && !selectedPipeline) {
        setSelectedPipeline(response.data.results[0]);
      } else if (Array.isArray(response.data) && response.data.length > 0 && !selectedPipeline) {
        setSelectedPipeline(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching pipelines:", error);
    } finally {
      setIsPipelinesLoading(false);
    }
  }, [selectedPipeline]);

  const fetchDeals = useCallback(async () => {
    if (!selectedPipeline) return;
    try {
      setIsLoading(true);
      const response = await axios.get("/api/crm/pipeline/", {
        params: { pipeline: selectedPipeline.id }
      });

      const grouped = {
        lead: [],
        qualified: [],
        proposal: [],
        negotiation: [],
        won: [],
        lost: [],
      };

      response.data.results.forEach((deal) => {
        const stage = deal.stage.toLowerCase();
        if (grouped[stage]) {
          grouped[stage].push({
            id: deal.id,
            name: deal.contact_details?.name || "Unknown",
            email: deal.contact_details?.email || "No Email",
            value: `₹ ${deal.value}`,
            priority: deal.priority,
            lastContact: new Date(deal.updated_at).toLocaleDateString(),
            raw: deal,
          });
        }
      });

      setDeals(grouped);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPipeline]);

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipeline) {
      fetchDeals();
    }
  }, [selectedPipeline, fetchDeals]);

  const handleDragStart = (event) => {
    const { active } = event;
    for (const cardList of Object.values(deals)) {
      const card = cardList.find((c) => c.id === active.id);
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

    for (const [colId, cardList] of Object.entries(deals)) {
      const idx = cardList.findIndex((card) => card.id === activeId);
      if (idx !== -1) {
        sourceColumn = colId;
        sourceIndex = idx;
        break;
      }
    }

    if (sourceColumn === null) return;

    let destColumn = null;
    if (COLUMNS.some((col) => col.id === overId)) {
      destColumn = overId;
    } else {
      for (const col of COLUMNS) {
        if (deals[col.id].some((card) => card.id === overId)) {
          destColumn = col.id;
          break;
        }
      }
    }

    if (!destColumn || (sourceColumn === destColumn && overId === activeId))
      return;

    const newDeals = { ...deals };
    const draggedCard = newDeals[sourceColumn][sourceIndex];
    newDeals[sourceColumn].splice(sourceIndex, 1);

    if (sourceColumn === destColumn) {
      const destIndex = newDeals[destColumn].findIndex((c) => c.id === overId);
      newDeals[destColumn].splice(
        destIndex === -1 ? 0 : destIndex,
        0,
        draggedCard,
      );
    } else {
      newDeals[destColumn].push(draggedCard);
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

      <main className="flex-1 p-8 relative z-10 flex flex-col overflow-hidden">
        {isPipelinesLoading || (isLoading && (!deals["lead"] || deals["lead"].length === 0)) ? (
          <div className="h-full flex items-center justify-center">
            <RingLoader />
          </div>
        ) : pipelines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative"
            >
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 group-hover:scale-110 transition-all duration-500 shadow-[0_0_40px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.2)]">
                <Plus size={40} className="group-hover:rotate-90 transition-transform duration-500" />
              </div>
              <div className="absolute -inset-4 bg-blue-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="space-y-2 relative">
              <h3 className="text-xl font-semibold text-white tracking-tight">No Pipelines Found</h3>
              <p className="text-sm text-white/40 max-w-xs mx-auto font-medium">Click the icon above to create your first sales pipeline and start managing deals.</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex justify-end items-center gap-4 mb-6 shrink-0">
              {!isPipelinesLoading && pipelines.length > 0 && (
                <PipelineSelector 
                  pipelines={pipelines}
                  selectedPipeline={selectedPipeline}
                  onSelect={setSelectedPipeline}
                  onCreateNew={() => setIsCreateModalOpen(true)}
                />
              )}
              <Button
                onClick={() => setIsSearchDialogOpen(true)}
                variant="secondary"
                size="icon"
                className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/60 transition-all"
              >
                <Search size={16} />
              </Button>
              <Button
                onClick={fetchDeals}
                variant="secondary"
                size="icon"
                className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
              >
                <RefreshCw size={16} className="text-white/60" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <DndContext
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                sensors={sensors}
              >
                <div className="flex gap-4 min-w-max pb-4 h-full">
                  {COLUMNS.map((column) => {
                    const filteredCards = (deals[column.id] || []).filter(card => 
                      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      card.email.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
                    return (
                      <KanbanColumn
                        key={column.id}
                        column={column}
                        cards={filteredCards}
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
          </div>
        )}
      </main>

      <SearchDialog 
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <CreatePipelineModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newPipeline) => {
          setPipelines([...pipelines, newPipeline]);
          setSelectedPipeline(newPipeline);
        }}
      />
    </div>
  );
};

export default CRM;
