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
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      case "ONBOARDING":
        return "bg-purple-100 text-purple-800";
      case "NOTICE_PERIOD":
        return "bg-orange-100 text-orange-800";
      case "SEPARATED":
        return "bg-red-100 text-red-800";
      case "PRESENT":
        return "bg-green-100 text-green-800";
      case "ABSENT":
        return "bg-red-100 text-red-800";
      case "HALF_DAY":
        return "bg-yellow-100 text-yellow-800";
      case "WFH":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}
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
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {initials}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{employee.full_name}</h3>
          <p className="text-sm text-gray-500">{employee.employee_id}</p>
          <p className="text-sm text-gray-600">{employee.designation_name}</p>
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
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">{leaf_type_name}</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Available:</span>
          <span className="font-bold text-green-600">{current_balance}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Used:</span>
          <span className="font-bold text-orange-600">{used_days}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Pending:</span>
          <span className="font-bold text-blue-600">{pending_days}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{
              width: `${(used_days / (current_balance + used_days)) * 100 || 0}%`,
            }}
          />
        </div>
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
      case "PRESENT":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "ABSENT":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "HALF_DAY":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "WFH":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getIcon(status)}
      <span className="text-sm font-medium text-gray-700">
        {status?.replace(/_/g, " ")}
      </span>
      {workingHours > 0 && (
        <span className="text-sm text-gray-500">({workingHours}h)</span>
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
    <div className="bg-white rounded-lg shadow p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">
            {application.employee_name}
          </h3>
          <p className="text-sm text-gray-600">{application.leave_type_name}</p>
        </div>
        <StatusBadge status={application.approval_status} />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <CalendarDays className="w-4 h-4" />
        <span>
          {application.date_from} to {application.date_to} (
          {application.number_of_days} days)
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-3">{application.reason}</p>

      {showActions && application.approval_status === "PENDING" && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove?.(application.id)}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => onReject?.(application.id)}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
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
            className="w-full px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm font-medium"
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold text-lg text-gray-900 mb-4">Salary Structure</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-gray-600">CTC (Cost to Company):</span>
          <span className="font-bold text-lg">
            ₹{salary.ctc?.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-gray-600">Gross Salary:</span>
          <span className="font-bold">
            ₹{salary.gross_salary?.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-gray-600">Basic Salary:</span>
          <span className="font-bold">
            ₹{salary.basic_salary?.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-gray-600 font-medium">Net Salary:</span>
          <span className="font-bold text-green-600 text-lg">
            ₹{salary.net_salary?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Effective from: {salary.effective_from}
      </p>
    </div>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================

export const EmptyState = ({ title, description, icon: Icon }) => {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
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
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
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
