import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  TriangleAlert,
  UserCheck,
  Users,
} from "lucide-react";

import { useCustomerStore } from "../store/customerStore";
import type {
  ChurnRiskLevel,
  CustomerType,
} from "../types/entities";

const PAGE_SIZE = 8;

type CustomerTypeFilter = "All" | CustomerType;
type StatusFilter = "All" | "Active" | "Inactive";

function getRiskBadgeClasses(risk: ChurnRiskLevel) {
  switch (risk) {
    case "High":
      return "bg-red-100 text-red-700";

    case "Medium":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

export default function CustomerListPage() {
  const customers = useCustomerStore(
    (state) => state.customers
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [customerType, setCustomerType] =
    useState<CustomerTypeFilter>("All");
  const [status, setStatus] =
    useState<StatusFilter>("All");
  const [page, setPage] = useState(1);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        normalizedSearch === "" ||
        customer.customer_name
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.customer_id
          .toLowerCase()
          .includes(normalizedSearch) ||
        (customer.company_name ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesType =
        customerType === "All" ||
        customer.customer_type === customerType;

      const matchesStatus =
        status === "All" ||
        (status === "Active" && customer.is_active) ||
        (status === "Inactive" &&
          !customer.is_active);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    customers,
    searchTerm,
    customerType,
    status,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE)
  );

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const activeCustomerCount = customers.filter(
    (customer) => customer.is_active
  ).length;

  const corporateCustomerCount = customers.filter(
    (customer) =>
      customer.customer_type === "Corporate"
  ).length;

  const highRiskCustomerCount = customers.filter(
    (customer) =>
      customer.potential_churn_rate_flag === "High"
  ).length;

  const resetPage = () => {
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Customers
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Search, filter and review customer accounts.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Customers
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {customers.length}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Active Customers
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {activeCustomerCount}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <UserCheck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Corporate Customers
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {corporateCustomerCount}
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-3">
              <Building2 className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                High Churn Risk
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {highRiskCustomerCount}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <TriangleAlert className="h-6 w-6 text-red-600" />
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
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                resetPage();
              }}
              placeholder="Search by customer name, ID or company..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={customerType}
            onChange={(event) => {
              setCustomerType(
                event.target.value as CustomerTypeFilter
              );
              resetPage();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">
              All Customer Types
            </option>
            <option value="Individual">
              Individual
            </option>
            <option value="Corporate">
              Corporate
            </option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value as StatusFilter
              );
              resetPage();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">
              All Statuses
            </option>
            <option value="Active">
              Active
            </option>
            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer ID
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Churn Risk
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedCustomers.map((customer) => (
                <tr
                  key={customer.customer_id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {customer.customer_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {customer.package_name}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {customer.customer_id}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {customer.customer_type}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {customer.company_name ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={
                        customer.is_active
                          ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {customer.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getRiskBadgeClasses(
                        customer.potential_churn_rate_flag
                      )}`}
                    >
                      {
                        customer.potential_churn_rate_flag
                      }
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/customers/${customer.customer_id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedCustomers.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="font-medium text-slate-700">
                No customers found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginatedCustomers.length} of{" "}
            {filteredCustomers.length} customers
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPage((currentPage) =>
                  Math.max(1, currentPage - 1)
                )
              }
              disabled={page === 1}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2 text-sm font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((currentPage) =>
                  Math.min(
                    totalPages,
                    currentPage + 1
                  )
                )
              }
              disabled={page === totalPages}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}