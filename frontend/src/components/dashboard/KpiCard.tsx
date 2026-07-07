import type { LucideIcon } from "lucide-react";

type KpiTone = "blue" | "green" | "amber" | "red";

type KpiCardProps = {
  title: string;
  value: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  tone: KpiTone;
};

export default function KpiCard({
  title,
  value,
  description,
  badge,
  icon: Icon,
  tone,
}: KpiCardProps) {
  return (
    <article className={`kpi-card kpi-card-${tone}`}>
      <div className="kpi-card-top">
        <div>
          <p className="kpi-card-title">{title}</p>
          <h2 className="kpi-card-value">{value}</h2>
        </div>

        <div className={`kpi-icon kpi-icon-${tone}`}>
          <Icon size={20} strokeWidth={2} />
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