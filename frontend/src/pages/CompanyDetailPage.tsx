import { useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import CompanyFormModal from "../components/admin/CompanyFormModal";
import StatusBadge from "../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../components/organization/AsyncStates";
import { useAsyncData } from "../features/admin/useAsyncData";
import { deleteOrganization, getOrganization, updateOrganization } from "../features/admin/adminService";
import { formatCurrency, formatDate } from "../features/admin/format";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyDetailContent key={id} organizationId={Number(id)} />;
}

function CompanyDetailContent({ organizationId }: { organizationId: number }) {
  const navigate = useNavigate();
  const { data: organization, loading, error, setData } = useAsyncData(
    () => getOrganization(organizationId),
    [organizationId]
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <LoadingState label="Loading company..." />;
  }

  if (error || !organization) {
    return <ErrorState message={error ?? "Company not found."} />;
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${organization.name}? This can't be undone from the UI.`)) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteOrganization(organization.id);
      navigate("/companies");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Silme işlemi başarısız oldu.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </Link>
      </div>

      {deleteError && <ErrorState message={deleteError} />}

      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-xl lg:p-8">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#fff" }}>{organization.name}</h1>
            <p className="mt-1 text-sm text-slate-300">
              {organization.taxIdentityNumber} · {organization.sector} · {organization.city}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={organization.status} />

            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Employee Count</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{organization.employeeCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Subscriptions</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{organization.subscriptionCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Subscriptions</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{organization.activeSubscriptionCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Billed</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(organization.totalBilledAmount)}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-950">Subscriptions</h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Package</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {organization.subscriptions.map((subscription) => (
              <tr key={subscription.id} className="border-b border-slate-100">
                <td className="px-5 py-4 font-semibold text-slate-900">{subscription.phoneNumber}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{subscription.employeeName}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{subscription.tariffPackage.packageName}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={subscription.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {organization.subscriptions.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No subscriptions found.</p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-950">Recent Invoices</h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Invoice</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Issue Date</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {organization.invoiceHistory.slice(0, 20).map((invoice) => (
              <tr key={invoice.id} className="border-b border-slate-100">
                <td className="px-5 py-4 font-semibold text-slate-900">{invoice.invoiceNumber}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{invoice.employeeName}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{formatDate(invoice.issueDate)}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={invoice.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {organization.invoiceHistory.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No invoices found.</p>
        )}
      </section>

      {showEditModal && (
        <CompanyFormModal
          mode="edit"
          initialValues={organization}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (values) => {
            const updated = await updateOrganization(organization.id, {
              name: values.name,
              sector: values.sector,
              employeeCount: values.employeeCount,
              city: values.city,
            });
            setData((current) =>
              current
                ? {
                    ...current,
                    name: updated.name,
                    sector: updated.sector,
                    employeeCount: values.employeeCount,
                    city: updated.city,
                  }
                : current
            );
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}
