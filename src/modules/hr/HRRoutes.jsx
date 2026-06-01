import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HRProvider } from "./context/HRContext";

// ESS Pages
import ESSDashboard from "./ess/ESSDashboard";
import ESSLeaveManagement from "./ess/ESSLeaveManagement";
import ESSAttendance from "./ess/ESSAttendance";
import ESSPayroll from "./ess/ESSPayroll";

// MSS Pages (to be created)
// import MSSDashboard from './mss/MSSDashboard';

// Admin Pages
import HRAdminDashboard from './admin/HRAdminDashboard';
import EmployeeDirectory from './admin/EmployeeDirectory';
import EmployeeOnboarding from './admin/EmployeeOnboarding';
import RecruitmentDashboard from './admin/RecruitmentDashboard';
import PerformanceDashboard from './admin/PerformanceDashboard';
import ExitManagementDashboard from './admin/ExitManagementDashboard';

export const HRRoutes = () => {
  return (
    <HRProvider>
      <Routes>
        {/* ESS Portal Routes */}
        <Route path="/ess" element={<ESSDashboard />} />
        <Route path="/ess/leave" element={<ESSLeaveManagement />} />
        <Route path="/ess/attendance" element={<ESSAttendance />} />
        <Route path="/ess/payroll" element={<ESSPayroll />} />

        {/* MSS Portal Routes - To be implemented */}
        {/* <Route path="/mss" element={<MSSDashboard />} /> */}

        {/* Admin Routes */}
        <Route path="/admin" element={<HRAdminDashboard />} />
        <Route path="/admin/employees" element={<EmployeeDirectory />} />
        <Route path="/admin/employees/new" element={<EmployeeOnboarding />} />
        <Route path="/admin/recruitment" element={<RecruitmentDashboard />} />
        <Route path="/admin/performance" element={<PerformanceDashboard />} />
        <Route path="/admin/exits" element={<ExitManagementDashboard />} />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/ess" replace />} />
      </Routes>
    </HRProvider>
  );
};

export default HRRoutes;
