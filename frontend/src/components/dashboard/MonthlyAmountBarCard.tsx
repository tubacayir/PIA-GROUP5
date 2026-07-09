import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface MonthlyAmountDatum {
  label: string;
  amount: number;
}

interface MonthlyAmountBarCardProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  data: MonthlyAmountDatum[];
  formatAmount: (value: number) => string;
  barColor?: string;
}

export default function MonthlyAmountBarCard({
  eyebrow,
  title,
  subtitle,
  data,
  formatAmount,
  barColor = "#0ea5e9",
}: MonthlyAmountBarCardProps) {
  return (
    <section className="analytics-card flex h-full flex-col">
      <div className="chart-card-header">
        <div>
          <p className="chart-card-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div style={{ width: "100%", height: 280, marginTop: 22 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap="35%" maxBarSize={56}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => formatAmount(Number(value))}
              width={70}
            />
            <Tooltip
              formatter={(value) => [formatAmount(Number(value)), "Revenue"]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
              }}
            />
            <Bar dataKey="amount" fill={barColor} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
