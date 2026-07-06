import {
  CircleDollarSign,
  ReceiptText,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import GreenInvoiceCard from "../components/dashboard/GreenInvoiceCard";
import KpiCard from "../components/dashboard/KpiCard";
import PaymentChannelCard from "../components/dashboard/PaymentChannelCard";
import PaymentStatusCard from "../components/dashboard/PaymentStatusCard";
import RiskInsightsCard from "../components/dashboard/RiskInsightsCard";
import RevenueTrendChart from "../components/dashboard/RevenueTrendChart";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <DashboardHeader />

      <div className="dashboard-kpi-grid">
        <KpiCard
          title="Total Billed"
          value="₺13.05M"
          description="Total value of issued invoices"
          badge="30K+ invoices"
          icon={ReceiptText}
          tone="blue"
        />

        <KpiCard
          title="Collected"
          value="₺11.09M"
          description="Successfully collected invoice value"
          badge="85% collection rate"
          icon={CircleDollarSign}
          tone="green"
        />

        <KpiCard
          title="Outstanding"
          value="₺1.31M"
          description="Invoice value awaiting payment"
          badge="10% of total"
          icon={WalletCards}
          tone="amber"
        />

        <KpiCard
          title="Overdue"
          value="₺652.5K"
          description="Past-due unpaid invoice value"
          badge="5% requires attention"
          icon={TriangleAlert}
          tone="red"
        />
      </div>
      <div className="dashboard-primary-chart">
  <RevenueTrendChart />
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