import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users } from "lucide-react";

import StatusBadge from "../../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../../components/organization/AsyncStates";
import { useAsyncData } from "../../features/organization/useAsyncData";
import { getEmployees } from "../../features/organization/organizationService";
import { formatCurrency, formatDate } from "../../features/organization/format";

const PAGE_SIZE = 10;

type StatusFilter = "All" | "ACTIVE" | "PASSIVE" | "SUSPENDED";

export default function EmployeeListPage() {
  const { data: employees, loading, error } = useAsyncData(getEmployees, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return (employees ?? []).filter((employee) => {
      const matchesSearch =
        normalized === "" ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(normalized) ||
        employee.phoneNumber.includes(normalized);

      const matchesStatus = status === "All" || employee.subscriptionStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <LoadingState label="Loading employees..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
        <p className="mt-1 text-sm text-slate-500">
          Employees belonging to your organization.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or phone number..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(1);
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
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Package</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Commitment Ends</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Latest Invoice</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {employee.firstName} {employee.lastName}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">{employee.phoneNumber}</td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {employee.currentPackage?.packageName ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={employee.subscriptionStatus} />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDate(employee.commitmentEndDate)}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {employee.latestInvoice ? formatCurrency(employee.latestInvoice.totalAmount) : "—"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/organization/employees/${employee.id}`}
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
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <Users className="h-8 w-8 text-slate-300" />
              <p className="font-medium text-slate-700">No employees found</p>
              <p className="text-sm text-slate-500">Try changing your search or filters.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginated.length} of {filtered.length} employees
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
