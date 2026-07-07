import KpiCard from "../components/dashboard/KpiCard";
import PaymentStatusCard from "../components/dashboard/PaymentStatusCard";
import PaymentChannelCard from "../components/dashboard/PaymentChannelCard";
import RiskInsightsCard from "../components/dashboard/RiskInsightsCard";
import GreenInvoiceCard from "../components/dashboard/GreenInvoiceCard";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="dashboard-title">Dashboard</h1>

        <p className="mt-2 text-gray-500">
          Monitor invoice performance, payment trends and customer risks.
        </p>
      </div>

      <div className="dashboard-kpi-grid">
        <KpiCard
          title="Total Invoiced"
          value="₺4.82M"
          description="Total amount of all invoices"
        />

        <KpiCard
          title="Paid"
          value="₺3.91M"
          description="Successfully collected amount"
        />

        <KpiCard
          title="Pending"
          value="₺620K"
          description="Invoices awaiting payment"
        />

        <KpiCard
          title="Overdue"
          value="₺290K"
          description="Past-due invoice amount"
        />
      </div>

      <div className="dashboard-analytics-grid">
        <PaymentStatusCard />
        <PaymentChannelCard />
      </div>

      <div className="dashboard-risk-section">
        <RiskInsightsCard />
      </div>

      <div className="dashboard-green-section">
        <GreenInvoiceCard />
      </div>
    </div>
  );
}