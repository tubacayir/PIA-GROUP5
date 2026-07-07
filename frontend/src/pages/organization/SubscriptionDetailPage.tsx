import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import StatusBadge from "../../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../../components/organization/AsyncStates";
import { useAsyncData } from "../../features/organization/useAsyncData";
import {
  getPackages,
  getSubscription,
  updateSubscriptionPackage,
  updateSubscriptionStatus,
} from "../../features/organization/organizationService";
import { formatCurrency, formatDate } from "../../features/organization/format";

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <SubscriptionDetailContent key={id} subscriptionId={Number(id)} />;
}

function SubscriptionDetailContent({ subscriptionId }: { subscriptionId: number }) {
  const {
    data: subscription,
    loading,
    error,
    setData: setSubscription,
  } = useAsyncData(() => getSubscription(subscriptionId), [subscriptionId]);

  const { data: packages } = useAsyncData(getPackages, []);

  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <LoadingState label="Loading subscription..." />;
  }

  if (error || !subscription) {
    return <ErrorState message={error ?? "Subscription not found."} />;
  }

  const isActive = subscription.status === "ACTIVE";

  const handlePackageChange = async () => {
    if (!selectedPackageId) {
      return;
    }

    setSaving(true);
    setActionError(null);

    try {
      const updated = await updateSubscriptionPackage(subscriptionId, Number(selectedPackageId));
      setSubscription(updated);
      setSelectedPackageId("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Paket güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    setSaving(true);
    setActionError(null);

    try {
      const updated = await updateSubscriptionStatus(subscriptionId, isActive ? "PASSIVE" : "ACTIVE");
      setSubscription(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Durum güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/organization/subscriptions"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subscriptions
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">{subscription.phoneNumber}</h1>
        <p className="mt-1 text-sm text-slate-500">{subscription.employeeName}</p>
      </div>

      {actionError && <ErrorState message={actionError} />}

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-950">Subscription Details</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Subscription Number</dt>
              <dd className="font-medium text-slate-900">{subscription.subscriptionNumber}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Package</dt>
              <dd className="font-medium text-slate-900">{subscription.tariffPackage.packageName}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <StatusBadge status={subscription.status} />
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Commitment Start</dt>
              <dd className="font-medium text-slate-900">{formatDate(subscription.commitmentStartDate)}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Commitment End</dt>
              <dd className="font-medium text-slate-900">{formatDate(subscription.commitmentEndDate)}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Monthly Fee</dt>
              <dd className="font-medium text-slate-900">{formatCurrency(subscription.tariffPackage.monthlyFee)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={saving}
            className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {isActive ? "Deactivate Subscription" : "Activate Subscription"}
          </button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-950">Change Package</h2>
          <p className="mt-1 text-sm text-slate-500">
            Assign a different tariff package to this subscription.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedPackageId}
              onChange={(event) => setSelectedPackageId(event.target.value)}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select a package...</option>
              {(packages ?? [])
                .filter((pkg) => pkg.id !== subscription.tariffPackage.id)
                .map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.packageName} ({formatCurrency(pkg.monthlyFee)}/mo)
                  </option>
                ))}
            </select>

            <button
              type="button"
              onClick={handlePackageChange}
              disabled={saving || !selectedPackageId}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Apply
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current Package Limits</p>

            <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <dd className="text-lg font-bold text-slate-900">{subscription.tariffPackage.internetLimitGb}</dd>
                <dt className="text-xs text-slate-500">GB</dt>
              </div>

              <div>
                <dd className="text-lg font-bold text-slate-900">{subscription.tariffPackage.minuteLimit}</dd>
                <dt className="text-xs text-slate-500">Minutes</dt>
              </div>

              <div>
                <dd className="text-lg font-bold text-slate-900">{subscription.tariffPackage.smsLimit}</dd>
                <dt className="text-xs text-slate-500">SMS</dt>
              </div>
            </dl>
          </div>
        </article>
      </section>
    </div>
  );
}
