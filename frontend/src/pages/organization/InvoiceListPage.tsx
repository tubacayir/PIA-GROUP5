import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ReceiptText, Search } from "lucide-react";

import MetricCard from "../../components/organization/MetricCard";
import StatusBadge from "../../components/organization/StatusBadge";
import Pagination from "../../components/organization/Pagination";
import { ErrorState, LoadingState } from "../../components/organization/AsyncStates";
import { useAsyncData } from "../../features/organization/useAsyncData";
import {
  getInvoiceAnalytics,
  getInvoices,
} from "../../features/organization/organizationService";
import { formatCurrency, formatDate } from "../../features/organization/format";

const PAGE_SIZE = 10;

type StatusFilter = "All" | "CREATED" | "PAID" | "OVERDUE" | "CANCELLED";

export default function InvoiceListPage() {
  const invoices = useAsyncData(getInvoices, []);
  const analytics = useAsyncData(getInvoiceAnalytics, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return (invoices.data ?? []).filter((invoice) => {
      const matchesSearch =
        normalized === "" ||
        invoice.invoiceNumber.toLowerCase().includes(normalized) ||
        invoice.employeeName.toLowerCase().includes(normalized) ||
        invoice.phoneNumber.includes(normalized);

      const matchesStatus = status === "All" || invoice.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [invoices.data, searchTerm, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (invoices.loading) {
    return <LoadingState label="Loading invoices..." />;
  }

  if (invoices.error) {
    return <ErrorState message={invoices.error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">
          Invoices belonging to your organization.
        </p>
      </div>

      {analytics.data && (
        <section className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Average Invoice Amount"
            value={formatCurrency(analytics.data.averageInvoiceAmount)}
            icon={ReceiptText}
            tone="blue"
          />

          <MetricCard
            label="Total Invoices"
            value={String(invoices.data?.length ?? 0)}
            icon={ReceiptText}
            tone="violet"
          />
        </section>
      )}

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
              placeholder="Search by invoice number, employee or phone..."
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
            <option value="CREATED">Created</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Invoice</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Issue Date</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{invoice.invoiceNumber}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {invoice.employeeName}
                    <span className="block text-xs text-slate-400">{invoice.phoneNumber}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(invoice.issueDate)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(invoice.dueDate)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/organization/invoices/${invoice.id}`}
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
              <ReceiptText className="h-8 w-8 text-slate-300" />
              <p className="font-medium text-slate-700">No invoices found</p>
              <p className="text-sm text-slate-500">Try changing your search or filters.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginated.length} of {filtered.length} invoices
          </p>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
}
