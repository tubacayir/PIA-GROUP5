import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export interface RevenueTrendPoint {
  month: string;
  issued: number;
  paidOnTime: number;
}

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
}

export default function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const maxValue = Math.max(...data.map((point) => point.issued), 1);
  const yDomain: [number, number] = [0, Math.ceil(maxValue * 1.1)];

  return (
    <section className="analytics-card revenue-trend-card">
      <div className="chart-card-header">
        <div>
          <p className="chart-card-eyebrow">
            Invoice Performance
          </p>

          <h2>Invoice & Payment Trend</h2>

          <p>
            Monthly issued and on-time paid invoice counts
          </p>
        </div>

        <div className="chart-legend">
          <div>
            <span className="legend-dot legend-dot-billed" />
            Issued
          </div>

          <div>
            <span className="legend-dot legend-dot-collected" />
            Paid on Time
          </div>
        </div>
      </div>

      <div className="revenue-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="issuedGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#2563eb"
                  stopOpacity={0.2}
                />

                <stop
                  offset="95%"
                  stopColor="#2563eb"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="paidGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#16a34a"
                  stopOpacity={0.15}
                />

                <stop
                  offset="95%"
                  stopColor="#16a34a"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 12,
              }}
              dy={10}
            />

<YAxis
  domain={yDomain}
  axisLine={false}
  tickLine={false}
  tick={{
    fill: "#94a3b8",
    fontSize: 12,
  }}
  tickFormatter={formatNumber}
  width={70}
/>

            <Tooltip
              formatter={(value) => [
                formatNumber(Number(value)),
                "",
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 10px 30px rgba(15, 23, 42, 0.08)",
              }}
            />

            <Area
              type="monotone"
              dataKey="issued"
              name="Issued"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#issuedGradient)"
              dot={false}
              activeDot={{
                r: 5,
              }}
            />

            <Area
              type="monotone"
              dataKey="paidOnTime"
              name="Paid on Time"
              stroke="#16a34a"
              strokeWidth={3}
              fill="url(#paidGradient)"
              dot={false}
              activeDot={{
                r: 5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
