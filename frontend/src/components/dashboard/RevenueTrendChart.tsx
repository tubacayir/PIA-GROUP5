import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
  } from "recharts";
  
  import { revenueTrendData } from "../../mock/dashboardMock";
  
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TRY",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  
  export default function RevenueTrendChart() {
    return (
      <section className="analytics-card revenue-trend-card">
        <div className="chart-card-header">
          <div>
            <p className="chart-card-eyebrow">Financial Performance</p>
            <h2>Revenue & Collection Trend</h2>
            <p>
              Monthly billed and successfully collected invoice value
            </p>
          </div>
  
          <div className="chart-legend">
            <div>
              <span className="legend-dot legend-dot-billed" />
              Billed
            </div>
  
            <div>
              <span className="legend-dot legend-dot-collected" />
              Collected
            </div>
          </div>
        </div>
  
        <div className="revenue-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueTrendData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="billedGradient"
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
                  id="collectedGradient"
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
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 12,
                }}
                tickFormatter={formatCurrency}
                width={70}
              />
  
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                }}
              />
  
              <Area
                type="monotone"
                dataKey="billed"
                name="Billed"
                stroke="#2563eb"
                strokeWidth={3}
                fill="url(#billedGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                }}
              />
  
              <Area
                type="monotone"
                dataKey="collected"
                name="Collected"
                stroke="#16a34a"
                strokeWidth={3}
                fill="url(#collectedGradient)"
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