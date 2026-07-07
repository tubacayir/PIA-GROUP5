import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import type { UserRole } from "../../types/entities";

const ROLE_LABELS: Record<UserRole, string> = {
  Customer: "Customer",
  OrganizationAdmin: "Corporate",
  SystemAdmin: "System Admin",
};

export default function NavBar() {
  const logout = useAuthStore((state) => state.logout);
  const loginType = useAuthStore((state) => state.loginType);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="flex gap-6 p-4 bg-gray-800 text-white items-center">
      <Link to="/" className="hover:underline">Customers</Link>
      <Link to="/invoices" className="hover:underline">Invoices</Link>
      <Link to="/dashboard" className="hover:underline">Dashboard</Link>

      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {loginType ? ROLE_LABELS[loginType] : ""} session
        </span>
        <button onClick={handleLogout} className="hover:underline text-sm">
          Logout
        </button>
      </div>
    </nav>
  );
}