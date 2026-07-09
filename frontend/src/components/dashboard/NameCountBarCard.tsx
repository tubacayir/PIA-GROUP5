import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface NameCountDatum {
  name: string;
  count: number;
}

interface NameCountBarCardProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  data: NameCountDatum[];
  barColor?: string;
  layout?: "horizontal" | "vertical";
}

export default function NameCountBarCard({
  eyebrow,
  title,
  subtitle,
  data,
  barColor = "#2563eb",
  layout = "vertical",
}: NameCountBarCardProps) {
  return (
    <section className="analytics-card flex h-full flex-col">
      <div className="chart-card-header">
        <div>
          <p className="chart-card-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center" style={{ width: "100%", minHeight: 260, marginTop: 22 }}>
        <ResponsiveContainer width="100%" height={260}>
          {layout === "vertical" ? (
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              barCategoryGap="28%"
            >
              <CartesianGrid horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={110}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Bar dataKey="count" fill={barColor} barSize={14} radius={[0, 8, 8, 0]} />
            </BarChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={40} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Bar dataKey="count" fill={barColor} barSize={28} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
