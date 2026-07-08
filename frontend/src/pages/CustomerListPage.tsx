import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  TriangleAlert,
  UserCheck,
  Users,
} from "lucide-react";

import CustomerFormModal from "../components/admin/CustomerFormModal";
import StatusBadge from "../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../components/organization/AsyncStates";
import { useAsyncData } from "../features/admin/useAsyncData";
import { createCustomer, getCustomers, getPackages } from "../features/admin/adminService";
import type { CustomerFilters, Gender } from "../features/admin/adminTypes";

const PAGE_SIZE = 10;

type StatusFilter = "All" | "ACTIVE" | "PASSIVE" | "SUSPENDED";
type TypeFilter = "All" | "Individual" | "Corporate";
type GenderFilter = "All" | Gender;

export default function CustomerListPage() {
  const { data: packages } = useAsyncData(getPackages, []);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState<GenderFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [customerType, setCustomerType] = useState<TypeFilter>("All");
  const [packageId, setPackageId] = useState<string>("All");
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

  const filters: CustomerFilters = {
    search: search || undefined,
    city: city || undefined,
    gender: gender === "All" ? undefined : gender,
    status: status === "All" ? undefined : status,
    customerType: customerType === "All" ? undefined : customerType,
    packageId: packageId === "All" ? undefined : Number(packageId),
  };

  const {
    data: customers,
    loading,
    error,
    setData,
  } = useAsyncData(() => getCustomers(filters), [search, city, gender, status, customerType, packageId]);

  const filtered = customers ?? [];
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const activeCount = filtered.filter((c) => c.status === "ACTIVE").length;
  const corporateCount = filtered.filter((c) => c.customerType === "Corporate").length;
  const noSubscriptionCount = filtered.filter((c) => c.subscriptionCount === 0).length;

  if (loading) {
    return <LoadingState label="Loading customers..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter and manage customer accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Customer
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Customers</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{(customers ?? []).length}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Customers</p>
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
              <p className="text-sm text-slate-500">Corporate Customers</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{corporateCount}</p>
            </div>
            <div className="rounded-xl bg-violet-50 p-3">
              <Building2 className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">No Subscription</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{noSubscriptionCount}</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3">
              <TriangleAlert className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative flex-1 lg:min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                resetPage();
              }}
              placeholder="Search by name..."
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
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 lg:w-32"
          />

          <select
            value={gender}
            onChange={(event) => {
              setGender(event.target.value as GenderFilter);
              resetPage();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="UNSPECIFIED">Unspecified</option>
          </select>

          <select
            value={customerType}
            onChange={(event) => {
              setCustomerType(event.target.value as TypeFilter);
              resetPage();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Customer Types</option>
            <option value="Individual">Individual</option>
            <option value="Corporate">Corporate</option>
          </select>

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

          <select
            value={packageId}
            onChange={(event) => {
              setPackageId(event.target.value);
              resetPage();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Packages</option>
            {(packages ?? []).map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.packageName}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">City</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Gender</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Age</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Subscriptions</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{customer.customerType}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{customer.city}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{customer.gender}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{customer.age}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{customer.subscriptionCount}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/customers/${customer.id}`}
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
              <p className="font-medium text-slate-700">No customers found</p>
              <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginated.length} of {filtered.length} customers
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
        <CustomerFormModal
          mode="create"
          packages={packages ?? []}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (values) => {
            const created = await createCustomer({
              tcIdentityNumber: values.tcIdentityNumber,
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phoneNumber: values.phoneNumber,
              password: values.password,
              birthDate: values.birthDate,
              gender: values.gender,
              city: values.city,
              tariffPackageId: Number(values.tariffPackageId),
            });
            setData((current) => (current ? [created, ...current] : [created]));
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
