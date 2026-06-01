import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useHR } from "../context/HRContext";
import {
  attendanceAPI,
  leaveAPI,
  payrollAPI,
  employeeAPI,
} from "../services/hrAPI";
import { StatsCard, EmptyState, SalarySummaryCard } from "../shared/components";

export const ESSDashboard = () => {
  const navigate = useNavigate();
  const {
    loading,
    setLoadingState,
    error,
    setErrorState,
    leaveBalance,
    updateLeaveBalance,
    todayAttendance,
    setTodayAttendance,
    employeeSalary,
    setEmployeeSalary,
  } = useHR();

  const [stats, setStats] = useState({
    leaveBalance: 0,
    presentDays: 0,
    upcomingLeaves: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoadingState(true);
    try {
      // Fetch today's attendance
      const attendanceRes = await attendanceAPI.getTodayAttendance();
      if (attendanceRes.data && attendanceRes.data.length > 0) {
        setTodayAttendance(attendanceRes.data[0]);
      }

      // Fetch leave balance
      const leaveBalRes = await leaveAPI.getCurrentYearBalance();
      if (leaveBalRes.data) {
        updateLeaveBalance(leaveBalRes.data);
      }

      // Fetch employee salary
      const salaryRes = await payrollAPI.getEmployeeSalary();
      if (salaryRes.data && salaryRes.data.length > 0) {
        setEmployeeSalary(salaryRes.data[0]);
      }

      // Calculate stats
      const totalLeave =
        leaveBalRes.data?.reduce(
          (sum, item) => sum + (item.current_balance || 0),
          0,
        ) || 0;
      setStats((prev) => ({ ...prev, leaveBalance: totalLeave }));
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Employee Portal
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your attendance, leave, and payroll information
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Available Leave"
          value={Math.round(stats.leaveBalance)}
          subtitle="days this year"
          icon={Calendar}
          color="blue"
        />
        {todayAttendance && (
          <>
            <StatsCard
              title="Check-in Time"
              value={todayAttendance.check_in_time || "--:--"}
              subtitle="Today"
              icon={Clock}
              color="green"
            />
            <StatsCard
              title="Working Hours"
              value={todayAttendance.working_hours || 0}
              subtitle="hours today"
              icon={Clock}
              color="purple"
            />
          </>
        )}
        {employeeSalary && (
          <StatsCard
            title="Monthly CTC"
            value={`₹${(employeeSalary.ctc / 12)?.toLocaleString("en-IN")}`}
            subtitle="Net salary"
            icon={DollarSign}
            color="green"
          />
        )}
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <div
          onClick={() => navigate("attendance")}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Attendance</h2>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            View and manage your attendance records
          </p>
          {todayAttendance && (
            <div className="bg-blue-50 rounded p-3 text-sm text-blue-700">
              Status: {todayAttendance.status}
            </div>
          )}
          <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm">
            View Details →
          </button>
        </div>

        {/* Leave Card */}
        <div
          onClick={() => navigate("leave")}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Leave</h2>
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Apply and track your leave requests
          </p>
          <div className="bg-green-50 rounded p-3 text-sm text-green-700">
            Available: {Math.round(stats.leaveBalance)} days
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm">
            Manage Leave →
          </button>
        </div>

        {/* Payroll Card */}
        <div
          onClick={() => navigate("payroll")}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Payroll</h2>
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            View payslips and salary information
          </p>
          {employeeSalary && (
            <div className="bg-purple-50 rounded p-3 text-sm text-purple-700">
              CTC: ₹{employeeSalary.ctc?.toLocaleString("en-IN")}
            </div>
          )}
          <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium text-sm">
            View Payroll →
          </button>
        </div>

        {/* Profile Card */}
        <div
          onClick={() => navigate("profile")}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Profile</h2>
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Manage your personal information
          </p>
          <div className="bg-orange-50 rounded p-3 text-sm text-orange-700">
            Update your details
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium text-sm">
            View Profile →
          </button>
        </div>
      </div>

      {/* Salary Summary */}
      {employeeSalary && (
        <div className="mt-8">
          <SalarySummaryCard salary={employeeSalary} />
        </div>
      )}
    </div>
  );
};

export default ESSDashboard;
