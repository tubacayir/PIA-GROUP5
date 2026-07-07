import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgePercent,
  Ban,
  Building2,
  CalendarDays,
  CircleAlert,
  CreditCard,
  FileText,
  Gauge,
  Lightbulb,
  Phone,
  ReceiptText,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useCustomerStore } from "../store/customerStore";
import { useInvoiceStore } from "../store/invoiceStore";
import type { Invoice, InvoiceStatus } from "../types/entities";

type CustomerTab =
  | "overview"
  | "lines"
  | "invoices"
  | "usage"
  | "payments"
  | "insights";

const tabs: Array<{
  id: CustomerTab;
  label: string;
}> = [
  { id: "overview", label: "Overview" },
  { id: "lines", label: "Lines" },
  { id: "invoices", label: "Invoices" },
  { id: "usage", label: "Usage" },
  { id: "payments", label: "Payments" },
  { id: "insights", label: "Insights" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatBillingPeriod(value: string) {
  const [year, month] = value.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInvoiceStatusClasses(
  status: InvoiceStatus
) {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-700";

    case "Overdue":
      return "bg-red-100 text-red-700";

    case "Suspended_Anomalous":
      return "bg-violet-100 text-violet-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

function getUsageClasses(invoice: Invoice) {
  switch (invoice.usage_anomaly_level) {
    case "ShockAnomaly":
      return {
        badge: "bg-red-100 text-red-700",
        bar: "bg-red-500",
        label: "Shock Usage",
      };

    case "SustainableOverage":
      return {
        badge: "bg-amber-100 text-amber-700",
        bar: "bg-amber-500",
        label: "Sustainable Overage",
      };

    default:
      return {
        badge: "bg-emerald-100 text-emerald-700",
        bar: "bg-emerald-500",
        label: "Normal",
      };
  }
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] =
    useState<CustomerTab>("overview");

  const customer = useCustomerStore((state) =>
    state.customers.find(
      (item) => item.customer_id === id
    )
  );

  const allInvoices = useInvoiceStore(
    (state) => state.invoices
  );

  const invoices = useMemo(
    () =>
      allInvoices
        .filter(
          (invoice) => invoice.customer_id === id
        )
        .sort((a, b) =>
          b.billing_period.localeCompare(
            a.billing_period
          )
        ),
    [allInvoices, id]
  );

  if (!customer) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-lg font-semibold text-slate-900">
          Customer not found.
        </p>

        <Link
          to="/customers"
          className="mt-4 inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customer list
        </Link>
      </div>
    );
  }

  const latestInvoice = invoices[0];

  const totalInvoiceAmount = invoices.reduce(
    (sum, invoice) =>
      sum + invoice.total_amount,
    0
  );

  const overdueCount = invoices.filter(
    (invoice) => invoice.status === "Overdue"
  ).length;

  const anomalyCount = invoices.filter(
    (invoice) =>
      invoice.status === "Suspended_Anomalous"
  ).length;

  const hasThreeMonthOverage =
    invoices.length >= 3 &&
    invoices
      .slice(0, 3)
      .every(
        (invoice) =>
          invoice.actual_used_data >
          customer.allocated_data_gb
      );

  const invoiceSummary = [
    {
      label: "Invoice History",
      value: invoices.length.toString(),
      helper: "records currently loaded",
      icon: FileText,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Billed",
      value: formatCurrency(totalInvoiceAmount),
      helper: "across loaded periods",
      icon: ReceiptText,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      label: "Overdue",
      value: overdueCount.toString(),
      helper: "invoice records",
      icon: CircleAlert,
      iconClass: "bg-red-50 text-red-600",
    },
    {
      label: "Anomalies",
      value: anomalyCount.toString(),
      helper: "requires review",
      icon: ShieldAlert,
      iconClass: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <Link
        to="/customers"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customer list
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 p-6 text-white">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                {customer.customer_type ===
                "Corporate" ? (
                  <Building2 className="h-7 w-7" />
                ) : (
                  <UserRound className="h-7 w-7" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {customer.customer_name}
                  </h1>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                    {customer.customer_type}
                  </span>

                  <span
                    className={
                      customer.is_active
                        ? "rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200"
                        : "rounded-full bg-slate-400/20 px-3 py-1 text-xs font-semibold text-slate-200"
                    }
                  >
                    {customer.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  {customer.customer_id}

                  {customer.company_name
                    ? ` • ${customer.company_name}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Current Package
                </p>

                <p className="mt-1 font-semibold">
                  {customer.package_name}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Monthly Fee
                </p>

                <p className="mt-1 font-semibold">
                  {formatCurrency(
                    customer.monthly_fee
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Churn Risk
                </p>

                <p className="mt-1 font-semibold">
                  {
                    customer.potential_churn_rate_flag
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-b border-slate-200 px-3">
          <nav className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`border-b-2 px-4 py-4 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {activeTab === "overview" && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {invoiceSummary.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {item.label}
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-950">
                        {item.value}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.helper}
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Customer Overview
                  </h2>

                  <p className="text-sm text-slate-500">
                    Main account and contract information
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Customer ID
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {customer.customer_id}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Customer Type
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {customer.customer_type}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Company
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {customer.company_name ??
                      "Individual account"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Registration Date
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {formatDate(
                      customer.registration_date
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Contract End Date
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {formatDate(
                      customer.contract_end_date
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Preferred Channel
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {
                      customer.preferred_channel_trend
                    }
                  </dd>
                </div>
              </dl>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Activity className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Smart Snapshot
                  </h2>

                  <p className="text-sm text-slate-500">
                    Current customer intelligence summary
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Loyalty
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {customer.is_loyal_customer
                      ? `${customer.loyalty_discount_percent}% discount eligibility after ${customer.loyalty_years} years.`
                      : `${customer.loyalty_years} years of customer tenure.`}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Package Recommendation
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {hasThreeMonthOverage ||
                    customer.suggest_upper_package
                      ? "Upper package review is recommended."
                      : "Current package is suitable for the loaded usage history."}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Latest Invoice
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {latestInvoice
                      ? `${formatBillingPeriod(
                          latestInvoice.billing_period
                        )} • ${latestInvoice.status}`
                      : "No invoice data is currently loaded."}
                  </p>
                </div>
              </div>
            </article>
          </section>
        </>
      )}

      {activeTab === "lines" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Phone className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Customer Lines
              </h2>

              <p className="text-sm text-slate-500">
                Line, package, and contract information
              </p>
            </div>
          </div>

          <article className="mt-6 rounded-2xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-950">
                    Primary Customer Line
                  </h3>

                  <span
                    className={
                      customer.is_active
                        ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                        : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                    }
                  >
                    {customer.is_active
                      ? "ACTIVE"
                      : "INACTIVE"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  MSISDN will be connected when the
                  Customer Line API is ready.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Monthly Fee
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {formatCurrency(
                    customer.monthly_fee
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Package
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {customer.package_name}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Data Quota
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {customer.allocated_data_gb} GB
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Registration
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(
                    customer.registration_date
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Contract End
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(
                    customer.contract_end_date
                  )}
                </p>
              </div>
            </div>
          </article>
        </section>
      )}

      {activeTab === "invoices" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Invoice History
                </h2>

                <p className="text-sm text-slate-500">
                  Three-month invoice history structure
                </p>
              </div>
            </div>
          </div>

          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invoice
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Period
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Delivery
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.invoice_id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {invoice.invoice_id}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatBillingPeriod(
                          invoice.billing_period
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatCurrency(
                          invoice.total_amount
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(invoice.due_date)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {invoice.delivery_method}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getInvoiceStatusClasses(
                            invoice.status
                          )}`}
                        >
                          {invoice.status.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-slate-500">
              No invoices found for this customer.
            </div>
          )}
        </section>
      )}

      {activeTab === "usage" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Gauge className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Usage Analysis
              </h2>

              <p className="text-sm text-slate-500">
                Package quota compared with actual data
                usage
              </p>
            </div>
          </div>

          {invoices.length > 0 ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {invoices.map((invoice) => {
                const usage =
                  getUsageClasses(invoice);

                const usageRate = Math.round(
                  (invoice.actual_used_data /
                    customer.allocated_data_gb) *
                    100
                );

                return (
                  <article
                    key={invoice.invoice_id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-slate-900">
                        {formatBillingPeriod(
                          invoice.billing_period
                        )}
                      </p>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${usage.badge}`}
                      >
                        {usage.label}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Actual Usage
                          </p>

                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            {invoice.actual_used_data} GB
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-slate-500">
                          {usageRate}%
                        </p>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${usage.bar}`}
                          style={{
                            width: `${Math.min(
                              100,
                              usageRate
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-3 flex justify-between text-xs text-slate-500">
                        <span>
                          Quota:{" "}
                          {customer.allocated_data_gb} GB
                        </span>

                        <span>
                          Overage:{" "}
                          {invoice.overage_percent}%
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              No usage records are currently available.
            </p>
          )}
        </section>
      )}

      {activeTab === "payments" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Payment History
                </h2>

                <p className="text-sm text-slate-500">
                  Payment date, channel, amount, and
                  status
                </p>
              </div>
            </div>
          </div>

          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invoice
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment Date
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Channel
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.invoice_id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {invoice.invoice_id}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          invoice.payment_date
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {invoice.payment_channel?.replace(
                          "_",
                          " "
                        ) ?? "Not paid"}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatCurrency(
                          invoice.total_amount
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getInvoiceStatusClasses(
                            invoice.status
                          )}`}
                        >
                          {invoice.status === "Paid"
                            ? "SUCCESS"
                            : invoice.status ===
                                "Suspended_Anomalous"
                              ? "REVIEW"
                              : "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-slate-500">
              No payment records are currently
              available.
            </div>
          )}
        </section>
      )}

      {activeTab === "insights" && (
        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Lightbulb className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Package Recommendation
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {hasThreeMonthOverage ||
                  customer.suggest_upper_package
                    ? "An upper package should be recommended because the customer shows a repeated overage pattern."
                    : "No three-month consecutive overage pattern has been detected yet."}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BadgePercent className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Loyalty
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {customer.is_loyal_customer
                    ? `Customer has ${customer.loyalty_years} years of tenure and is eligible for a ${customer.loyalty_discount_percent}% loyalty discount.`
                    : `Customer has ${customer.loyalty_years} years of tenure and has not reached the five-year loyalty threshold.`}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Ban className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Restriction
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {overdueCount >= 2
                    ? "At least two overdue invoices were detected. Restriction review is required."
                    : "No repeated overdue pattern requiring a restriction was detected."}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Anomaly
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {anomalyCount > 0
                    ? `${anomalyCount} anomalous invoice record requires admin review.`
                    : "No shock-usage or suspicious invoice pattern was detected in the loaded history."}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-blue-100 bg-blue-50 p-6 md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  
                </p>
              </div>
            </div>
          </article>
        </section>
      )}
    </div>
  );
}