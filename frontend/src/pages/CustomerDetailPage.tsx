import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Gauge,
  MessageSquare,
  Pencil,
  Phone,
  Trash2,
  UserRound,
  Wifi,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import CustomerFormModal from "../components/admin/CustomerFormModal";
import StatusBadge from "../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../components/organization/AsyncStates";
import { useAsyncData } from "../features/admin/useAsyncData";
import { deleteCustomer, getCustomer, updateCustomer } from "../features/admin/adminService";
import { formatCurrency, formatDate, formatMonthLabel, formatNumber } from "../features/admin/format";

type CustomerTab = "overview" | "subscriptions" | "invoices" | "usage";

const TABS: { id: CustomerTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "invoices", label: "Invoices" },
  { id: "usage", label: "Usage" },
];

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <CustomerDetailContent key={id} customerId={Number(id)} />;
}

function UsageBar({
  icon: Icon,
  label,
  used,
  limit,
  unit,
}: {
  icon: typeof Wifi;
  label: string;
  used: number;
  limit: number;
  unit: string;
}) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const exceeds = used > limit;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <Icon className="h-4 w-4 text-slate-400" />
          {label}
        </span>
        <span className={exceeds ? "font-semibold text-red-600" : "text-slate-500"}>
          {formatNumber(used)} / {formatNumber(limit)} {unit}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${exceeds ? "bg-red-500" : "bg-blue-600"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CustomerDetailContent({ customerId }: { customerId: number }) {
  const navigate = useNavigate();
  const { data: customer, loading, error, setData } = useAsyncData(() => getCustomer(customerId), [customerId]);
  const [activeTab, setActiveTab] = useState<CustomerTab>("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <LoadingState label="Loading customer..." />;
  }

  if (error || !customer) {
    return <ErrorState message={error ?? "Customer not found."} />;
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${customer.firstName} ${customer.lastName}? This can't be undone from the UI.`)) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteCustomer(customer.id);
      navigate("/customer");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Silme işlemi başarısız oldu.");
      setDeleting(false);
    }
  };

  const totalBilled = customer.invoiceHistory.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const overdueCount = customer.invoiceHistory.filter((invoice) => invoice.status === "OVERDUE").length;
  const isCorporate = customer.subscriptions.some((s) => s.organizationName);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
      </div>

      {deleteError && <ErrorState message={deleteError} />}

      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-xl lg:p-8">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              {isCorporate ? (
                <Building2 className="h-6 w-6" />
              ) : (
                <UserRound className="h-6 w-6" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#fff" }}>
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                <Phone className="h-3.5 w-3.5" />
                {customer.phoneNumber} · {customer.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={customer.status} />

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

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-950">Customer Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">TC Identity Number</dt>
                <dd className="font-medium text-slate-900">{customer.tcIdentityNumber}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{customer.email}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Birth Date</dt>
                <dd className="font-medium text-slate-900">{formatDate(customer.birthDate)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Gender</dt>
                <dd className="font-medium text-slate-900">{customer.gender}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Customer Type</dt>
                <dd className="font-medium text-slate-900">
                  {isCorporate ? "Corporate" : "Individual"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-950">Invoice Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Total Invoices</dt>
                <dd className="font-medium text-slate-900">{customer.invoiceHistory.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Total Billed</dt>
                <dd className="font-medium text-slate-900">{formatCurrency(totalBilled)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Overdue Invoices</dt>
                <dd className="font-medium text-red-600">{overdueCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Subscriptions</dt>
                <dd className="font-medium text-slate-900">{customer.subscriptions.length}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-950">Current Usage</h2>
            {customer.currentUsage.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No usage data found.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {customer.currentUsage.map((usage, index) => (
                  <div key={index} className="space-y-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <UsageBar icon={Wifi} label="Internet" used={usage.usedInternetGb} limit={usage.internetLimitGb} unit="GB" />
                    <UsageBar icon={Phone} label="Voice" used={usage.usedMinutes} limit={usage.minuteLimit} unit="min" />
                    <UsageBar icon={MessageSquare} label="SMS" used={usage.usedSms} limit={usage.smsLimit} unit="SMS" />
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      )}

      {activeTab === "subscriptions" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[28%]" />
              <col className="w-[22%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Package</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Company</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Start Date</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {customer.subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-b border-slate-100">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{subscription.phoneNumber}</td>
                  <td className="truncate px-5 py-4 text-sm text-slate-600">{subscription.packageName}</td>
                  <td className="truncate px-5 py-4 text-sm text-slate-600">{subscription.organizationName ?? "—"}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatDate(subscription.startDate)}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge status={subscription.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {customer.subscriptions.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No subscriptions found.</p>
          )}
        </section>
      )}

      {activeTab === "invoices" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Invoice</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Issue Date</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Channel</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {customer.invoiceHistory.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{invoice.invoiceNumber}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatDate(invoice.issueDate)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatDate(invoice.dueDate)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
                  <td className="truncate px-5 py-4 text-sm text-slate-600">
                    {customer.paymentHistory.find((payment) => payment.invoiceNumber === invoice.invoiceNumber)?.paymentChannel ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {customer.invoiceHistory.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No invoices found.</p>
          )}
        </section>
      )}

      {activeTab === "usage" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-950">Monthly Usage Trend</h2>
            <Gauge className="h-5 w-5 text-slate-400" />
          </div>

          {customer.usageTrend.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No usage history found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] table-fixed">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[24%]" />
                  <col className="w-[24%]" />
                  <col className="w-[24%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Period</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Internet (GB)</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Voice (min)</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">SMS</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.usageTrend.map((point, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="px-3 py-2.5 text-sm font-medium text-slate-900">
                        {formatMonthLabel(point.year, point.month)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm text-slate-600">{formatNumber(point.internetGb)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-slate-600">{formatNumber(point.voiceMinutes)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-slate-600">{formatNumber(point.smsCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {showEditModal && (
        <CustomerFormModal
          mode="edit"
          initialValues={customer}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (values) => {
            const updated = await updateCustomer(customer.id, {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phoneNumber: values.phoneNumber,
              birthDate: values.birthDate,
              gender: values.gender,
              city: values.city,
            });
            setData((current) =>
              current
                ? {
                    ...current,
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    birthDate: values.birthDate,
                    gender: updated.gender,
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
