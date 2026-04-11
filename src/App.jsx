import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MenuProvider } from "./context/MenuContext";
import Login from "./modules/auth/pages/Login";
import Dashboard from "./modules/dashboard/pages/Dashboard";
import CRM from "./modules/crm/pages/CRM";
import Contacts from "./modules/contacts/pages/Contacts";
import DocTools from "./modules/docs/pages/DocTools";
import Inventory from "./modules/inventory/pages/Inventory";
import HR from "./modules/hr/pages/HR";
import Accounts from "./modules/accounts/pages/Accounts";
import Media from "./modules/media/pages/Media";
import LMS from "./modules/lms/pages/LMS";
import Sales from "./modules/sales/pages/Sales";
import Admin from "./modules/admin/pages/Admin";
import {
  InvoiceList,
  InvoiceDetail,
  InvoiceForm,
  ReviewDashboard,
  CompanyProfileAdmin,
} from "./modules/invoice";
import InvoiceEditPage from "./modules/invoice/pages/InvoiceEditPage";
import Layout from "./components/Layout";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <AuthProvider>
      <MenuProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes wrapped in Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crm"
              element={
                <ProtectedRoute>
                  <CRM />
                </ProtectedRoute>
              }
            />
            <Route
              path="/docs"
              element={
                <ProtectedRoute>
                  <DocTools />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr"
              element={
                <ProtectedRoute>
                  <HR />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <Accounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <Media />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lms"
              element={
                <ProtectedRoute>
                  <LMS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </MenuProvider>
    </AuthProvider>
  );
}

export default App;
