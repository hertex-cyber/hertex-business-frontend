import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HRProvider } from "./context/HRContext";

// Main Dashboard
import MainHRDashboard from "./pages/MainHRDashboard";

// ESS Pages
import ESSDashboard from "./ess/ESSDashboard";
import ESSLeaveManagement from "./ess/ESSLeaveManagement";
import ESSAttendance from "./ess/ESSAttendance";
import ESSPayroll from "./ess/ESSPayroll";
import ESSProfile from "./ess/ESSProfile";

// MSS Pages
import MSSDashboard from "./mss/MSSDashboard";

// Admin Pages
import HRAdminDashboard from './admin/HRAdminDashboard';
import EmployeeDirectory from './admin/EmployeeDirectory';
import EmployeeDetail from './admin/EmployeeDetail';
import EmployeeOnboarding from './admin/EmployeeOnboarding';
import RecruitmentDashboard from './admin/RecruitmentDashboard';
import PerformanceDashboard from './admin/PerformanceDashboard';
import ExitManagementDashboard from './admin/ExitManagementDashboard';
import ComplianceDashboard from './admin/ComplianceDashboard';

export const HRRoutes = () => {
  return (
    <HRProvider>
      <Routes>
        {/* Main Dashboard Landing */}
        <Route path="/" element={<MainHRDashboard />} />

        {/* ESS Portal Routes */}
        <Route path="/ess" element={<ESSDashboard />} />
        <Route path="/ess/leave" element={<ESSLeaveManagement />} />
        <Route path="/ess/attendance" element={<ESSAttendance />} />
        <Route path="/ess/payroll" element={<ESSPayroll />} />
        <Route path="/ess/profile" element={<ESSProfile />} />

        {/* MSS Portal Routes */}
        <Route path="/mss" element={<MSSDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<HRAdminDashboard />} />
        <Route path="/admin/employees" element={<EmployeeDirectory />} />
        <Route path="/admin/employees/new" element={<EmployeeOnboarding />} />
        <Route path="/admin/employees/:id" element={<EmployeeDetail />} />
        <Route path="/admin/recruitment" element={<RecruitmentDashboard />} />
        <Route path="/admin/performance" element={<PerformanceDashboard />} />
        <Route path="/admin/exits" element={<ExitManagementDashboard />} />
        <Route path="/admin/compliance" element={<ComplianceDashboard />} />

        {/* Placeholder redirects for other admin modules */}
        <Route path="/admin/payroll" element={<Navigate to="/admin" />} />
        <Route path="/admin/attendance" element={<Navigate to="/admin" />} />
        <Route path="/admin/leaves" element={<Navigate to="/admin" />} />
        <Route path="/admin/training" element={<Navigate to="/admin" />} />
        <Route path="/admin/settings" element={<Navigate to="/admin" />} />
        <Route path="/admin/compliance/calendar" element={<Navigate to="/admin/compliance" />} />
      </Routes>
    </HRProvider>
  );
};

export default HRRoutes;
