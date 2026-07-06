import {
  CreditCard,
  ReceiptText,
  Smartphone,
  Users,
} from "lucide-react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import GreenInvoiceCard from "../components/dashboard/GreenInvoiceCard";
import KpiCard from "../components/dashboard/KpiCard";
import PaymentChannelCard from "../components/dashboard/PaymentChannelCard";
import PaymentStatusCard from "../components/dashboard/PaymentStatusCard";
import RiskInsightsCard from "../components/dashboard/RiskInsightsCard";
import RevenueTrendChart from "../components/dashboard/RevenueTrendChart";
import { datasetScenario } from "../mock/datasetScenario";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <DashboardHeader />

      <div className="dashboard-kpi-grid">
        <KpiCard
          title="Total Customers"
          value={datasetScenario.customers.total.toLocaleString("en-US")}
          description="Total number of real customers"
          badge={`${datasetScenario.customers.hybrid.toLocaleString(
            "en-US"
          )} hybrid customers`}
          icon={Users}
          tone="blue"
        />

        <KpiCard
          title="Total Lines"
          value={datasetScenario.lines.total.toLocaleString("en-US")}
          description="Individual and corporate mobile lines"
          badge={`${datasetScenario.lines.corporate.toLocaleString(
            "en-US"
          )} corporate lines`}
          icon={Smartphone}
          tone="green"
        />

        <KpiCard
          title="Total Invoices"
          value={datasetScenario.invoices.total.toLocaleString("en-US")}
          description={`${datasetScenario.invoices.historyMonths}-month invoice history`}
          badge={`${datasetScenario.invoices.corporate.toLocaleString(
            "en-US"
          )} corporate invoices`}
          icon={ReceiptText}
          tone="amber"
        />

<KpiCard
  title="Total Payments"
  value={datasetScenario.invoices.total.toLocaleString(
    "en-US"
  )}
  description="Payment records across 3 billing periods"
  badge="36,000 payment records"
  icon={CreditCard}
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