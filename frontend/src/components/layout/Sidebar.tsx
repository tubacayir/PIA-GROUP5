import {
  BarChart3,
  Building2,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../../features/auth/authStore";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    path: "/customer",
    icon: Users,
  },
  {
    label: "Companies",
    path: "/companies",
    icon: Building2,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Admins",
    path: "/admins",
    icon: ShieldCheck,
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = useAuthStore(
    (state) => state.logout
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 px-4 py-6">
      {/* Brand */}
      <div className="px-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/30">
            <ReceiptText
              size={21}
              strokeWidth={2.2}
            />
          </div>

          <div>
  <p className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-purple-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
    PiaCell
  </p>

  <p className="mt-1 text-xs font-medium text-violet-200/80">
    Admin Intelligence Portal
  </p>
</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-10">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-950/20"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon
                  size={19}
                  strokeWidth={2}
                  className="shrink-0"
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto space-y-3 px-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut
            size={19}
            strokeWidth={2}
          />

          <span>Log Out</span>
        </button>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs font-medium text-slate-300">
              System operational
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-slate-500">
          Smart billing and customer
          intelligence platform
          </p>
        </div>
      </div>
    </aside>
  );
}
