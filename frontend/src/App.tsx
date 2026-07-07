import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";

import DashboardPage from "./pages/DashboardPage";
import CustomerListPage from "./pages/CustomerListPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import OrganizationDashboardPage from "./pages/OrganizationDashboardPage";

import LoginPage from "./features/auth/LoginPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import RoleRoute from "./features/auth/RoleRoute";
import LogoutPage from "./features/auth/LogoutPage";


function SystemAdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 min-h-screen w-[calc(100%-16rem)] bg-slate-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div>
      <h1>Yetkisiz Erişim</h1>
      <p>Bu sayfayı görüntüleme yetkiniz yok.</p>
    </div>
  );
}







function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />

        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* System Admin */}
          <Route
            element={
              <RoleRoute allowedRoles={["SYSTEM_ADMIN"]} />
            }
          >
            <Route element={<SystemAdminLayout />}>
              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />

              <Route
                path="/customers"
                element={<CustomerListPage />}
              />

              <Route
                path="/customers/:id"
                element={<CustomerDetailPage />}
              />

              <Route
                path="/invoices"
                element={<InvoiceListPage />}
              />

              <Route
                path="/faturalar"
                element={
                  <Navigate to="/invoices" replace />
                }
              />
            </Route>
          </Route>

          {/* Organization Admin */}
          <Route
            element={
              <RoleRoute
                allowedRoles={["ORGANIZATION_ADMIN"]}
              />
            }
          >
            <Route
  path="/organization/dashboard"
  element={<OrganizationDashboardPage />}
/>
          </Route>

          {/* Customer */}
          <Route
            element={
              <RoleRoute allowedRoles={["CUSTOMER"]} />
            }
          >
            <Route
  path="/customer/profile"
  element={<CustomerProfilePage />}
/>
          </Route>
        </Route>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;