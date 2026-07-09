import NameCountBarCard from "../components/dashboard/NameCountBarCard";
import RankedAmountListCard from "../components/dashboard/RankedAmountListCard";
import MonthlyAmountBarCard from "../components/dashboard/MonthlyAmountBarCard";
import MonthlyCountAreaCard from "../components/dashboard/MonthlyCountAreaCard";
import TurkeyCitiesMapCard from "../components/dashboard/TurkeyCitiesMapCard";
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
              color: "#1f3d5e",
              opacity: 1,
              fontSize: "48px",
              fontWeight: "bold",
            }}
        >
          Analytics
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        <MonthlyAmountBarCard
            eyebrow="Revenue"
            title="Monthly Revenue Trend"
          subtitle="Total billed amount per month"
          data={revenueTrendPoints}
          formatAmount={formatCurrency}
        />

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <TurkeyCitiesMapCard
          eyebrow="Geography"
          title="Top Cities"
          subtitle="Customers by city shown on Türkiye map"
          data={chartData.topCities}
        />

        <section>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">New Analysis</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Invoice-Based Customer Analytics</h2>
            <p className="mt-1 text-sm text-slate-500">
              Total billed amount segmented by customer age, payment behavior, invoice delivery and package utilization.
            </p>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <RankedAmountListCard
              eyebrow="Age"
              title="Invoice Amount by Age"
              subtitle="Total invoice value by customer age group"
              data={chartData.invoiceAmountByAgeGroup}
              formatAmount={formatCurrency}
            />

            <RankedAmountListCard
              eyebrow="Payment"
              title="Invoice Amount by Channel"
              subtitle="Total invoice value by payment channel"
              data={chartData.invoiceAmountByPaymentChannel}
              formatAmount={formatCurrency}
            />

            <RankedAmountListCard
              eyebrow="Delivery"
              title="Invoice Amount by Delivery"
              subtitle="Digital and paper invoice value comparison"
              data={chartData.invoiceAmountByDeliveryMethod}
              formatAmount={formatCurrency}
            />

            <RankedAmountListCard
              eyebrow="Usage"
              title="Invoice Amount by Usage"
              subtitle="Total invoice value by package utilization"
              data={chartData.invoiceAmountByPackageUsage}
              formatAmount={formatCurrency}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
