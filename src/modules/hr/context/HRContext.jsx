import React, { createContext, useContext, useState, useCallback } from "react";

const HRContext = createContext();

export const HRProvider = ({ children }) => {
  // Employee data
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Attendance data
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Leave data
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);

  // Payroll data
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employeeSalary, setEmployeeSalary] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Master data
  const [designations, setDesignations] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    department: null,
    location: null,
    status: null,
  });

  // Utility functions
  const updateEmployees = useCallback((data) => {
    setEmployees(data);
    setError(null);
  }, []);

  const updateAttendance = useCallback((data) => {
    setAttendanceRecords(data);
    setError(null);
  }, []);

  const updateLeaveApplications = useCallback((data) => {
    setLeaveApplications(data);
    setError(null);
  }, []);

  const updateLeaveBalance = useCallback((data) => {
    setLeaveBalance(data);
    setError(null);
  }, []);

  const updatePayroll = useCallback((data) => {
    setPayrollRecords(data);
    setError(null);
  }, []);

  const setLoadingState = useCallback((state) => {
    setLoading(state);
  }, []);

  const setErrorState = useCallback((err) => {
    setError(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateMasterData = useCallback((type, data) => {
    switch (type) {
      case "designations":
        setDesignations(data);
        break;
      case "workLocations":
        setWorkLocations(data);
        break;
      case "shifts":
        setShifts(data);
        break;
      case "holidays":
        setHolidays(data);
        break;
      default:
        break;
    }
  }, []);

  const value = {
    // Employee data
    employees,
    selectedEmployee,
    updateEmployees,
    setSelectedEmployee,

    // Attendance data
    attendanceRecords,
    todayAttendance,
    updateAttendance,
    setTodayAttendance,

    // Leave data
    leaveApplications,
    leaveBalance,
    leaveTypes,
    updateLeaveApplications,
    updateLeaveBalance,
    setLeaveTypes,

    // Payroll data
    payrollRecords,
    employeeSalary,
    updatePayroll,
    setEmployeeSalary,

    // Loading and error
    loading,
    error,
    setLoadingState,
    setErrorState,
    clearError,

    // Master data
    designations,
    workLocations,
    shifts,
    holidays,
    updateMasterData,

    // Filters
    filters,
    setFilters,
  };

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>;
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error("useHR must be used within HRProvider");
  }
  return context;
};
