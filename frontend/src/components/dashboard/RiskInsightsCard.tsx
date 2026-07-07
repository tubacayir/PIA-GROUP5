import { datasetScenario } from "../../mock/datasetScenario";

const riskItems = [
  {
    title: "Late Invoices",
    value:
      datasetScenario.paymentStatus.late.toLocaleString(
        "en-US"
      ),
    description: "Invoices with delayed payment",
    className: "risk-high",
  },
  {
    title: "Restricted Lines",
    value:
      datasetScenario.latePaymentBreakdown.twoMonthsOrMoreUnpaid.toLocaleString(
        "en-US"
      ),
    description:
      "Lines restricted due to long-term unpaid invoices",
    className: "risk-restricted",
  },
  {
    title: "Upper Package Recommendations",
    value:
      datasetScenario.recommendations.upperPackage.toLocaleString(
        "en-US"
      ),
    description:
      "Customers consistently exceeding package limits",
    className: "risk-contract",
  },
  {
    title: "Anomalous Invoices",
    value:
      datasetScenario.usage.anomalous.toLocaleString(
        "en-US"
      ),
    description:
      "Suspended invoices requiring admin review",
    className: "risk-anomaly",
  },
];

export default function RiskInsightsCard() {
  return (
    <section className="analytics-card risk-insights-card">
      <div className="analytics-card-header">
        <h2>Risk & Insights</h2>
        <p>
          Customers, lines and invoices requiring attention
        </p>
      </div>

      <div className="risk-insights-grid">
        {riskItems.map((item) => (
          <div
            className={`risk-insight-item ${item.className}`}
            key={item.title}
          >
            <span className="risk-insight-title">
              {item.title}
            </span>

            <strong className="risk-insight-value">
              {item.value}
            </strong>

            <p className="risk-insight-description">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}