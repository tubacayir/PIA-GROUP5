import type { LucideIcon } from "lucide-react";

export type KpiTone = "blue" | "green" | "amber" | "red";

export type KpiCardProps = {
  title: string;
  value: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  tone: KpiTone;
  size?: "sm" | "lg";
};

const ICON_SIZE: Record<"sm" | "lg", number> = {
  sm: 18,
  lg: 30,
};

export default function KpiCard({
  title,
  value,
  description,
  badge,
  icon: Icon,
  tone,
  size = "sm",
}: KpiCardProps) {
  return (
    <article className={`kpi-card kpi-card-${tone}`}>
      <div className="kpi-card-top">
        <div className="kpi-card-heading">
          <p className="kpi-card-title">{title}</p>
          <h2 className="kpi-card-value">{value}</h2>
        </div>

        <div className={`kpi-icon kpi-icon-${tone}`}>
          <Icon size={ICON_SIZE[size]} strokeWidth={2} />
        </div>
      </div>

      <p className="kpi-card-description">{description}</p>

      <div className="kpi-card-footer">
        <span className={`kpi-badge kpi-badge-${tone}`}>
          {badge}
        </span>
      </div>
    </article>
  );
}