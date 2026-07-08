import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface MonthlyCountDatum {
  label: string;
  count: number;
}

interface MonthlyCountAreaCardProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  data: MonthlyCountDatum[];
  strokeColor?: string;
}

export default function MonthlyCountAreaCard({
  eyebrow,
  title,
  subtitle,
  data,
  strokeColor = "#ef4444",
}: MonthlyCountAreaCardProps) {
  return (
    <section className="analytics-card">
      <div className="chart-card-header">
        <div>
          <p className="chart-card-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div style={{ width: "100%", height: 280, marginTop: 22 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="latePaymentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={50} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={strokeColor}
              strokeWidth={3}
              fill="url(#latePaymentGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
