import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, Search, UserCheck, Users } from "lucide-react";

import CompanyFormModal from "../components/admin/CompanyFormModal";
import StatusBadge from "../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../components/organization/AsyncStates";
import { useAsyncData } from "../features/admin/useAsyncData";
import { createOrganization, getOrganizations } from "../features/admin/adminService";
import type { OrganizationFilters } from "../features/admin/adminTypes";

const PAGE_SIZE = 10;

type StatusFilter = "All" | "ACTIVE" | "PASSIVE" | "SUSPENDED";

export default function CompanyListPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const timeout = setTimeout(() => setCity(cityInput), 300);
    return () => clearTimeout(timeout);
  }, [cityInput]);

  const filters: OrganizationFilters = {
    search: search || undefined,
    city: city || undefined,
    status: status === "All" ? undefined : status,
  };

  const {
    data: organizations,
    loading,
    error,
    setData,
  } = useAsyncData(() => getOrganizations(filters), [search, city, status]);

  const filtered = organizations ?? [];
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const activeCount = filtered.filter((o) => o.status === "ACTIVE").length;
  const totalSubscriptions = filtered.reduce((sum, o) => sum + o.subscriptionCount, 0);

  if (loading) {
    return <LoadingState label="Loading companies..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage corporate accounts on the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Company
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Companies</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{filtered.length}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Companies</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <UserCheck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Subscriptions</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{totalSubscriptions}</p>
            </div>
            <div className="rounded-xl bg-violet-50 p-3">
              <Users className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                resetPage();
              }}
              placeholder="Search by company name or tax ID..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <input
            type="text"
            value={cityInput}
            onChange={(event) => {
              setCityInput(event.target.value);
              resetPage();
            }}
            placeholder="City"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 lg:w-40"
          />

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              resetPage();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PASSIVE">Passive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Company</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tax ID</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Sector</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">City</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Subscriptions</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((org) => (
                <tr key={org.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{org.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{org.taxIdentityNumber}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{org.sector}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{org.city}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{org.subscriptionCount}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={org.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/companies/${org.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="font-medium text-slate-700">No companies found</p>
              <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginated.length} of {filtered.length} companies
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

      {showCreateModal && (
        <CompanyFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (values) => {
            const created = await createOrganization(values);
            setData((current) => (current ? [created, ...current] : [created]));
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
