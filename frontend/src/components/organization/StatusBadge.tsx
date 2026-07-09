const TONE_BY_STATUS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PASSIVE: "bg-slate-100 text-slate-600",
  SUSPENDED: "bg-red-100 text-red-700",
  DELETED: "bg-slate-200 text-slate-500",
  CREATED: "bg-blue-100 text-blue-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) {
    return <span className="text-slate-400">—</span>;
  }

  const classes = TONE_BY_STATUS[status] ?? "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
}
