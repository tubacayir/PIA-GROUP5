import {
  CreditCard,
  ReceiptText,
  Smartphone,
  Users,
} from "lucide-react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import GreenInvoiceCard from "../components/dashboard/GreenInvoiceCard";
import type { KpiCardProps } from "../components/dashboard/KpiCard";
import KpiSlider from "../components/dashboard/KpiSlider";
import PaymentChannelCard from "../components/dashboard/PaymentChannelCard";
import PaymentStatusCard from "../components/dashboard/PaymentStatusCard";
import RiskInsightsCard from "../components/dashboard/RiskInsightsCard";
import RevenueTrendChart from "../components/dashboard/RevenueTrendChart";
import { ErrorState, LoadingState } from "../components/organization/AsyncStates";

import { useAsyncData } from "../features/admin/useAsyncData";
import { getDashboardCharts, getDashboardSummary } from "../features/admin/adminService";
import { formatCurrency, formatMonthLabel, formatNumber } from "../features/admin/format";

const STATUS_COLORS: Record<string, string> = {
  PAID: "#16a34a",
  OVERDUE: "#ef4444",
  CREATED: "#2563eb",
  CANCELLED: "#94a3b8",
};

const CHANNEL_LABELS: Record<string, string> = {
  MOBILE_APP: "Mobile App",
  WEB: "Web",
  BANK_APP: "Bank App",
  AUTO_PAYMENT: "Auto Payment",
  STORE: "Store",
};

