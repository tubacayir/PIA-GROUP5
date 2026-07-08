import NameCountBarCard from "../components/dashboard/NameCountBarCard";
import RankedAmountListCard from "../components/dashboard/RankedAmountListCard";
import MonthlyAmountBarCard from "../components/dashboard/MonthlyAmountBarCard";
import MonthlyCountAreaCard from "../components/dashboard/MonthlyCountAreaCard";
import { ErrorState, LoadingState } from "../components/organization/AsyncStates";

import { useAsyncData } from "../features/admin/useAsyncData";
import { getDashboardCharts } from "../features/admin/adminService";
import { formatCurrency, formatMonthLabel } from "../features/admin/format";

export default function AnalyticsPage() {
  const { data: chartData, loading, error } = useAsyncData(getDashboardCharts, []);

  if (loading) {
    return <LoadingState label="Loading analytics..." />;
  }

  if (error || !chartData) {
    return <ErrorState message={error ?? "Analytics could not be loaded."} />;
  }

  const revenueTrendPoints = chartData.monthlyRevenueTrend.map((point) => ({
    label: formatMonthLabel(point.year, point.month),
    amount: point.totalAmount,
  }));

  const latePaymentPoints = chartData.latePaymentTrend.map((point) => ({
    label: formatMonthLabel(point.year, point.month),
    count: point.count,
  }));

  return (
    <div className="p-6">
      <div>
        <h1
            style={{
              color: "#FF",
              opacity: 1,
              fontSize: "48px",
              fontWeight: "bold",
            }}
        >
          Analytics
        </h1>
      </div>

      <div className="mt-7">
        <MonthlyAmountBarCard
            eyebrow="Revenue"
            title="Monthly Revenue Trend"
          subtitle="Total billed amount per month"
          data={revenueTrendPoints}
          formatAmount={formatCurrency}
        />
      </div>

      <section className="mt-7 grid gap-6 lg:grid-cols-3">
        <NameCountBarCard
          eyebrow="Packages"
          title="Package Distribution"
          subtitle="Subscriptions per tariff package"
          data={chartData.packageDistribution}
        />

        <NameCountBarCard
          eyebrow="Segments"
          title="Corporate vs Individual"
          subtitle="Subscription type breakdown"
          data={chartData.corporateVsIndividual}
          barColor="#7c3aed"
        />

        <NameCountBarCard
          eyebrow="Geography"
          title="Top Cities"
          subtitle="Customers by city"
          data={chartData.topCities}
          barColor="#16a34a"
        />

        <NameCountBarCard
          eyebrow="Demographics"
          title="Age Distribution"
          subtitle="Customers by age group"
          data={chartData.ageDistribution}
          layout="horizontal"
          barColor="#0ea5e9"
        />

        <NameCountBarCard
          eyebrow="Demographics"
          title="Gender Distribution"
          subtitle="Customers by gender"
          data={chartData.genderDistribution}
          layout="horizontal"
          barColor="#f59e0b"
        />

        <NameCountBarCard
          eyebrow="Packages"
          title="Top Packages"
          subtitle="Most subscribed packages"
          data={chartData.topPackages}
          barColor="#2563eb"
        />

        <RankedAmountListCard
          eyebrow="Companies"
          title="Top Companies"
          subtitle="Ranked by total billed amount"
          data={chartData.topCompanies}
          formatAmount={formatCurrency}
        />

        <NameCountBarCard
          eyebrow="Usage"
          title="Usage Distribution"
          subtitle="Subscriptions by package utilization"
          data={chartData.usageDistribution}
          layout="horizontal"
          barColor="#ef4444"
        />

        <MonthlyCountAreaCard
          eyebrow="Risk"
          title="Late Payment Trend"
          subtitle="Invoices paid after their due date"
          data={latePaymentPoints}
        />
      </section>
    </div>
  );
}
