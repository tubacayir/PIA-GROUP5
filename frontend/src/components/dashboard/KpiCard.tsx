type KpiCardProps = {
    title: string;
    value: string;
    description: string;
  };
  
  export default function KpiCard({
    title,
    value,
    description,
  }: KpiCardProps) {
    return (
      <div className="kpi-card">
        <p className="kpi-card-title">{title}</p>
        <h2 className="kpi-card-value">{value}</h2>
        <p className="kpi-card-description">{description}</p>
      </div>
    );
  }