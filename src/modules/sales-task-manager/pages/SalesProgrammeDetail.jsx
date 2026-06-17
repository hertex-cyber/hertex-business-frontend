import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FolderKanban, ListTodo, Milestone, Users,
  BarChart3, Target, TrendingUp, Calendar,
  Clock, DollarSign, Loader2, GanttChartSquare,
  CheckCircle, AlertTriangle, AlertCircle, List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesProgramme } from "../hooks/useSalesProgrammes";
import { useSalesTasks } from "../hooks/useSalesTasks";
import { useProgrammeGantt, useProgrammeResourceLoad } from "../hooks/useSalesProgrammes";
import ProgrammeGantt from "../components/ProgrammeGantt";
import ResourceLoadView from "../components/ResourceLoadView";
import DependencyGraph from "../components/DependencyGraph";
import {
  formatCurrency, formatCurrencyCompact, formatPercent, formatDate,
  PROGRAMME_STATUS_STYLES, PRIORITY_STYLES, STATUS_STYLES,
  MILESTONE_STATUS_STYLES, HEALTH_STYLES, TASK_TYPE_LABELS,
  calcAttainment, getHealthLabel, getUserName
} from "../utils/salesTaskUtils";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "milestones", label: "Milestones", icon: Milestone },
  { id: "team", label: "Team", icon: Users },
  { id: "gantt", label: "Gantt", icon: GanttChartSquare },
  { id: "dependencies", label: "Dependencies", icon: List },
];

