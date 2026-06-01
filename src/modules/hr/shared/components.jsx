import React from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

// ============================================================================
// STATUS BADGES
// ============================================================================

export const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "PENDING": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "APPROVED": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "REJECTED": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "CANCELLED": return "bg-white/10 text-white/40 border border-white/10";
      case "ONBOARDING": return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "NOTICE_PERIOD": return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "SEPARATED": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "PRESENT": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "ABSENT": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "HALF_DAY": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "WFH": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default: return "bg-white/5 text-white/40 border border-white/10";
    }
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
};

// ============================================================================
// EMPLOYEE CARD
// ============================================================================

export const EmployeeCard = ({ employee, onClick }) => {
  const initials =
    `${employee.first_name?.[0] || ""}${employee.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {initials}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{employee.full_name}</h3>
          <p className="text-xs text-white/50">{employee.employee_id}</p>
          <p className="text-sm text-white/60">{employee.designation_name}</p>
        </div>
        <StatusBadge status={employee.status} />
      </div>
    </div>
  );
};

// ============================================================================
// LEAVE STATUS CARD
// ============================================================================

export const LeaveStatusCard = ({ leaveData }) => {
  const { leaf_type_name, current_balance, used_days, pending_days } =
    leaveData;

  return (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
      <h3 className="font-semibold text-white mb-4">{leaf_type_name}</h3>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Available:</span>
          <span className="font-bold text-green-400">{current_balance}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Used:</span>
          <span className="font-bold text-orange-400">{used_days}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Pending:</span>
          <span className="font-bold text-blue-400">{pending_days}</span>
        </div>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full"
          style={{
            width: `${Math.min((used_days / (current_balance + used_days || 1)) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// ATTENDANCE STATUS
// ============================================================================

export const AttendanceStatus = ({ status, workingHours = 0 }) => {
  const getIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "PRESENT": return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "ABSENT": return <XCircle className="w-4 h-4 text-red-400" />;
      case "HALF_DAY": return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "WFH": return <Clock className="w-4 h-4 text-blue-400" />;
      default: return <Clock className="w-4 h-4 text-white/40" />;
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60">
      {getIcon(status)}
      <span>{status?.replace(/_/g, " ")}</span>
      {workingHours > 0 && (
        <span className="text-white/40">({workingHours}h)</span>
      )}
    </div>
  );
};

// ============================================================================
// LEAVE APPLICATION CARD
// ============================================================================

export const LeaveApplicationCard = ({
  application,
  onApprove,
  onReject,
  onCancel,
  showActions = true,
}) => {
  return (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-white">
            {application.employee_name}
          </h3>
          <p className="text-xs text-white/50">{application.leave_type_name}</p>
        </div>
        <StatusBadge status={application.approval_status} />
      </div>
      <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
        <CalendarDays className="w-4 h-4 text-white/40" />
        <span>
          {application.date_from} to {application.date_to} (
          {application.number_of_days} days)
        </span>
      </div>
      <p className="text-sm text-white/60 mb-3">{application.reason}</p>

      {showActions && application.approval_status === "PENDING" && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove?.(application.id)}
            className="flex-1 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 text-sm font-medium transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => onReject?.(application.id)}
            className="flex-1 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 text-sm font-medium transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {showActions &&
        application.approval_status === "APPROVED" &&
        !application.is_cancelled && (
          <button
            onClick={() => onCancel?.(application.id)}
            className="w-full px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        )}
    </div>
  );
};

// ============================================================================
// SALARY SUMMARY CARD
// ============================================================================

export const SalarySummaryCard = ({ salary }) => {
  if (!salary) return null;

  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
      <h3 className="font-bold text-lg text-white mb-6">Salary Structure</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <p className="text-xs text-white/40 mb-1">CTC (Annual)</p>
          <p className="text-lg font-bold text-white">₹{salary.ctc?.toLocaleString("en-IN")}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <p className="text-xs text-white/40 mb-1">Gross Salary</p>
          <p className="text-lg font-bold text-white">₹{salary.gross_salary?.toLocaleString("en-IN")}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <p className="text-xs text-white/40 mb-1">Basic Salary</p>
          <p className="text-lg font-bold text-white">₹{salary.basic_salary?.toLocaleString("en-IN")}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
          <p className="text-xs text-emerald-400/60 mb-1">Net Salary</p>
          <p className="text-lg font-bold text-emerald-400">₹{salary.net_salary?.toLocaleString("en-IN")}</p>
        </div>
      </div>
      <p className="text-xs text-white/30 mt-4">Effective from: {salary.effective_from}</p>
    </div>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================

export const EmptyState = ({ title, description, icon: Icon }) => {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="w-12 h-12 text-white/20 mx-auto mb-4" />}
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-white/50 text-sm">{description}</p>
    </div>
  );
};

// ============================================================================
// STATS CARD
// ============================================================================

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}) => {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
    red: "bg-red-500/10 text-red-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/40">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`${colorMap[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
