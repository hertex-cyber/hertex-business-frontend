import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { MoreVertical, Calendar, User, DollarSign } from "lucide-react";

const PRIORITY_STYLES = {
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const TASK_TYPE_LABELS = {
  CALL: "📞 Call",
  MEETING: "🤝 Meeting",
  DEMO: "🖥️ Demo",
  PROPOSAL: "📄 Proposal",
  QUOTE: "💰 Quote",
  FOLLOW_UP: "📧 Follow-up",
  EMAIL: "✉️ Email",
  RESEARCH: "🔍 Research",
  NEGOTIATION: "🤝 Negotiation",
  CONTRACT_REVIEW: "⚖️ Contract",
  INTERNAL_REVIEW: "🏢 Internal",
  CLOSING: "🎯 Closing",
  OTHER: "📋 Other",
};

export const TaskCardUI = ({ card, isOverlay, onView, onStatusAction }) => {
  return (
    <div
      className={cn(
        "p-4 rounded-lg bg-zinc-900/40 border border-white/5 cursor-grab active:cursor-grabbing transition-all duration-300 touch-none relative w-full group",
        !isOverlay && "hover:border-blue-500/30 hover:bg-zinc-900/60",
        isOverlay && "w-[288px] bg-zinc-900 border-blue-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02] z-50 cursor-grabbing"
      )}
      onClick={() => onView?.(card)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-[13px] leading-tight mb-1.5 truncate group-hover:text-blue-400 transition-colors">
              {card.title}
            </h3>
            <span className={cn(
              "inline-block px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border",
              PRIORITY_STYLES[card.priority] || PRIORITY_STYLES.MEDIUM
            )}>
              {card.priority}
            </span>
            <span className="ml-1.5 text-[9px] text-white/40">
              {TASK_TYPE_LABELS[card.task_type] || card.task_type}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-white/40">
            {card.assigned_to_details && (
              <span className="flex items-center gap-1">
                <User size={10} />
                {`${card.assigned_to_details.first_name || ""} ${card.assigned_to_details.last_name || ""}`.trim() || "Unassigned"}
              </span>
            )}
            {card.due_date && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {card.due_date}
              </span>
            )}
          </div>
          {card.revenue_impact > 0 && (
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              ₹{card.revenue_impact.toLocaleString?.("en-IN") || card.revenue_impact}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ card, onView, onStatusAction }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardUI card={card} onView={onView} onStatusAction={onStatusAction} />
    </div>
  );
};

export default TaskCard;
