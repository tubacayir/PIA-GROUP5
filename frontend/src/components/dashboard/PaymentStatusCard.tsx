const paymentStatusData = [
    {
      label: "Paid",
      amount: "₺3.91M",
      percentage: 81,
    },
    {
      label: "Pending",
      amount: "₺620K",
      percentage: 13,
    },
    {
      label: "Overdue",
      amount: "₺290K",
      percentage: 6,
    },
  ];
  
  export default function PaymentStatusCard() {
    return (
      <section className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <h2>Payment Status</h2>
            <p>Distribution of invoice amounts</p>
          </div>
        </div>
  
        <div className="payment-status-list">
          {paymentStatusData.map((item) => (
            <div className="payment-status-item" key={item.label}>
              <div className="payment-status-row">
                <span>{item.label}</span>
  
                <div className="payment-status-values">
                  <strong>{item.amount}</strong>
                  <span>{item.percentage}%</span>
                </div>
              </div>
  
              <div className="progress-track">
                <div
                  className={`progress-fill progress-${item.label.toLowerCase()}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }