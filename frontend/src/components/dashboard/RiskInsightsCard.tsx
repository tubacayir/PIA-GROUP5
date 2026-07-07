const riskItems = [
    {
      title: "High Churn Risk",
      value: "824",
      description: "Customers likely to leave",
      className: "risk-high",
    },
    {
      title: "Anomalous Invoices",
      value: "201",
      description: "Invoices requiring review",
      className: "risk-anomaly",
    },
    {
      title: "Expiring Contracts",
      value: "1,204",
      description: "Contracts ending within 30 days",
      className: "risk-contract",
    },
    {
      title: "Restricted Lines",
      value: "487",
      description: "Lines restricted due to unpaid invoices",
      className: "risk-restricted",
    },
  ];
  
  export default function RiskInsightsCard() {
    return (
      <section className="analytics-card risk-insights-card">
        <div className="analytics-card-header">
          <h2>Risk & Insights</h2>
          <p>Customers and invoices requiring attention</p>
        </div>
  
        <div className="risk-insights-grid">
          {riskItems.map((item) => (
            <div
              className={`risk-insight-item ${item.className}`}
              key={item.title}
            >
              <span className="risk-insight-title">{item.title}</span>
  
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