const SalesProgrammeDetail = () => {
  const { programmeId } = useParams();
  const navigate = useNavigate();
  const { programme, loading, error } = useSalesProgramme(programmeId);
  const { tasks, loading: tasksLoading } = useSalesTasks({ programme: programmeId });
  const { ganttData, loading: ganttLoading } = useProgrammeGantt(programmeId);
  const { resourceLoad, loading: resourceLoading } = useProgrammeResourceLoad(programmeId);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTaskForTime, setSelectedTaskForTime] = useState(null);

  if (!programmeId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/30">No programme ID provided</p>
      </div>
    );
  }

  // ── Derived Data ─────────────────────────────────────────────────────────
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const todoTasks = tasks.filter((t) => t.status === "TODO" || t.status === "BACKLOG").length;

  const taskCompletionPct = tasks.length > 0 ? Math.round(doneTasks / tasks.length * 100) : 0;
  const revenueAttainment = calcAttainment(programme?.actual_revenue, programme?.target_revenue);

  const healthScore = Math.round(
    taskCompletionPct * 0.3 +
    revenueAttainment * 0.4 +
    ((programme?.milestones?.length > 0
      ? programme.milestones.filter((m) => m.status === "ACHIEVED").length / programme.milestones.length * 100
      : 0) * 0.3)
  );

  const healthStatus = healthScore >= 80 ? "on_track" : healthScore >= 50 ? "at_risk" : "behind";

  const getStatusIcon = (status) => {
    if (status === "on_track") return CheckCircle;
    if (status === "at_risk") return AlertTriangle;
    return AlertCircle;
  };

  const StatusIcon = getStatusIcon(healthStatus);

  // ── Tab Content Renderers ────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "tasks": return renderTasks();
      case "milestones": return renderMilestones();
      case "team": return <ResourceLoadView members={programme?.team_members || []} allocations={resourceLoad || []} />;
      case "gantt": return <ProgrammeGantt ganttData={ganttData} loading={ganttLoading} />;
      case "dependencies": return <DependencyGraph tasks={tasks} dependencies={tasks.flatMap((t) => t.dependencies || [])} />;
      default: return null;
    }
  };

  // ── Overview Tab ─────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={14} className="text-blue-400" />
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Target Revenue</p>
          </div>
          <p className="text-xl font-bold text-white font-mono">{formatCurrency(programme?.target_revenue)}</p>
        </div>
        <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-emerald-400" />
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Actual Revenue</p>
          </div>
          <p className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(programme?.actual_revenue)}</p>
        </div>
        <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <ListTodo size={14} className="text-amber-400" />
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Tasks Completed</p>
          </div>
          <p className="text-xl font-bold text-white">{doneTasks}/{tasks.length}</p>
          <p className="text-[10px] text-white/30 mt-1">{taskCompletionPct}% completion</p>
        </div>
        <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-purple-400" />
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Health Score</p>
          </div>
          <div className="flex items-center gap-3">
            <p className={cn("text-xl font-bold font-mono", {
              "text-emerald-400": healthStatus === "on_track",
              "text-amber-400": healthStatus === "at_risk",
              "text-red-400": healthStatus === "behind",
            })}>
              {healthScore}
            </p>
            <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold border", HEALTH_STYLES[healthStatus])}>
              <StatusIcon size={10} /> {getHealthLabel(healthStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Programme Info */}
      <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
        <h3 className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-4">Programme Details</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            {programme?.description && (
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-white/50">{programme.description}</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Programme Manager</p>
                <p className="text-sm text-white font-medium">
                  {programme?.programme_manager_details ? getUserName(programme.programme_manager_details) : "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Priority</p>
                <span className={cn("inline-block text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", PRIORITY_STYLES[programme?.priority])}>
                  {programme?.priority}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-white/30" />
              <span className="text-xs text-white/50">
                {programme?.start_date ? formatDate(programme.start_date) : "—"} → {programme?.end_date ? formatDate(programme.end_date) : "—"}
              </span>
            </div>
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Team Members</p>
              <p className="text-sm text-white">{programme?.team_members?.length || 0} members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
          <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Task Completion</p>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${taskCompletionPct}%` }} />
          </div>
          <p className="text-[10px] text-white/30 mt-1.5 font-mono">{taskCompletionPct}%</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
          <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Revenue Attainment</p>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", {
              "bg-emerald-500": revenueAttainment >= 80,
              "bg-amber-500": revenueAttainment >= 50 && revenueAttainment < 80,
              "bg-red-500": revenueAttainment < 50,
            })} style={{ width: `${Math.min(revenueAttainment, 100)}%` }} />
          </div>
          <p className="text-[10px] text-white/30 mt-1.5 font-mono">{revenueAttainment}%</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
          <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Milestone Completion</p>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-purple-500 transition-all duration-500" style={{
              width: `${programme?.milestones?.length > 0
                ? Math.round(programme.milestones.filter((m) => m.status === "ACHIEVED").length / programme.milestones.length * 100)
                : 0}%`
            }} />
          </div>
          <p className="text-[10px] text-white/30 mt-1.5 font-mono">
            {programme?.milestones?.filter((m) => m.status === "ACHIEVED").length || 0}/{programme?.milestones?.length || 0}
          </p>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800">
        <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-3">Task Status Breakdown</p>
        <div className="flex gap-4">
          {[
            { label: "To Do", count: todoTasks, color: "bg-blue-400" },
            { label: "In Progress", count: inProgressTasks, color: "bg-amber-400" },
            { label: "Blocked", count: blockedTasks, color: "bg-red-400" },
            { label: "Done", count: doneTasks, color: "bg-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="flex-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 text-center">
              <p className={cn("text-xl font-bold", item.color.replace("bg-", "text-"))}>{item.count}</p>
              <p className="text-[9px] text-white/30 mt-1 uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Tasks Tab ────────────────────────────────────────────────────────────
  const renderTasks = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">All Tasks ({tasks.length})</h2>
        <button
          onClick={() => navigate(`/sales/tasks?programme=${programmeId}`)}
          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold uppercase tracking-wider"
        >
          Open Full Board
        </button>
      </div>
      {tasksLoading ? (
        <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-white/20" /></div>
      ) : tasks.length === 0 ? (
        <div className="p-8 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
          <ListTodo size={24} className="text-white/10 mx-auto mb-2" />
          <p className="text-sm text-white/30">No tasks in this programme yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between"
              onClick={() => navigate(`/sales/tasks/${task.id}`)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={cn("w-2 h-2 rounded-full shrink-0", {
                  "bg-red-400": task.priority === "CRITICAL",
                  "bg-orange-400": task.priority === "HIGH",
                  "bg-amber-400": task.priority === "MEDIUM",
                  "bg-emerald-400": task.priority === "LOW",
                })} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{task.title}</p>
                  <p className="text-[10px] text-white/30 flex items-center gap-2 mt-0.5">
                    <span>{TASK_TYPE_LABELS[task.task_type] || task.task_type}</span>
                    {task.due_date && <span>Due: {formatDate(task.due_date)}</span>}
                    {task.assigned_to_details && <span>{getUserName(task.assigned_to_details)}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", STATUS_STYLES[task.status])}>
                  {task.status}
                </span>
                {task.revenue_impact > 0 && (
                  <span className="text-[10px] text-emerald-400 font-mono">{formatCurrencyCompact(task.revenue_impact)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Milestones Tab ──────────────────────────────────────────────────────
  const renderMilestones = () => {
    const milestones = programme?.milestones || [];
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Milestones ({milestones.length})</h2>
        </div>
        {milestones.length === 0 ? (
          <div className="p-8 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
            <Milestone size={24} className="text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/30">No milestones defined yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones
              .sort((a, b) => new Date(a.target_date) - new Date(b.target_date))
              .map((ms, idx) => (
              <div key={ms.id} className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn("w-3 h-3 rounded-full border-2", {
                      "bg-emerald-400 border-emerald-400": ms.status === "ACHIEVED",
                      "bg-amber-400 border-amber-400": ms.status === "IN_PROGRESS",
                      "bg-red-400 border-red-400": ms.status === "MISSED",
                      "bg-zinc-600 border-zinc-600": ms.status === "PENDING",
                    })} />
                    {idx < milestones.length - 1 && <div className="w-0.5 h-full min-h-[24px] bg-zinc-800 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{ms.name}</p>
                      <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider", MILESTONE_STATUS_STYLES[ms.status])}>
                        {ms.status}
                      </span>
                    </div>
                    {ms.description && (
                      <p className="text-xs text-white/40 mt-1">{ms.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-white/30">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> Target: {formatDate(ms.target_date)}
                      </span>
                      {ms.completed_date && (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={10} className="text-emerald-400" /> Completed: {formatDate(ms.completed_date)}
                        </span>
                      )}
                      {ms.revenue_impact > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} className="text-emerald-400" /> {formatCurrencyCompact(ms.revenue_impact)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-10 py-8 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white transition-all">
            <ArrowLeft size={16} />
          </button>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FolderKanban size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white truncate">
                {loading ? "Loading..." : programme?.name}
              </h1>
              {programme?.status && (
                <span className={cn("text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider shrink-0", PROGRAMME_STATUS_STYLES[programme.status])}>
                  {programme.status}
                </span>
              )}
              <span className={cn("flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-sm border font-semibold uppercase tracking-wider shrink-0", HEALTH_STYLES[healthStatus])}>
                <StatusIcon size={10} />
                {getHealthLabel(healthStatus)}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-1">
              Sales Programme
              {programme?.programme_manager_details && ` · Managed by ${getUserName(programme.programme_manager_details)}`}
              {programme?.target_revenue > 0 && ` · Target: ${formatCurrencyCompact(programme.target_revenue)}`}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-zinc-800 pb-0 -mb-[1px]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-all rounded-t-lg",
                  activeTab === tab.id
                    ? "text-blue-400 bg-blue-500/10 border border-b-black border-zinc-800"
                    : "text-white/30 hover:text-white/60 border border-transparent"
                )}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 pt-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        ) : !programme ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FolderKanban size={48} className="text-white/10" />
            <p className="text-lg text-white/30 font-medium">Programme not found</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>
    </div>
  );
};

export default SalesProgrammeDetail;
