import { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import StatusBadge from "../components/organization/StatusBadge";
import RecommendationTypeBadge, { HighPriorityBadge } from "../components/organization/RecommendationTypeBadge";
import { ErrorState, LoadingState } from "../components/organization/AsyncStates";
import { useAsyncData } from "../features/admin/useAsyncData";
import {
  getRecommendations,
  rejectRecommendation,
  suggestRecommendation,
} from "../features/admin/adminService";
import type {
  RecommendationFilters,
  RecommendationStatus,
  RecommendationType,
} from "../features/admin/adminTypes";

const PAGE_SIZE = 10;

type StatusFilter = "All" | RecommendationStatus;
type TypeFilter = "All" | RecommendationType;

export default function RecommendationsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [type, setType] = useState<TypeFilter>("All");
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [actingId, setActingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const filters: RecommendationFilters = {
    status: status === "All" ? undefined : status,
    type: type === "All" ? undefined : type,
    highPriorityOnly: highPriorityOnly || undefined,
  };

  const {
    data: recommendations,
    loading,
    error,
    setData,
  } = useAsyncData(() => getRecommendations(filters), [status, type, highPriorityOnly]);

  const resetPage = () => setPage(1);

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");
  const filtered = (recommendations ?? []).filter((recommendation) => {
    if (!normalizedSearch) {
      return true;
    }
    const name = (recommendation.customerName ?? recommendation.organizationName ?? "").toLocaleLowerCase("tr-TR");
    return name.includes(normalizedSearch);
  });

  const sorted = [...filtered].sort(
    (a, b) => (b.isHighPriority ? 1 : 0) - (a.isHighPriority ? 1 : 0)
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSuggest = async (id: number) => {
    setActingId(id);
    setActionError(null);
    try {
      const updated = await suggestRecommendation(id);
      setData((current) => current?.map((r) => (r.id === id ? updated : r)) ?? current);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "İşlem başarısız oldu.");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Bu öneriyi reddetmek istediğinize emin misiniz?")) {
      return;
    }
    setActingId(id);
    setActionError(null);
    try {
      const updated = await rejectRecommendation(id);
      setData((current) => current?.map((r) => (r.id === id ? updated : r)) ?? current);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "İşlem başarısız oldu.");
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading recommendations..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Recommendations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review package upgrade/downgrade recommendations and suggest them to the customer or organization,
          who will approve or reject them on their side.
        </p>
      </div>

      {actionError && <ErrorState message={actionError} />}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative flex-1 lg:min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                resetPage();
              }}
              placeholder="Search by customer or company name..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              resetPage();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUGGESTED">Suggested</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as TypeFilter);
              resetPage();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Types</option>
            <option value="UPGRADE">Upgrade</option>
            <option value="DOWNGRADE">Downgrade</option>
            <option value="NO_CHANGE">No Change</option>
          </select>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              checked={highPriorityOnly}
              onChange={(event) => {
                setHighPriorityOnly(event.target.checked);
                resetPage();
              }}
              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-200"
            />
            High priority only
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer / Organization</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Package Change</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Avg Usage</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Confidence</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((recommendation) => (
                <tr key={recommendation.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {recommendation.customerName ?? recommendation.organizationName ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{recommendation.reason}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {recommendation.currentPackage?.packageName ?? "—"}
                    {recommendation.suggestedPackage && (
                      <>
                        {" "}
                        &rarr; <span className="font-medium text-slate-900">{recommendation.suggestedPackage.packageName}</span>
                      </>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <RecommendationTypeBadge type={recommendation.recommendationType} />
                      {recommendation.isHighPriority && <HighPriorityBadge />}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {recommendation.averageUsageRatio != null ? `%${recommendation.averageUsageRatio}` : "—"}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{recommendation.confidenceScore}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={recommendation.status} />
                  </td>
                  <td className="px-5 py-4">
                    {recommendation.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleSuggest(recommendation.id)}
                          disabled={actingId === recommendation.id}
                          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {actingId === recommendation.id ? "Suggesting..." : "Suggest"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(recommendation.id)}
                          disabled={actingId === recommendation.id}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {actingId === recommendation.id ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    ) : recommendation.status === "SUGGESTED" ? (
                      <p className="text-right text-xs text-slate-500">Awaiting their approval</p>
                    ) : (
                      <p className="text-right text-xs text-slate-400">—</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-medium text-slate-700">No recommendations found</p>
              <p className="mt-1 text-sm text-slate-500">Try changing your filters.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginated.length} of {sorted.length} recommendations
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-2 text-sm font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
