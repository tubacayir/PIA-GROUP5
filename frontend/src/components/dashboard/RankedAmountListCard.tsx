export interface RankedAmountDatum {
  name: string;
  amount: number;
}

interface RankedAmountListCardProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  data: RankedAmountDatum[];
  formatAmount: (value: number) => string;
}

export default function RankedAmountListCard({
  eyebrow,
  title,
  subtitle,
  data,
  formatAmount,
}: RankedAmountListCardProps) {
  return (
    <section className="analytics-card flex h-full flex-col">
      <div className="chart-card-header">
        <div>
          <p className="chart-card-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-center divide-y divide-slate-100">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                {index + 1}
              </div>
              <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
            </div>
            <p className="shrink-0 whitespace-nowrap text-sm font-bold text-slate-950">{formatAmount(item.amount)}</p>
          </div>
        ))}

        {data.length === 0 && (
          <p className="py-6 text-sm text-slate-500">No data available.</p>
        )}
      </div>
    </section>
  );
}
