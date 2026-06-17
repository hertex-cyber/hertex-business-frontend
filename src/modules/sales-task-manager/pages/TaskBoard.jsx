import React, { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useSalesTasks } from "../hooks/useSalesTasks";
import { useSalesProgrammes } from "../hooks/useSalesProgrammes";
import { updateSalesTask } from "../services/salesTaskService";
import { useSalesTaskContext } from "../context/SalesTaskContext";
import TaskCard from "../components/TaskCard";
import TaskColumn from "../components/TaskColumn";
import TaskDetailDialog from "../components/TaskDetailDialog";
import TaskCreateDialog from "../components/TaskCreateDialog";
import FilterBar from "../components/FilterBar";

const STATUSES = [
  { id: "BACKLOG", title: "Backlog", color: "zinc" },
  { id: "TODO", title: "To Do", color: "blue" },
  { id: "IN_PROGRESS", title: "In Progress", color: "amber" },
  { id: "IN_REVIEW", title: "In Review", color: "purple" },
  { id: "DONE", title: "Done", color: "emerald" },
  { id: "BLOCKED", title: "Blocked", color: "red" },
];

const TaskBoard = () => {
  const { filters } = useSalesTaskContext();
  const { programmes } = useSalesProgrammes();
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const params = { ...filters, ...(selectedProgramme ? { programme: selectedProgramme } : {}) };
  const { tasks, loading, refetch } = useSalesTasks(params);
  const [activeCard, setActiveCard] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { distance: 5 })
  );

  // Organize tasks by status
  const tasksByStatus = {};
  STATUSES.forEach((s) => { tasksByStatus[s.id] = []; });
  tasks.forEach((task) => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    } else {
      tasksByStatus["TODO"].push(task);
    }
  });

  const handleDragStart = (event) => {
    const found = tasks.find((t) => t.id === event.active.id);
    if (found) setActiveCard(found);
  };

  const handleDragEnd = async (event) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    let newStatus = null;
    for (const s of STATUSES) {
      if (over.id === s.id || tasksByStatus[s.id]?.some((t) => t.id === over.id)) {
        newStatus = s.id;
        break;
      }
    }

    if (newStatus && newStatus !== tasks.find((t) => t.id === taskId)?.status) {
      try {
        await updateSalesTask(taskId, { status: newStatus });
        refetch();
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    }
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-8 flex justify-between items-end border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Sales Tasks</h1>
          <p className="text-sm text-white/40 font-medium">
            {totalTasks > 0 ? `${doneTasks}/${totalTasks} tasks completed` : "Manage your sales execution tasks"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProgramme || ""}
            onChange={(e) => setSelectedProgramme(e.target.value || null)}
            className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
          >
            <option value="">All Programmes</option>
            {(programmes || []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-semibold uppercase tracking-wider"
          >
            <Plus size={14} /> Add Task
          </button>
        </div>
      </header>

      {/* Filter Bar — reads from context, no callback needed */}
      <div className="px-10 py-3 border-b border-zinc-800 bg-zinc-900/10">
        <FilterBar programmes={programmes || []} />
      </div>

      <main className="flex-1 overflow-hidden p-10 pt-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : (
          <div className="h-full overflow-auto custom-scrollbar">
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
              <div className="flex gap-4 min-w-max pb-4 h-full">
                {STATUSES.map((status) => (
                  <TaskColumn
                    key={status.id}
                    column={status}
                    cards={tasksByStatus[status.id] || []}
                    onViewCard={(card) => setViewingTask(card)}
                  />
                ))}
              </div>
              <DragOverlay dropAnimation={null}>
                {activeCard ? <TaskCard card={activeCard} isOverlay /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </main>

      {/* Create Task Dialog */}
      <TaskCreateDialog
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        programmes={programmes || []}
        onCreate={() => refetch()}
      />

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        taskId={viewingTask?.id}
        onUpdate={() => { refetch(); setViewingTask(null); }}
      />
    </div>
  );
};

export default TaskBoard;
