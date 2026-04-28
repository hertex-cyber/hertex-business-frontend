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

  const [deals, setDeals] = useState({
    lead: [],
    qualified: [],
    proposal: [],
    negotiation: [],
    won: [],
    lost: [],
  });
  const [activeCardData, setActiveCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/crm/pipeline/");

      // Transform backend list into column-grouped object
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
            raw: deal, // Keep raw for updates
          });
        }
      });

      setDeals(grouped);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

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

    // Optimistic Update
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

    // Backend Update
    if (sourceColumn !== destColumn) {
      try {
        await axios.patch(`/api/crm/pipeline/${activeId}/`, {
          stage: destColumn,
        });
      } catch (err) {
        console.error("Failed to update stage:", err);
        fetchDeals(); // Revert on failure
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

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/40 transition-colors"
              size={16}
            />
            <Input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 h-10 bg-white/5 border-white/10 focus:border-white/20 transition-all text-xs"
            />
          </div>
          <Button
            onClick={fetchDeals}
            variant="secondary"
            size="icon-sm"
            className="h-8 w-8 flex items-center justify-center"
          >
            <RefreshCw size={16} className="text-white/60" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8 relative z-10 overflow-auto custom-scrollbar">
        {isLoading && deals["lead"].length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <RingLoader />
          </div>
        ) : (
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <div className="flex gap-4 min-w-max pb-4 h-full">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={deals[column.id]}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeCardData ? (
                <KanbanCardUI card={activeCardData} isOverlay />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  );
};

export default CRM;
