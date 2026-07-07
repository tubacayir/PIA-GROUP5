import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import StatusBadge from "../../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../../components/organization/AsyncStates";
import { useAsyncData } from "../../features/organization/useAsyncData";
import { getInvoice } from "../../features/organization/organizationService";
import { formatCurrency, formatDate } from "../../features/organization/format";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <InvoiceDetailContent key={id} invoiceId={Number(id)} />;
}

function InvoiceDetailContent({ invoiceId }: { invoiceId: number }) {
  const { data: invoice, loading, error } = useAsyncData(() => getInvoice(invoiceId), [invoiceId]);

  if (loading) {
    return <LoadingState label="Loading invoice..." />;
  }

  if (error || !invoice) {
    return <ErrorState message={error ?? "Invoice not found."} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/organization/invoices"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {invoice.phoneNumber} · {invoice.packageName}
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="font-bold text-slate-950">Summary</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Subscription</dt>
              <dd className="font-medium text-slate-900">{invoice.subscriptionNumber}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <StatusBadge status={invoice.status} />
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Issue Date</dt>
              <dd className="font-medium text-slate-900">{formatDate(invoice.issueDate)}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Due Date</dt>
              <dd className="font-medium text-slate-900">{formatDate(invoice.dueDate)}</dd>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <dt className="font-semibold text-slate-700">Total Amount</dt>
              <dd className="text-lg font-bold text-slate-950">{formatCurrency(invoice.totalAmount)}</dd>
            </div>
          </dl>
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-950">Invoice Lines</h2>
            <p className="mt-1 text-sm text-slate-500">Charges that make up this invoice</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Qty</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Unit Price</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                </tr>
              </thead>

              <tbody>
                {invoice.lines.map((line, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {line.lineType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{line.description}</td>
                    <td className="px-5 py-4 text-right text-sm text-slate-600">{line.quantity}</td>
                    <td className="px-5 py-4 text-right text-sm text-slate-600">{formatCurrency(line.unitPrice)}</td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(line.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {invoice.lines.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-slate-500">No line items for this invoice.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
