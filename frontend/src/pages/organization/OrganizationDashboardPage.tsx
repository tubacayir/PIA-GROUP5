import {
  Activity,
  CircleAlert,
  Gauge,
  MessageSquare,
  Package,
  Phone,
  ReceiptText,
  Smartphone,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useState } from "react";

import MetricCard from "../../components/organization/MetricCard";
import { ErrorState, LoadingState } from "../../components/organization/AsyncStates";
import { useAsyncData } from "../../features/organization/useAsyncData";
import {
  approveRecommendation,
  getDashboardSummary,
  getInvoiceTrend,
  getRecommendations,
  getUsageTrend,
  rejectRecommendation,
} from "../../features/organization/organizationService";
import { formatCurrency, formatMonthLabel, formatNumber } from "../../features/organization/format";

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6 h-64">{children}</div>
    </article>
  );
}

export default function OrganizationDashboardPage() {
  const summary = useAsyncData(getDashboardSummary, []);
  const usageTrend = useAsyncData(getUsageTrend, []);
  const invoiceTrend = useAsyncData(getInvoiceTrend, []);
  const recommendations = useAsyncData(getRecommendations, []);

  const [recommendationActing, setRecommendationActing] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const loading = summary.loading || usageTrend.loading || invoiceTrend.loading;
  const error = summary.error ?? usageTrend.error ?? invoiceTrend.error;

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (error || !summary.data) {
    return <ErrorState message={error ?? "Dashboard verileri yüklenemedi."} />;
  }

  const kpis = summary.data;

  const handleApproveRecommendation = async (id: number) => {
    setRecommendationActing(true);
    setRecommendationError(null);
    try {
      const updated = await approveRecommendation(id);
      recommendations.setData((current) => current?.map((r) => (r.id === id ? updated : r)) ?? current);
    } catch (err) {
      setRecommendationError(err instanceof Error ? err.message : "İşlem başarısız oldu.");
    } finally {
      setRecommendationActing(false);
    }
  };

  const handleRejectRecommendation = async (id: number) => {
    setRecommendationActing(true);
    setRecommendationError(null);
    try {
      const updated = await rejectRecommendation(id);
      recommendations.setData((current) => current?.map((r) => (r.id === id ? updated : r)) ?? current);
    } catch (err) {
      setRecommendationError(err instanceof Error ? err.message : "İşlem başarısız oldu.");
    } finally {
      setRecommendationActing(false);
    }
  };

  const usagePoints = (usageTrend.data ?? []).map((point) => ({
    label: formatMonthLabel(point.year, point.month),
    internetGb: point.internetGb,
    voiceMinutes: point.voiceMinutes,
    smsCount: point.smsCount,
  }));

  const invoicePoints = (invoiceTrend.data ?? []).map((point) => ({
    label: formatMonthLabel(point.year, point.month),
    totalAmount: point.totalAmount,
  }));

  const topRecommendation = (recommendations.data ?? [])[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Organization Dashboard</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Employees"
          value={formatNumber(kpis.totalEmployees)}
          icon={Users}
          tone="blue"
        />

        <MetricCard
          label="Active Subscriptions"
          value={formatNumber(kpis.totalActiveSubscriptions)}
          icon={Activity}
          tone="emerald"
        />

        <MetricCard
          label="Monthly Invoice Amount"
          value={formatCurrency(kpis.totalMonthlyInvoiceAmount)}
          icon={ReceiptText}
          tone="violet"
        />

        <MetricCard
          label="Internet Usage"
          value={`${formatNumber(kpis.totalInternetUsageGb)} GB`}
          icon={Wifi}
          tone="blue"
        />

        <MetricCard
          label="Voice Minutes"
          value={formatNumber(kpis.totalVoiceMinutes)}
          icon={Phone}
          tone="emerald"
        />

        <MetricCard
          label="SMS Usage"
          value={formatNumber(kpis.totalSmsUsage)}
          icon={MessageSquare}
          tone="violet"
        />

        <MetricCard
          label="Exceeding Package Limits"
          value={formatNumber(kpis.subscriptionsExceedingLimits)}
          icon={CircleAlert}
          tone="red"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-950">Company Package</h2>
            <Package className="h-5 w-5 text-slate-400" />
          </div>

          {kpis.currentCorporatePackage ? (
            <div className="mt-4">
              <p className="text-xl font-bold text-slate-950">{kpis.currentCorporatePackage.packageName}</p>
              <p className="mt-1 text-sm text-slate-500">{formatCurrency(kpis.currentCorporatePackage.monthlyFee)} / month</p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Internet</p>
                  <p className="mt-1 font-semibold text-slate-900">{kpis.currentCorporatePackage.internetLimitGb} GB</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Voice</p>
                  <p className="mt-1 font-semibold text-slate-900">{kpis.currentCorporatePackage.minuteLimit} min</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">SMS</p>
                  <p className="mt-1 font-semibold text-slate-900">{kpis.currentCorporatePackage.smsLimit}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No company package assigned yet.</p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-950">Subscriptions</h2>
            <Smartphone className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-2xl font-bold text-slate-950">{formatNumber(kpis.totalActiveSubscriptions)}</p>
              <p className="text-sm text-slate-500">active subscriptions</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-950">{formatNumber(kpis.subscriptionsExceedingLimits)}</p>
              <p className="text-sm text-slate-500">exceeding limits</p>
            </div>
          </div>

          {topRecommendation && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                topRecommendation.isHighPriority
                  ? "border-red-200 bg-red-50"
                  : "border-violet-100 bg-violet-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-lg bg-white p-2 shadow-sm ${
                    topRecommendation.isHighPriority ? "text-red-600" : "text-violet-600"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">Company Plan Recommendation</p>
                    {topRecommendation.isHighPriority && (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        High Priority
                      </span>
                    )}
                  </div>

                  {topRecommendation.currentPackage && topRecommendation.suggestedPackage && (
                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {topRecommendation.currentPackage.packageName} &rarr; {topRecommendation.suggestedPackage.packageName}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-600">{topRecommendation.reason}</p>

                  {topRecommendation.averageUsageRatio != null && (
                    <p className="mt-1 text-xs text-slate-500">
                      Average usage across lines: %{topRecommendation.averageUsageRatio}
                    </p>
                  )}

                  {recommendationError && (
                    <p className="mt-2 text-xs font-medium text-red-600">{recommendationError}</p>
                  )}

                  {topRecommendation.status === "SUGGESTED" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveRecommendation(topRecommendation.id)}
                        disabled={recommendationActing}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRecommendation(topRecommendation.id)}
                        disabled={recommendationActing}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {topRecommendation.status === "APPROVED" && (
                    <p className="mt-3 text-xs font-medium text-emerald-700">You approved this recommendation.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly Internet Usage" subtitle="Total GB consumed per month">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usagePoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="internetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={50} />
              <Tooltip formatter={(value) => [`${formatNumber(Number(value))} GB`, "Internet"]} />
              <Area type="monotone" dataKey="internetGb" stroke="#2563eb" strokeWidth={3} fill="url(#internetGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Voice Usage" subtitle="Total minutes used per month">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usagePoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="voiceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={50} />
              <Tooltip formatter={(value) => [`${formatNumber(Number(value))} min`, "Voice"]} />
              <Area type="monotone" dataKey="voiceMinutes" stroke="#16a34a" strokeWidth={3} fill="url(#voiceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly SMS Usage" subtitle="Total SMS sent per month">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usagePoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="smsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={50} />
              <Tooltip formatter={(value) => [`${formatNumber(Number(value))} SMS`, "SMS"]} />
              <Area type="monotone" dataKey="smsCount" stroke="#7c3aed" strokeWidth={3} fill="url(#smsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Invoice Trend" subtitle="Total billed amount per month">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={invoicePoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={formatNumber}
                width={60}
              />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Invoice"]} />
              <Bar dataKey="totalAmount" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {kpis.subscriptionsExceedingLimits > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-3">
            <Gauge className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              {kpis.subscriptionsExceedingLimits} subscription(s) are exceeding their package limits this period.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