export default function DashboardPage() {
  const summary = useAsyncData(getDashboardSummary, []);
  const charts = useAsyncData(getDashboardCharts, []);

  const loading = summary.loading || charts.loading;
  const error = summary.error ?? charts.error;

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (error || !summary.data || !charts.data) {
    return <ErrorState message={error ?? "Dashboard could not be loaded."} />;
  }

  const kpi = summary.data;
  const chartData = charts.data;

  const lateByPeriod = new Map(
    chartData.latePaymentTrend.map((point) => [`${point.year}-${point.month}`, point.count])
  );

  const invoiceTrendPoints = chartData.monthlyInvoiceCountTrend.map((point) => {
    const late = lateByPeriod.get(`${point.year}-${point.month}`) ?? 0;
    return {
      month: formatMonthLabel(point.year, point.month),
      issued: point.count,
      paidOnTime: Math.max(point.count - late, 0),
    };
  });

  const invoiceStatusTotal = chartData.invoiceStatusDistribution.reduce((sum, item) => sum + item.count, 0);
  const paymentStatusSlices = chartData.invoiceStatusDistribution.map((item) => ({
    name: item.name,
    value: item.count,
    percentage: invoiceStatusTotal > 0 ? Math.round((item.count / invoiceStatusTotal) * 100) : 0,
    color: STATUS_COLORS[item.name] ?? "#64748b",
  }));

  const channelTotal = chartData.paymentChannelDistribution.reduce((sum, item) => sum + item.count, 0);
  const paymentChannelSlices = chartData.paymentChannelDistribution.map((item) => ({
    label: CHANNEL_LABELS[item.name] ?? item.name,
    percentage: channelTotal > 0 ? Math.round((item.count / channelTotal) * 100) : 0,
    isPhysical: item.name === "STORE",
  }));

  const overdueCount = chartData.invoiceStatusDistribution.find((item) => item.name === "OVERDUE")?.count ?? 0;
  const cancelledCount = chartData.invoiceStatusDistribution.find((item) => item.name === "CANCELLED")?.count ?? 0;
  const overLimitCount = chartData.usageDistribution.find((item) => item.name === "Over 100%")?.count ?? 0;
  const underutilizedCount = chartData.usageDistribution.find((item) => item.name === "Under 50%")?.count ?? 0;

  const riskItems = [
    {
      title: "Overdue Invoices",
      value: formatNumber(overdueCount),
      description: "Invoices past their due date",
      className: "risk-high",
    },
    {
      title: "Cancelled Invoices",
      value: formatNumber(cancelledCount),
      description: "Invoices cancelled system-wide",
      className: "risk-restricted",
    },
    {
      title: "Over-Limit Subscriptions",
      value: formatNumber(overLimitCount),
      description: "Subscriptions exceeding their package limits",
      className: "risk-contract",
    },
    {
      title: "Underutilized Subscriptions",
      value: formatNumber(underutilizedCount),
      description: "Subscriptions using under 50% of their package",
      className: "risk-anomaly",
    },
  ];

  const digitalCount = chartData.digitalVsPaper.find((item) => item.name === "DIGITAL")?.count ?? 0;
  const paperCount = chartData.digitalVsPaper.find((item) => item.name === "PAPER")?.count ?? 0;
  const carbonSavedKg = Math.round(digitalCount * 0.05);
  const treesEquivalent = Math.round(carbonSavedKg / 21);

  const overviewItems: KpiCardProps[] = [
    {
      title: "Total Customers",
      value: formatNumber(kpi.totalCustomers),
      description: "Total number of registered customers",
      badge: `${formatNumber(kpi.corporateLineCount)} corporate lines`,
      icon: Users,
      tone: "blue",
    },
    {
      title: "Total Subscriptions",
      value: formatNumber(kpi.totalSubscriptions),
      description: "Individual and corporate mobile lines",
      badge: `${formatNumber(kpi.totalCompanies)} companies`,
      icon: Smartphone,
      tone: "green",
    },
    {
      title: "Total Companies",
      value: formatNumber(kpi.totalCompanies),
      description: "Corporate accounts on the platform",
      badge: `${formatNumber(kpi.corporateLineCount)} corporate lines`,
      icon: ReceiptText,
      tone: "amber",
    },
    {
      title: "Total Invoices",
      value: formatNumber(kpi.totalInvoices),
      description: "Invoices issued across all customers",
      badge: formatCurrency(kpi.monthlyRevenue),
      icon: CreditCard,
      tone: "red",
    },
  ];

  const revenueItems: KpiCardProps[] = [
    {
      title: "Monthly Revenue",
      value: formatCurrency(kpi.monthlyRevenue),
      description: "Total billed amount this period",
      badge: "Current period",
      icon: ReceiptText,
      tone: "blue",
    },
    {
      title: "Average Invoice",
      value: formatCurrency(kpi.averageInvoiceAmount),
      description: "Average invoice amount across the platform",
      badge: "All-time average",
      icon: CreditCard,
      tone: "green",
    },
    {
      title: "Average Internet Usage",
      value: `${formatNumber(kpi.averageInternetUsageGb)} GB`,
      description: "Average internet usage per subscription",
      badge: "Current period",
      icon: Smartphone,
      tone: "amber",
    },
    {
      title: "Corporate Lines",
      value: formatNumber(kpi.corporateLineCount),
      description: "Subscriptions tied to a corporate account",
      badge: `of ${formatNumber(kpi.totalSubscriptions)} total`,
      icon: Users,
      tone: "red",
    },
  ];

  const rateItems: KpiCardProps[] = [
    {
      title: "Digital Invoice Rate",
      value: `${kpi.digitalInvoiceRatePercent}%`,
      description: "Invoices delivered digitally",
      badge: "Delivery method",
      icon: ReceiptText,
      tone: "blue",
    },
    {
      title: "Paper Invoice Rate",
      value: `${kpi.paperInvoiceRatePercent}%`,
      description: "Invoices delivered on paper",
      badge: "Delivery method",
      icon: ReceiptText,
      tone: "green",
    },
    {
      title: "Paid On Time",
      value: `${kpi.paidOnTimeRatePercent}%`,
      description: "Paid invoices settled on or before due date",
      badge: "Payment behavior",
      icon: CreditCard,
      tone: "amber",
    },
    {
      title: "Late Payment",
      value: `${kpi.latePaymentRatePercent}%`,
      description: "Paid invoices settled after due date",
      badge: "Payment behavior",
      icon: CreditCard,
      tone: "red",
    },
  ];

  return (
    <div className="p-6">
      <DashboardHeader />

      <div className="kpi-slider-grid">
        <div className="kpi-slider-row">
          <KpiSlider size="sm" items={overviewItems} />
        </div>

        <div className="kpi-slider-row">
          <KpiSlider size="lg" items={revenueItems} />
        </div>

        <div className="kpi-slider-row">
          <KpiSlider size="sm" items={rateItems} />
        </div>
      </div>

      <div className="dashboard-primary-chart">
        <RevenueTrendChart data={invoiceTrendPoints} />
      </div>

      <div className="dashboard-analytics-grid">
        <PaymentStatusCard data={paymentStatusSlices} />
        <PaymentChannelCard data={paymentChannelSlices} />
      </div>

      <div className="dashboard-risk-section">
        <RiskInsightsCard items={riskItems} />
      </div>

      <div className="dashboard-green-section">
        <GreenInvoiceCard
          data={{
            digitalInvoices: digitalCount,
            paperInvoices: paperCount,
            carbonSavedKg,
            treesEquivalent,
          }}
        />
      </div>
    </div>
  );
}
