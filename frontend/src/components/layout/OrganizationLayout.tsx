import { Outlet } from "react-router-dom";

import OrganizationSidebar from "./OrganizationSidebar";

export default function OrganizationLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <OrganizationSidebar />

      <main className="ml-64 min-h-screen w-[calc(100%-16rem)] p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
