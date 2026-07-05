import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import CustomerListPage from "./pages/CustomerListPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <main className="ml-64 min-h-screen p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/customers" element={<CustomerListPage />} />

            <Route path="/invoices" element={<InvoiceListPage />} />

            
            <Route
              path="/faturalar"
              element={<Navigate to="/invoices" replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;