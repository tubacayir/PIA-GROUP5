import { useState } from "react";
import { Plus, ShieldCheck, ShieldOff } from "lucide-react";

import Modal from "../components/admin/Modal";
import StatusBadge from "../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../components/organization/AsyncStates";
import { useAsyncData } from "../features/admin/useAsyncData";
import { createAdmin, getAdmins } from "../features/admin/adminService";

export default function AdminUsersPage() {
  const { data: admins, loading, error, setData } = useAsyncData(getAdmins, []);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [canCreateInvoices, setCanCreateInvoices] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setCanCreateInvoices(false);
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const created = await createAdmin({ email, password, fullName, canCreateInvoices });
      setData((current) => (current ? [...current, created] : [created]));
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "İşlem başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading admins..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admins</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage System Admin accounts and their invoice-creation permission.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Admin
        </button>
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

      {showCreateModal && (
        <Modal
          title="New Admin"
          subtitle="Add a new System Admin account."
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </div>

            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={canCreateInvoices}
                onChange={(event) => setCanCreateInvoices(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Allow this admin to create invoices
            </label>

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create Admin"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
