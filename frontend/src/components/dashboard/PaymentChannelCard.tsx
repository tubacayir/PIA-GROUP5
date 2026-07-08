import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface PaymentChannelSlice {
  label: string;
  percentage: number;
  isPhysical?: boolean;
}

interface PaymentChannelCardProps {
  data: PaymentChannelSlice[];
}

export default function PaymentChannelCard({ data }: PaymentChannelCardProps) {
  const digitalChannelRate = data
    .filter((item) => !item.isPhysical)
    .reduce(
      (total, item) => total + item.percentage,
      0
    );

  const physicalChannelRate = data
    .filter((item) => item.isPhysical)
    .reduce((total, item) => total + item.percentage, 0);

  return (
    <section className="analytics-card payment-channel-card">
      <div className="chart-card-header">
        <div>
          <p className="chart-card-eyebrow">
            Channel Adoption
          </p>

          <h2>Payment Channels</h2>

          <p>
            Customer payment channel distribution
          </p>
        </div>
      </div>

      <div className="payment-channel-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 45,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="#f1f5f9"
            />

            <XAxis
              type="number"
              domain={[0, 100]}
              hide
            />

            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              width={90}
              tick={{
                fill: "#475569",
                fontSize: 12,
              }}
            />

            <Tooltip
              formatter={(value) => [
                `${value}%`,
                "Channel share",
              ]}
              cursor={{
                fill: "#f8fafc",
              }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 10px 30px rgba(15, 23, 42, 0.08)",
              }}
            />

            <Bar
              dataKey="percentage"
              fill="#2563eb"
              barSize={14}
              radius={[0, 8, 8, 0]}
            >
              <LabelList
                dataKey="percentage"
                position="right"
                formatter={(value) => `${value}%`}
                style={{
                  fill: "#0f172a",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="channel-summary">
<div>
  <span>Digital Channels</span>
  <strong>{Math.round(digitalChannelRate)}%</strong>
  <p>Mobile App + Web + Bank App + Auto Payment</p>
</div>

<div>
  <span>Physical Channel</span>
  <strong>{Math.round(physicalChannelRate)}%</strong>
  <p>Store payments</p>
</div>
</div>
    </section>
  );
}
