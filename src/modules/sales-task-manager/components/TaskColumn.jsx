import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import TaskCard from "./TaskCard";

const COLUMN_COLORS = {
  zinc: { dot: "bg-zinc-400", border: "border-zinc-700/50" },
  blue: { dot: "bg-blue-400", border: "border-blue-700/50" },
  amber: { dot: "bg-amber-400", border: "border-amber-700/50" },
  purple: { dot: "bg-purple-400", border: "border-purple-700/50" },
  emerald: { dot: "bg-emerald-400", border: "border-emerald-700/50" },
  red: { dot: "bg-red-400", border: "border-red-700/50" },
};

const TaskColumn = ({ column, cards = [], onViewCard, onStatusAction }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const colors = COLUMN_COLORS[column.color] || COLUMN_COLORS.zinc;

  return (
    <div className="flex flex-col w-[288px] shrink-0">
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-t-lg border border-b-0",
        colors.border,
        "bg-zinc-900/60"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">{column.title}</h3>
        </div>
        <span className="text-[10px] font-mono text-white/30 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
          {cards.length}
        </span>
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 rounded-b-lg border border-t-0 space-y-3 transition-all duration-200 min-h-[200px]",
          colors.border,
          "bg-zinc-900/20",
          isOver && "bg-zinc-900/40 ring-1 ring-blue-500/30"
        )}
      >
        {cards.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-[10px] text-white/20 uppercase tracking-wider">No tasks</p>
          </div>
        ) : (
          cards.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              onView={onViewCard}
              onStatusAction={onStatusAction}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
