export interface RiskInsightItem {
  title: string;
  value: string;
  description: string;
  className: string;
}

interface RiskInsightsCardProps {
  items: RiskInsightItem[];
}

export default function RiskInsightsCard({ items }: RiskInsightsCardProps) {
  return (
    <section className="analytics-card risk-insights-card">
      <div className="analytics-card-header">
        <h2>Risk & Insights</h2>
        <p>
          Customers, lines and invoices requiring attention
        </p>
      </div>

      <div className="risk-insights-grid">
        {items.map((item) => (
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
