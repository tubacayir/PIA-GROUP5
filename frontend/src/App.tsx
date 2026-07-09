import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import OrganizationLayout from "./components/layout/OrganizationLayout";

import DashboardPage from "./pages/DashboardPage";
import CustomerListPage from "./pages/CustomerListPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import CompanyListPage from "./pages/CompanyListPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";

import OrganizationDashboardPage from "./pages/organization/OrganizationDashboardPage";
import EmployeeListPage from "./pages/organization/EmployeeListPage";
import EmployeeDetailPage from "./pages/organization/EmployeeDetailPage";
import UsageAnalyticsPage from "./pages/organization/UsageAnalyticsPage";
import OrganizationInvoiceListPage from "./pages/organization/InvoiceListPage";
import OrganizationInvoiceDetailPage from "./pages/organization/InvoiceDetailPage";

import LandingPage from "./features/auth/LandingPage";
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<LoginPage variant="admin" />} />
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
                path="/customer"
                element={<CustomerListPage />}
              />

              <Route
                path="/customer/:id"
                element={<CustomerDetailPage />}
              />

              <Route
                path="/companies"
                element={<CompanyListPage />}
              />

              <Route
                path="/companies/:id"
                element={<CompanyDetailPage />}
              />

              <Route
                path="/admins"
                element={<AdminUsersPage />}
              />

              <Route
                path="/analytics"
                element={<AnalyticsPage />}
              />

              <Route
                path="/recommendations"
                element={<RecommendationsPage />}
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
            <Route element={<OrganizationLayout />}>
              <Route
                path="/organization/dashboard"
                element={<OrganizationDashboardPage />}
              />

              <Route
                path="/organization/employees"
                element={<EmployeeListPage />}
              />

              <Route
                path="/organization/employees/:id"
                element={<EmployeeDetailPage />}
              />

              <Route
                path="/organization/usage-analytics"
                element={<UsageAnalyticsPage />}
              />

              <Route
                path="/organization/invoices"
                element={<OrganizationInvoiceListPage />}
              />

              <Route
                path="/organization/invoices/:id"
                element={<OrganizationInvoiceDetailPage />}
              />
            </Route>
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
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
