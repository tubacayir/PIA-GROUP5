import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import CustomerListPage from "./pages/CustomerListPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<CustomerListPage />} />
        <Route path="/faturalar" element={<InvoiceListPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;