import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-gray-950 px-5 py-6">
      <div>
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Invoice Platform
          </p>

          <h1 className="mt-2 text-2xl font-bold text-white">
            Invoice Insight
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Management & Analytics
          </p>
        </div>

        <nav className="space-y-2">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/customers" className={linkClass}>
            Customers
          </NavLink>

          <NavLink to="/invoices" className={linkClass}>
            Invoices
          </NavLink>
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-800 pt-5">
        <p className="text-xs text-gray-500">
          Customer Invoice Management
        </p>
      </div>
    </aside>
  );
}