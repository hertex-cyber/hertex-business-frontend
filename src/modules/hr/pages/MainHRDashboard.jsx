import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Shield,
  LogOut,
  DollarSign,
  Settings,
  Clock,
  Award,
  Bell,
  User,
  CheckCircle2,
  AlertCircle,
  Loader,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

const TABS = {
  OVERVIEW: "overview",
  MODULES: "modules",
};

const MainHRDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingLeaves: 0,
    openRequisitions: 0,
    overdueCompliance: 0,
    upcomingEvents: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, leaveRes, reqRes, compRes, holidayRes] = await Promise.all([
        axios.get("/api/hr/employees/").catch(() => ({ data: { results: [] } })),
        axios.get("/api/hr/attendance/today/").catch(() => ({ data: [] })),
        axios.get("/api/hr/leave-applications/", { params: { approval_status: "PENDING" } }).catch(() => ({ data: { results: [] } })),
        axios.get("/api/hr/job-requisitions/").catch(() => ({ data: { results: [] } })),
        axios.get("/api/hr/compliance-calendar/overdue/").catch(() => ({ data: [] })),
        axios.get("/api/hr/holidays/current_year/").catch(() => ({ data: [] })),
      ]);

      const employees = empRes.data?.results || empRes.data || [];
      const todayAttendance = attRes.data || [];
      const pendingLeaves = leaveRes.data?.results || leaveRes.data || [];
      const requisitions = reqRes.data?.results || reqRes.data || [];
      const overdueItems = compRes.data?.results || compRes.data || [];
      const holidays = holidayRes.data?.results || holidayRes.data || [];

      setData({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === "ACTIVE").length,
        presentToday: todayAttendance.filter((a) => a.status === "PRESENT").length,
        onLeave: todayAttendance.filter((a) => a.status === "ON_LEAVE").length,
        pendingLeaves: pendingLeaves.length,
        openRequisitions: requisitions.filter((r) => r.status === "Approved" || r.status === "Pending").length,
        overdueCompliance: overdueItems.length,
        upcomingEvents: [
          ...pendingLeaves.slice(0, 3).map((l) => ({
            type: "leave",
            title: `${l.employee_name || "Employee"} — ${l.leave_type_name || "Leave"}`,
            date: l.date_from,
            priority: "medium",
          })),
          ...holidays.slice(0, 3).map((h) => ({
            type: "holiday",
            title: h.name,
            date: h.holiday_date,
            priority: "low",
          })),
          ...overdueItems.slice(0, 2).map((c) => ({
            type: "compliance",
            title: `${c.compliance_type}: ${c.title}`,
            date: c.due_date,
            priority: "high",
          })),
        ],
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // STAT CARD
  // ============================================================================
  const StatCard = ({ label, value, icon, trend, accent, onClick }) => (
    <button
      onClick={onClick}
      className={cn(
        "p-6 rounded-2xl border transition-all duration-300 group text-left w-full",
        "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/40 hover:border-zinc-700"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">{label}</p>
        <div className={cn(
          "p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110",
          accent === "blue" && "bg-blue-500/10 text-blue-400",
          accent === "green" && "bg-emerald-500/10 text-emerald-400",
          accent === "orange" && "bg-amber-500/10 text-amber-400",
          accent === "red" && "bg-red-500/10 text-red-400",
          accent === "purple" && "bg-purple-500/10 text-purple-400",
        )}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      {trend && <p className="text-[10px] text-white/30 mt-1 font-medium">{trend}</p>}
    </button>
  );

  // ============================================================================
  // MODULE CARD
  // ============================================================================
  const ModuleCard = ({ title, description, icon, path, accent }) => (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "p-6 rounded-2xl border transition-all duration-300 group text-left",
        "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/40 hover:border-zinc-700"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center border mb-5 group-hover:scale-110 transition-transform duration-300",
        accent === "blue" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
        accent === "purple" && "bg-purple-500/10 border-purple-500/20 text-purple-400",
        accent === "green" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        accent === "orange" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
        accent === "red" && "bg-red-500/10 border-red-500/20 text-red-400",
        accent === "cyan" && "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
        accent === "pink" && "bg-pink-500/10 border-pink-500/20 text-pink-400",
        accent === "gray" && "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
      )}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-[10px] text-white/40 leading-relaxed font-medium">{description}</p>
    </button>
  );

  // ============================================================================
  // EVENT ITEM
  // ============================================================================
  const EventItem = ({ event }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className={cn(
        "p-2 rounded-lg",
        event.priority === "high" ? "bg-red-500/10 text-red-400" :
        event.priority === "medium" ? "bg-amber-500/10 text-amber-400" :
        "bg-blue-500/10 text-blue-400"
      )}>
        {event.type === "leave" ? <Calendar size={14} /> :
         event.type === "compliance" ? <AlertCircle size={14} /> :
         <Bell size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{event.title}</p>
        <p className="text-[9px] text-white/40 mt-0.5">{event.date}</p>
      </div>
      <span className={cn(
        "text-[8px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider",
        event.priority === "high" ? "bg-red-500/10 text-red-400" :
        event.priority === "medium" ? "bg-amber-500/10 text-amber-400" :
        "bg-blue-500/10 text-blue-400"
      )}>
        {event.priority}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-black">
        <header className="px-10 py-8 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-white">HR Dashboard</h1>
          <p className="text-sm text-white/40 font-medium mt-1">Loading your workspace...</p>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader size={24} className="text-blue-400 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      {/* === UNIFIED HEADER === */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-zinc-800 shrink-0 bg-black/50 backdrop-blur-xl z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">
            <Briefcase size={10} className="text-blue-400" />
            Human Resources
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">HR Dashboard</h1>
          <p className="text-sm text-white/40 font-medium">
            Enterprise HR management at a glance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
            <div
              className={cn(
                "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
                activeTab === TABS.OVERVIEW
                  ? "left-0 w-1/2 rounded-l rounded-r-none bg-blue-500/20"
                  : "left-1/2 w-1/2 rounded-r rounded-l-none bg-blue-500/20"
              )}
            />
            <button
              onClick={() => setActiveTab(TABS.OVERVIEW)}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === TABS.OVERVIEW ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab(TABS.MODULES)}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === TABS.MODULES ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Modules
            </button>
          </div>

          <button
            onClick={() => navigate("/hr/admin")}
            className="h-9 px-4 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-[10px] font-medium uppercase tracking-[0.2em]"
          >
            Admin Panel
          </button>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {activeTab === TABS.OVERVIEW && (
          <div className="space-y-10">
            {/* ---- Metrics Grid ---- */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Key Metrics</h2>
                <span className="text-[9px] text-white/20">Updated live</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="Total Employees"
                  value={data.totalEmployees}
                  trend={`${data.activeEmployees} active`}
                  icon={<Users size={18} />}
                  accent="blue"
                  onClick={() => navigate("/hr/admin/employees")}
                />
                <StatCard
                  label="Present Today"
                  value={data.presentToday}
                  trend={`${data.onLeave} on leave`}
                  icon={<Clock size={18} />}
                  accent="green"
                />
                <StatCard
                  label="Pending Leaves"
                  value={data.pendingLeaves}
                  trend="Awaiting approval"
                  icon={<Calendar size={18} />}
                  accent="orange"
                  onClick={() => navigate("/hr/admin")}
                />
                <StatCard
                  label="Compliance Overdue"
                  value={data.overdueCompliance}
                  trend="Needs attention"
                  icon={<AlertCircle size={18} />}
                  accent={data.overdueCompliance > 0 ? "red" : "green"}
                  onClick={() => navigate("/hr/admin/compliance")}
                />
              </div>
            </div>

            {/* ---- Quick Stats Row ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Open Requisitions */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Recruitment</p>
                    <p className="text-2xl font-bold text-white mt-1">{data.openRequisitions}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                    <Briefcase size={20} />
                  </div>
                </div>
                <p className="text-[10px] text-white/30 mb-4">Open positions to fill</p>
                <button
                  onClick={() => navigate("/hr/admin/recruitment")}
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  View Recruitment <ChevronRight size={12} />
                </button>
              </div>

              {/* Quick Access */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Employee Self-Service</p>
                    <p className="text-sm text-white mt-1">Access your portal</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <User size={20} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate("/hr/ess")}
                    className="flex-1 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
                    ESS Portal
                  </button>
                  <button onClick={() => navigate("/hr/mss")}
                    className="flex-1 px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
                    Manager Portal
                  </button>
                </div>
              </div>
            </div>

            {/* ---- Upcoming Events ---- */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Upcoming Events & Alerts</h2>
                <span className="text-[9px] text-white/20">{data.upcomingEvents.length} items</span>
              </div>
              {data.upcomingEvents.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-center">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-xs text-white/40">All clear — no pending events or alerts.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.upcomingEvents.map((event, i) => (
                    <EventItem key={i} event={event} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === TABS.MODULES && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">All HR Modules</h2>
              <span className="text-[9px] text-white/20">10 modules</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ModuleCard title="Employee Master" description="Manage employee database, profiles, and onboarding" icon={<Users size={22} />} path="/hr/admin/employees" accent="blue" />
              <ModuleCard title="Recruitment & ATS" description="Job requisitions, candidates, and interview pipelines" icon={<Briefcase size={22} />} path="/hr/admin/recruitment" accent="purple" />
              <ModuleCard title="Payroll & Salary" description="Salary structures, payroll, loans, and reimbursements" icon={<DollarSign size={22} />} path="/hr/admin" accent="green" />
              <ModuleCard title="Performance (PMS)" description="Appraisals, goals, 360° feedback, and calibration" icon={<TrendingUp size={22} />} path="/hr/admin/performance" accent="orange" />
              <ModuleCard title="Statutory Compliance" description="PF, ESI, PT, TDS, Gratuity, Bonus automation" icon={<Shield size={22} />} path="/hr/admin/compliance" accent="red" />
              <ModuleCard title="Attendance & Shifts" description="Shift management, tracking, overtime" icon={<Clock size={22} />} path="/hr/admin" accent="cyan" />
              <ModuleCard title="Leave & Holidays" description="Leave types, policies, and holiday calendars" icon={<Calendar size={22} />} path="/hr/admin" accent="purple" />
              <ModuleCard title="Exit Management" description="Resignations, clearances, and F&F settlements" icon={<LogOut size={22} />} path="/hr/admin/exits" accent="red" />
              <ModuleCard title="Training & L&D" description="Training programs, nominations, skill matrix" icon={<Award size={22} />} path="/hr/admin" accent="pink" />
              <ModuleCard title="Master Data" description="Designations, locations, cost centers, shifts" icon={<Settings size={22} />} path="/hr/admin" accent="gray" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainHRDashboard;
