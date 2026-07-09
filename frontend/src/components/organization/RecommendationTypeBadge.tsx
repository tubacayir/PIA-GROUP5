const TONE_BY_TYPE: Record<string, string> = {
  UPGRADE: "bg-emerald-100 text-emerald-700",
  DOWNGRADE: "bg-orange-100 text-orange-700",
  NO_CHANGE: "bg-slate-100 text-slate-600",
};

export default function RecommendationTypeBadge({ type }: { type: string | null | undefined }) {
  if (!type) {
    return <span className="text-slate-400">—</span>;
  }

  const classes = TONE_BY_TYPE[type] ?? "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      {type.replace("_", " ")}
    </span>
  );
}

export function HighPriorityBadge() {
  return (
    <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
      High Priority
    </span>
  );
}
