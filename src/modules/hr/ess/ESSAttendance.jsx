import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Loader,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHR } from "../context/HRContext";
import { attendanceAPI } from "../services/hrAPI";
import { AttendanceStatus, StatsCard, EmptyState } from "../shared/components";
import {
  formatDate,
  formatTime,
  calculateWorkingHours,
} from "../utils/helpers";

export const ESSAttendance = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, error, setErrorState } = useHR();
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyStats, setMonthlyStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    wfh: 0,
  });

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth, selectedYear]);

  const fetchAttendanceData = async () => {
    setLoadingState(true);
    try {
      // Fetch today's attendance
      const todayRes = await attendanceAPI.getTodayAttendance();
      if (todayRes.data && todayRes.data.length > 0) {
        const today = todayRes.data[0];
        setTodayAttendance(today);
        setCheckedIn(!!today.check_in_time);
      }

      // Fetch monthly attendance
      const monthlyRes = await attendanceAPI.getMonthlyReport(
        selectedMonth,
        selectedYear,
      );
      if (monthlyRes.data) {
        const stats = monthlyRes.data;
        setMonthlyStats({
          present: stats.present_days || 0,
          absent: stats.absent_days || 0,
          halfDay: stats.half_day_count || 0,
          wfh: stats.wfh_days || 0,
        });
      }

      // Fetch full attendance records
      const attendanceRes = await attendanceAPI.getAttendance({
        date__month: selectedMonth,
        date__year: selectedYear,
      });
      setAttendance(attendanceRes.data || []);
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoadingState(true);
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-GB").split(" ")[0]; // HH:MM:SS

      await attendanceAPI.checkIn({
        date: now.toISOString().split("T")[0],
        check_in_time: timeString,
        check_in_location: "Office",
        status: "PRESENT",
      });

      setCheckedIn(true);
      fetchAttendanceData();
    } catch (err) {
      setErrorState(err.response?.data?.detail || err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    try {
      setLoadingState(true);
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-GB").split(" ")[0];

      await attendanceAPI.checkOut(todayAttendance.id, {
        check_out_time: timeString,
        check_out_location: "Office",
      });

      fetchAttendanceData();
    } catch (err) {
      setErrorState(err.response?.data?.detail || err.message);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track your daily check-in and check-out
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Today's Check-in/out */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Today's Attendance
        </h2>

        {todayAttendance ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Check-in Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayAttendance.check_in_time
                  ? formatTime(todayAttendance.check_in_time)
                  : "--:--"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Location: {todayAttendance.check_in_location}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Check-out Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayAttendance.check_out_time
                  ? formatTime(todayAttendance.check_out_time)
                  : "--:--"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Working Hours: {todayAttendance.working_hours || 0}h
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex gap-3 mt-6">
          {!checkedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              {loading ? "Checking In..." : "Check In"}
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              {loading ? "Checking Out..." : "Check Out"}
            </button>
          )}
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Present"
          value={monthlyStats.present}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Absent"
          value={monthlyStats.absent}
          icon={AlertCircle}
          color="red"
        />
        <StatsCard
          title="Half Days"
          value={monthlyStats.halfDay}
          icon={Calendar}
          color="yellow"
        />
        <StatsCard
          title="Work From Home"
          value={monthlyStats.wfh}
          icon={MapPin}
          color="blue"
        />
      </div>

      {/* Month Filter */}
      <div className="mb-6 flex gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      {/* Attendance Records */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Attendance Records -{" "}
          {new Date(2000, selectedMonth - 1).toLocaleString("default", {
            month: "long",
          })}{" "}
          {selectedYear}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : attendance.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Working Hours
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {record.check_in_time
                        ? formatTime(record.check_in_time)
                        : "--"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {record.check_out_time
                        ? formatTime(record.check_out_time)
                        : "--"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {record.working_hours || 0}h
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <AttendanceStatus status={record.status} />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {record.is_late && (
                        <span className="text-orange-600">Late</span>
                      )}
                      {record.is_regularized && (
                        <span className="text-green-600">Regularized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No attendance records"
            description={`No attendance records for ${new Date(2000, selectedMonth - 1).toLocaleString("default", { month: "long" })} ${selectedYear}`}
            icon={Calendar}
          />
        )}
      </div>
    </div>
  );
};

export default ESSAttendance;
