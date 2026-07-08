import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";

export interface PaymentStatusSlice {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PaymentStatusCardProps {
  data: PaymentStatusSlice[];
}

export default function PaymentStatusCard({ data }: PaymentStatusCardProps) {
  const totalInvoices = data.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <section className="analytics-card payment-health-card">
      <div className="chart-card-header">
        <div>
          <p className="chart-card-eyebrow">Collection Health</p>
          <h2>Payment Status</h2>
          <p>Invoice payment behavior distribution</p>
        </div>
      </div>

      <div className="payment-health-content">
        <div className="payment-donut-wrapper">
          <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer={false}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                rootTabIndex={-1}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={98}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((item) => (
                  <Cell
                    key={item.name}
                    fill={item.color}
                  />
                ))}
              </Pie>


            </PieChart>
          </ResponsiveContainer>

          <div className="payment-donut-center">
          <strong>
{totalInvoices.toLocaleString("en-US")}
</strong>
            <span>Invoices</span>
          </div>
        </div>

        <div className="payment-health-legend">
          {data.map((item) => (
            <div
              className="payment-health-row"
              key={item.name}
            >
              <div className="payment-health-label">
                <span
                  className="payment-health-dot"
                  style={{ backgroundColor: item.color }}
                />

                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.value.toLocaleString("en-US")} invoices
                  </span>
                </div>
              </div>

              <strong className="payment-health-percentage">
                {item.percentage}%
              </strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
