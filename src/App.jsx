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
import AdminMenus from "./modules/admin/pages/AdminMenus";
import AdminMenuForm from "./modules/admin/pages/AdminMenuForm";
import AdminMenuRoles from "./modules/admin/pages/AdminMenuRoles";
import AdminOrganizations from "./modules/admin/pages/AdminOrganizations";
import AdminProducts from "./modules/admin/pages/AdminProducts";
import {
  InvoiceList,
  InvoiceDetail,
  ReviewDashboard,
  CompanyProfileAdmin,
} from "./modules/invoice";
import InvoiceCreatePage from "./modules/invoice/pages/InvoiceCreatePage";
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

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = ['Admin', 'Manager'].includes(user.role) || user.is_staff;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

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

            {/* Protected Routes */}
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
              path="/contacts"
              element={
                <ProtectedRoute>
                  <Contacts />
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

            {/* Invoice routes */}
            <Route path="/invoice" element={<Navigate to="/invoices" replace />} />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <div className="p-8"><InvoiceList /></div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/new"
              element={
                <ProtectedRoute>
                  <InvoiceCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute>
                  <div className="p-8"><InvoiceDetail /></div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id/edit"
              element={
                <ProtectedRoute>
                  <InvoiceEditPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menus"
              element={
                <ProtectedRoute>
                  <AdminMenus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menus/roles"
              element={
                <ProtectedRoute>
                  <AdminMenuRoles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menus/create"
              element={
                <ProtectedRoute>
                  <AdminMenuForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menus/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminMenuForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organizations"
              element={
                <ProtectedRoute>
                  <AdminOrganizations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invoices"
              element={
                <AdminRoute>
                  <div className="p-8"><ReviewDashboard /></div>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/company-profile"
              element={
                <AdminRoute>
                  <div className="p-8"><CompanyProfileAdmin /></div>
                </AdminRoute>
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
