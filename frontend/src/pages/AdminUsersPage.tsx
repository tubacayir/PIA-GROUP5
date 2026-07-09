import { ShieldCheck, ShieldOff } from "lucide-react";

import StatusBadge from "../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../components/organization/AsyncStates";
import { useAsyncData } from "../features/admin/useAsyncData";
import { getAdmins } from "../features/admin/adminService";

export default function AdminUsersPage() {
  const { data: admins, loading, error } = useAsyncData(getAdmins, []);

  if (loading) {
    return <LoadingState label="Loading admins..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admins</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage System Admin accounts and their invoice-creation permission.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        A System Admin cannot create invoices by default. When adding a new admin below, you may grant them
        permission to create invoices.
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Invoice Creation</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {(admins ?? []).map((admin) => (
              <tr key={admin.id} className="border-b border-slate-100">
                <td className="px-5 py-4 font-semibold text-slate-900">{admin.email}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{admin.fullName}</td>
                <td className="px-5 py-4">
                  {admin.canCreateInvoices ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                      Allowed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <ShieldOff className="h-4 w-4" />
                      Not allowed
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={admin.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(admins ?? []).length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No admin accounts found.</p>
        )}
      </section>

    </div>
  );
}
