const paymentChannelData = [
    {
      label: "Mobile App",
      percentage: 40,
    },
    {
      label: "Web",
      percentage: 20,
    },
    {
      label: "Bank App",
      percentage: 25,
    },
    {
      label: "Store",
      percentage: 15,
    },
  ];
  
  export default function PaymentChannelCard() {
    return (
      <section className="analytics-card">
        <div className="analytics-card-header">
          <h2>Payment Channels</h2>
          <p>Customer payment channel distribution</p>
        </div>
  
        <div className="payment-channel-list">
          {paymentChannelData.map((channel) => (
            <div className="payment-channel-item" key={channel.label}>
              <div className="payment-channel-row">
                <span>{channel.label}</span>
                <strong>{channel.percentage}%</strong>
              </div>
  
              <div className="progress-track">
                <div
                  className="progress-fill payment-channel-fill"
                  style={{ width: `${channel.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
  
        <div className="digital-summary">
          <div>
            <span>Digital Channels</span>
            <strong>60%</strong>
          </div>
  
          <div>
            <span>Traditional Channels</span>
            <strong>40%</strong>
          </div>
        </div>
      </section>
    );
  }