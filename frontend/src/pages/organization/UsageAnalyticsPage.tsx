import type { LucideIcon } from "lucide-react";
import { CircleAlert, MessageSquare, Phone, Wifi } from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ErrorState, LoadingState } from "../../components/organization/AsyncStates";
import { useAsyncData } from "../../features/organization/useAsyncData";
import {
  getUsageAnalytics,
  getUsageTrend,
} from "../../features/organization/organizationService";
import { formatMonthLabel, formatNumber } from "../../features/organization/format";
import type { UsageRankingItem } from "../../features/organization/organizationTypes";

function RankingCard({
  title,
  icon: Icon,
  items,
  metricLabel,
  metricValue,
}: {
  title: string;
  icon: LucideIcon;
  items: UsageRankingItem[];
  metricLabel: string;
  metricValue: (item: UsageRankingItem) => string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <h2 className="font-bold text-slate-950">{title}</h2>
        <Icon className="h-5 w-5 text-slate-400" />
      </div>

      {items.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">No data available.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <div key={item.subscriptionId} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                  {index + 1}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.employeeName}</p>
                  <p className="text-xs text-slate-500">{item.phoneNumber} · {item.packageName}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-slate-950">{metricValue(item)}</p>
                <p className="text-xs text-slate-400">{metricLabel}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default function UsageAnalyticsPage() {
  const analytics = useAsyncData(() => getUsageAnalytics(true), []);
  const usageTrend = useAsyncData(getUsageTrend, []);

  const loading = analytics.loading || usageTrend.loading;
  const error = analytics.error ?? usageTrend.error;

  if (loading) {
    return <LoadingState label="Loading usage analytics..." />;
  }

  if (error || !analytics.data) {
    return <ErrorState message={error ?? "Usage analytics could not be loaded."} />;
  }

  const data = analytics.data;

  const usagePoints = (usageTrend.data ?? []).map((point) => ({
    label: formatMonthLabel(point.year, point.month),
    internetGb: point.internetGb,
    voiceMinutes: point.voiceMinutes,
    smsCount: point.smsCount,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Usage Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Telecom usage insights across your organization.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="font-bold text-slate-950">Monthly Usage Trend</h2>
          <p className="mt-1 text-sm text-slate-500">Internet, voice and SMS usage across the organization.</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="h-56">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Internet (GB)</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usagePoints} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsInternet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} width={40} />
                  <Tooltip formatter={(value) => [formatNumber(Number(value)), "GB"]} />
                  <Area type="monotone" dataKey="internetGb" stroke="#2563eb" strokeWidth={2} fill="url(#analyticsInternet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-56">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Voice (min)</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usagePoints} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsVoice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} width={40} />
                  <Tooltip formatter={(value) => [formatNumber(Number(value)), "min"]} />
                  <Area type="monotone" dataKey="voiceMinutes" stroke="#16a34a" strokeWidth={2} fill="url(#analyticsVoice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-56">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">SMS</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usagePoints} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsSms" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} width={40} />
                  <Tooltip formatter={(value) => [formatNumber(Number(value)), "SMS"]} />
                  <Area type="monotone" dataKey="smsCount" stroke="#7c3aed" strokeWidth={2} fill="url(#analyticsSms)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>
      </section>

      {data.exceedingLimits.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <CircleAlert className="h-5 w-5 text-slate-400" />
          Bu ay aşım yapan çalışan yok.
        </div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          <RankingCard
            title="Highest Internet Consumers"
            icon={Wifi}
            items={data.highestInternetConsumers}
            metricLabel="GB used"
            metricValue={(item) => `${formatNumber(item.usedInternetGb)} / ${item.internetLimitGb} GB`}
          />

          <RankingCard
            title="Highest Voice Consumers"
            icon={Phone}
            items={data.highestVoiceConsumers}
            metricLabel="minutes used"
            metricValue={(item) => `${formatNumber(item.usedMinutes)} / ${item.minuteLimit} min`}
          />

          <RankingCard
            title="Highest SMS Consumers"
            icon={MessageSquare}
            items={data.highestSmsConsumers}
            metricLabel="SMS sent"
            metricValue={(item) => `${formatNumber(item.usedSms)} / ${item.smsLimit} SMS`}
          />
        </section>
      )}
    </div>
  );
}
