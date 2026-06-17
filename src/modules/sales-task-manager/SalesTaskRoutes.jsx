import React from "react";
import { Routes, Route } from "react-router-dom";

import { SalesTaskProvider } from "./context/SalesTaskContext";
import TargetCycleList from "./pages/TargetCycleList";
import TargetCycleDetail from "./pages/TargetCycleDetail";
import SalesTargetDetail from "./pages/SalesTargetDetail";
import SalesProgrammeDetail from "./pages/SalesProgrammeDetail";
import TaskBoard from "./pages/TaskBoard";
import TaskDetail from "./pages/TaskDetail";
import DashboardMyView from "./pages/DashboardMyView";
import DashboardManager from "./pages/DashboardManager";
import DashboardExecutive from "./pages/DashboardExecutive";

const SalesTaskRoutes = () => {
  return (
    <SalesTaskProvider>
    <Routes>
      {/* Default view — render TaskBoard directly to avoid redirect loop */}
      <Route path="/" element={<TaskBoard />} />

      {/* Target Cycles */}
      <Route path="/targets" element={<TargetCycleList />} />
      <Route path="/targets/:cycleId" element={<TargetCycleDetail />} />
      <Route path="/targets/:cycleId/:targetId" element={<SalesTargetDetail />} />

      {/* Sales Programmes */}
      <Route path="/programmes/:programmeId" element={<SalesProgrammeDetail />} />

      {/* Task Board */}
      <Route path="/tasks" element={<TaskBoard />} />
      <Route path="/tasks/:taskId" element={<TaskDetail />} />

      {/* Dashboards */}
      <Route path="/dashboard" element={<DashboardMyView />} />
      <Route path="/dashboard/team" element={<DashboardManager />} />
      <Route path="/dashboard/executive" element={<DashboardExecutive />} />
    </Routes>
    </SalesTaskProvider>
  );
};

export default SalesTaskRoutes;
