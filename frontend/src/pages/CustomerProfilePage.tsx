import {
    Activity,
    ArrowRight,
    CalendarDays,
    CreditCard,
    FileText,
    Gauge,
    LogOut,
    Package,
    Phone,
    ReceiptText,
    ShieldCheck,
    Sparkles,
    Eye, 
    X,
    UserRound,
  } from "lucide-react";
  import { Link } from "react-router-dom";
  
  import { useAuthStore } from "../features/auth/authStore";
  import { useCustomerStore } from "../store/customerStore";
  import { useInvoiceStore } from "../store/invoiceStore";
  import type {
    Invoice,
    InvoiceStatus,
    UsageAnomalyLevel,
  } from "../types/entities";
  import { useState } from "react";

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
  
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(
      new Date(Number(year), Number(month) - 1, 1)
    );
  }
  
  function getStatusClasses(status: InvoiceStatus) {
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
  
  function getUsageInfo(
    level: UsageAnomalyLevel
  ) {
    switch (level) {
      case "ShockAnomaly":
        return {
          label: "Shock Usage",
          classes: "bg-red-100 text-red-700",
        };
  
      case "SustainableOverage":
        return {
          label: "Over Package",
          classes: "bg-amber-100 text-amber-700",
        };
  
      default:
        return {
          label: "Normal Usage",
          classes: "bg-emerald-100 text-emerald-700",
        };
    }
  }
  
  export default function CustomerProfilePage() {
    const [selectedInvoice, setSelectedInvoice] =
  useState<Invoice | null>(null);
    const user = useAuthStore((state) => state.user);
  
    const customers = useCustomerStore(
      (state) => state.customers
    );
  
    const allInvoices = useInvoiceStore(
        
      (state) => state.invoices
    );
  
    
    const customer =
      customers.find(
        (item) =>
          item.customer_id === String(user?.customerId)
      ) ??
      customers.find(
        (item) => item.customer_type === "Individual"
      );
  
    if (!customer) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <UserRound className="mx-auto h-10 w-10 text-slate-400" />
  
            <h1 className="mt-4 text-xl font-bold text-slate-950">
              Customer account not found
            </h1>
  
            <p className="mt-2 text-sm text-slate-500">
              The customer profile could not be loaded.
            </p>
  
            <Link
              to="/logout"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600"
            >
              Return to login
            </Link>
          </div>
        </main>
      );
    }
  
    const invoices = allInvoices
      .filter(
        (invoice) =>
          invoice.customer_id === customer.customer_id
      )
      
      .sort((a, b) =>
        b.billing_period.localeCompare(
          a.billing_period
        )
      );
    
    const subscriptionNumber = `PC-${customer.customer_id
      .replace(/\D/g, "")
      .slice(-8)
      .padStart(8, "0")}`;
    
    const threeMonthInvoices = invoices.slice(0, 3);
    
    const threeMonthInvoiceTotal =
      threeMonthInvoices.reduce(
        (sum, invoice) =>
          sum + invoice.total_amount,
        0
      );
    
    const threeMonthInvoiceAverage =
      threeMonthInvoices.length > 0
        ? threeMonthInvoiceTotal /
          threeMonthInvoices.length
        : 0;
    
    const highestThreeMonthInvoice =
      threeMonthInvoices.length > 0
        ? Math.max(
            ...threeMonthInvoices.map(
              (invoice) => invoice.total_amount
            )
          )
        : 0;
    
    const latestInvoice = invoices[0];
    
  
    const paidInvoiceCount = invoices.filter(
      (invoice) => invoice.status === "Paid"
    ).length;
  
    const unpaidInvoices = invoices.filter(
        (invoice) => invoice.status !== "Paid"
      );
      
      const remainingPayment = unpaidInvoices.reduce(
        (sum, invoice) =>
          sum + invoice.total_amount,
        0
      );
      
      const hasOutstandingPayment =
        remainingPayment > 0;
  
    const usageRate = latestInvoice
      ? Math.round(
          (latestInvoice.actual_used_data /
            customer.allocated_data_gb) *
            100
        )
      : 0;
      const remainingData = latestInvoice
  ? Math.max(
      customer.allocated_data_gb -
        latestInvoice.actual_used_data,
      0
    )
  : customer.allocated_data_gb;

const usageChartPercent = Math.min(
  usageRate,
  100
);
  
    const latestUsageInfo = latestInvoice
      ? getUsageInfo(
          latestInvoice.usage_anomaly_level
        )
      : null;
  
    return (
      <main className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <FileText className="h-5 w-5" />
              </div>
  
              <div>
                <p className="text-lg font-bold tracking-tight text-slate-950">
                  PiaCell
                </p>
  
                <p className="text-xs text-slate-500">
                  Customer Portal
                </p>
              </div>
            </div>
  
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {customer.customer_name}
                </p>
  
                <p className="text-xs text-slate-500">
                  {customer.customer_id}
                </p>
              </div>
  
              <Link
                to="/logout"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>
  
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-6 lg:px-8 lg:py-8">
          <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-xl lg:p-8">
          {hasOutstandingPayment && (
  <section className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-amber-50 p-5 shadow-sm">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <CreditCard className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm font-semibold text-red-700">
            Outstanding Payment
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {formatCurrency(remainingPayment)}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            You have {unpaidInvoices.length} unpaid{" "}
            {unpaidInvoices.length === 1
              ? "invoice"
              : "invoices"}.
            Review the invoice details below.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          setSelectedInvoice(unpaidInvoices[0] ?? null)
        }
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100"
      >
        View Unpaid Invoice

        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </section>
)}
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
  
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
  
            <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-200">
                  <Sparkles className="h-4 w-4" />
                  Welcome to PiaCell
                </div>
  
                <h1 className="mt-5 text-3xl font-bold tracking-tight !text-white lg:text-4xl">
  Welcome, {customer.customer_name} 👋
</h1>
  
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
                  Review your package, invoices, usage and
                  payment history from one place.
                </p>
                <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 backdrop-blur">
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/20 text-violet-200">
    <Phone className="h-5 w-5" />
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-wide !text-violet-200/70">
      Subscription Number
    </p>

    <p className="mt-0.5 font-bold !text-white">
      {subscriptionNumber}
    </p>
  </div>
</div>
              </div>
  
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Package
                  </p>
  
                  <p className="mt-1 font-bold">
                    {customer.package_name}
                  </p>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Monthly Fee
                  </p>
  
                  <p className="mt-1 font-bold">
                    {formatCurrency(
                      customer.monthly_fee
                    )}
                  </p>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Account Status
                  </p>
  
                  <p className="mt-1 font-bold text-emerald-300">
                    {customer.is_active
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </section>
  
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Current Package
                  </p>
  
                  <p className="mt-2 text-xl font-bold text-slate-950">
                    {customer.package_name}
                  </p>
  
                  <p className="mt-1 text-xs text-slate-400">
                    {customer.allocated_data_gb} GB data
                  </p>
                </div>
  
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Package className="h-5 w-5" />
                </div>
              </div>
            </article>
  
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Latest Invoice
                  </p>
  
                  <p className="mt-2 text-xl font-bold text-slate-950">
                    {latestInvoice
                      ? formatCurrency(
                          latestInvoice.total_amount
                        )
                      : "—"}
                  </p>
  
                  <p className="mt-1 text-xs text-slate-400">
                    {latestInvoice
                      ? formatBillingPeriod(
                          latestInvoice.billing_period
                        )
                      : "No invoice"}
                  </p>
                </div>
  
                <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                  <ReceiptText className="h-5 w-5" />
                </div>
              </div>
            </article>
  
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Latest Usage
                  </p>
  
                  <p className="mt-2 text-xl font-bold text-slate-950">
                    {latestInvoice
                      ? `${latestInvoice.actual_used_data} GB`
                      : "—"}
                  </p>
  
                  <p className="mt-1 text-xs text-slate-400">
                    {usageRate}% of package quota
                  </p>
                </div>
  
                <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
                  <Gauge className="h-5 w-5" />
                </div>
              </div>
            </article>
  
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Payment Success
                  </p>
  
                  <p className="mt-2 text-xl font-bold text-slate-950">
                    {paidInvoiceCount}/{invoices.length}
                  </p>
  
                  <p className="mt-1 text-xs text-slate-400">
                    loaded invoice periods
                  </p>
                </div>
  
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
            </article>
          </section>
  
          <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-6 shadow-sm">
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
        <CalendarDays className="h-6 w-6" />
      </div>

      <div>
        <p className="text-sm font-semibold text-violet-700">
          3-Month Billing Summary
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Your recent invoice overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Based on your latest {threeMonthInvoices.length} billing periods.
        </p>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Monthly Average
        </p>

        <p className="mt-2 text-xl font-bold text-violet-700">
          {formatCurrency(threeMonthInvoiceAverage)}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Highest Invoice
        </p>

        <p className="mt-2 text-xl font-bold text-slate-950">
          {formatCurrency(highestThreeMonthInvoice)}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Billing Periods
        </p>

        <p className="mt-2 text-xl font-bold text-slate-950">
          {threeMonthInvoices.length} Months
        </p>
      </div>
    </div>
  </div>
</section>
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 p-5">
                <div>
                  <h2 className="font-bold text-slate-950">
                    Recent Invoices
                  </h2>
  
                  <p className="mt-1 text-sm text-slate-500">
                    Your latest billing periods
                  </p>
                </div>
  
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
  
              {invoices.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {invoices.slice(0, 3).map((invoice) => (
                    <div
                      key={invoice.invoice_id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {formatBillingPeriod(
                            invoice.billing_period
                          )}
                        </p>
  
                        <p className="mt-1 text-xs text-slate-500">
                          Due {formatDate(invoice.due_date)}
                        </p>
                      </div>
  
                      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
  <div className="text-right">
    <p className="font-bold text-slate-950">
      {formatCurrency(
        invoice.total_amount
      )}
    </p>

    <span
      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
        invoice.status
      )}`}
    >
      {invoice.status.replace(
        "_",
        " "
      )}
    </span>
  </div>

  <button
    type="button"
    onClick={() =>
      setSelectedInvoice(invoice)
    }
    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
    aria-label={`View ${formatBillingPeriod(
      invoice.billing_period
    )} invoice details`}
  >
    <Eye className="h-4 w-4" />

    View Details
  </button>
</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-6 text-sm text-slate-500">
                  No invoices are currently available.
                </p>
              )}
            </article>
  
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="font-bold text-slate-950">
        Usage Snapshot
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Your latest mobile data usage
      </p>
    </div>

    <Activity className="h-5 w-5 text-slate-400" />
  </div>

  {latestInvoice ? (
    <div className="mt-7">
      <div className="flex flex-col items-center gap-8 lg:flex-row">
        <div
          className="relative flex h-52 w-52 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(
              #7c3aed 0% ${usageChartPercent}%,
              #ede9fe ${usageChartPercent}% 100%
            )`,
          }}
          role="img"
          aria-label={`${usageRate}% of mobile data package used`}
        >
          <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <p className="text-4xl font-extrabold text-slate-950">
              {usageRate}%
            </p>

            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Used
            </p>
          </div>
        </div>

        <div className="w-full flex-1 space-y-4">
          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-violet-700">
                  Used Data
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {latestInvoice.actual_used_data} GB
                </p>
              </div>

              <div className="h-3 w-3 rounded-full bg-violet-600" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  Remaining Data
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {remainingData.toFixed(1)} GB
                </p>
              </div>

              <div className="h-3 w-3 rounded-full bg-violet-200" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-sm text-slate-500">
              Package Total
            </span>

            <span className="font-bold text-slate-950">
              {customer.allocated_data_gb} GB
            </span>
          </div>

          {latestUsageInfo && (
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${latestUsageInfo.classes}`}
            >
              {latestUsageInfo.label}
            </span>
          )}
        </div>
      </div>

      {usageRate > 100 && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-800">
            Package limit exceeded
          </p>

          <p className="mt-1 text-sm text-red-700">
            You have used{" "}
            {(
              latestInvoice.actual_used_data -
              customer.allocated_data_gb
            ).toFixed(1)}{" "}
            GB above your package limit.
          </p>
        </div>
      )}
    </div>
  ) : (
    <p className="mt-6 text-sm text-slate-500">
      No usage information is currently available.
    </p>
  )}
</article>
          </section>
  
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
  
                <div>
                  <p className="font-bold text-slate-950">
                    Account Security
                  </p>
  
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Your PiaCell session is protected by
                    role-based access.
                  </p>
                </div>
              </div>
            </article>
  
            <article className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2.5 text-violet-600 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
  
                <div>
                  <p className="font-bold text-slate-950">
                    Smart Insights
                  </p>
  
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Package recommendations and anomaly
                    results will appear here.
                  </p>
                </div>
              </div>
            </article>
  
            <article
  className={`rounded-2xl border p-5 ${
    hasOutstandingPayment
      ? "border-red-200 bg-red-50"
      : "border-emerald-200 bg-emerald-50"
  }`}
>
  <div className="flex items-start gap-3">
    <div
      className={`rounded-xl bg-white p-2.5 shadow-sm ${
        hasOutstandingPayment
          ? "text-red-600"
          : "text-emerald-600"
      }`}
    >
      <CreditCard className="h-5 w-5" />
    </div>

    <div className="flex-1">
      <p className="font-bold text-slate-950">
        Remaining Payment
      </p>

      <p
        className={`mt-1 text-xl font-bold ${
          hasOutstandingPayment
            ? "text-red-700"
            : "text-emerald-700"
        }`}
      >
        {formatCurrency(remainingPayment)}
      </p>

      <p className="mt-1 text-sm leading-5 text-slate-600">
        {hasOutstandingPayment
          ? `${unpaidInvoices.length} invoice payment pending`
          : "All invoices are paid"}
      </p>
    </div>
  </div>
</article>
          </section>
  
          <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              PiaCell • Smart Billing & Customer
              Intelligence
            </p>
  
            <Link
              to="/logout"
              className="inline-flex items-center gap-1 font-semibold text-slate-500 transition hover:text-blue-600"
            >
              Sign out
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </footer>
        </div>
        {selectedInvoice && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
    role="presentation"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setSelectedInvoice(null);
      }
    }}
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-detail-title"
      className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white shadow-2xl"
    >
      <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            PiaCell Invoice
          </p>

          <h2
            id="invoice-detail-title"
            className="mt-1 text-2xl font-bold text-slate-950"
          >
            {formatBillingPeriod(
              selectedInvoice.billing_period
            )}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Invoice #{selectedInvoice.invoice_id}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setSelectedInvoice(null)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close invoice details"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="space-y-6 p-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                selectedInvoice.status
              )}`}
            >
              {selectedInvoice.status.replace(
                "_",
                " "
              )}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Due Date
            </p>

            <p className="mt-2 font-bold text-slate-900">
              {formatDate(
                selectedInvoice.due_date
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Delivery
            </p>

            <p className="mt-2 font-bold text-slate-900">
              {selectedInvoice.delivery_method}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>

            <p className="mt-2 text-lg font-bold text-slate-950">
              {formatCurrency(
                selectedInvoice.total_amount
              )}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h3 className="font-bold text-slate-950">
              Invoice Content
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Package and usage charges
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-semibold text-slate-900">
                  {customer.package_name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Monthly package subscription
                </p>
              </div>

              <p className="font-bold text-slate-950">
                {formatCurrency(
                  Math.min(
                    customer.monthly_fee,
                    selectedInvoice.total_amount
                  )
                )}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-semibold text-slate-900">
                  Additional Usage &amp; Charges
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Overage and additional billing items
                </p>
              </div>

              <p className="font-bold text-slate-950">
                {formatCurrency(
                  Math.max(
                    selectedInvoice.total_amount -
                      customer.monthly_fee,
                    0
                  )
                )}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 bg-slate-950 px-5 py-5 text-white">
              <p className="font-bold">
                Total Invoice Amount
              </p>

              <p className="text-xl font-bold">
                {formatCurrency(
                  selectedInvoice.total_amount
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-bold text-slate-950">
              Usage Details
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Package Quota
                </span>

                <span className="font-semibold text-slate-900">
                  {customer.allocated_data_gb} GB
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Actual Usage
                </span>

                <span className="font-semibold text-slate-900">
                  {selectedInvoice.actual_used_data} GB
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Overage
                </span>

                <span className="font-semibold text-slate-900">
                  {selectedInvoice.overage_percent}%
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-bold text-slate-950">
              Payment Details
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Payment Date
                </span>

                <span className="font-semibold text-slate-900">
                  {formatDate(
                    selectedInvoice.payment_date
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Payment Channel
                </span>

                <span className="font-semibold text-slate-900">
                  {selectedInvoice.payment_channel
                    ?.replaceAll("_", " ") ??
                    "Not paid yet"}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Payment Status
                </span>

                <span className="font-semibold text-slate-900">
                  {selectedInvoice.status === "Paid"
                    ? "Paid"
                    : "Payment required"}
                </span>
              </div>
            </div>
          </article>
        </section>

        {selectedInvoice.status !== "Paid" && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-red-800">
              Payment Required
            </p>

            <p className="mt-2 text-sm leading-6 text-red-700">
              This invoice has an outstanding balance of{" "}
              <strong>
                {formatCurrency(
                  selectedInvoice.total_amount
                )}
              </strong>
              .
            </p>
          </section>
        )}
      </div>
    </section>
  </div>
)}
      </main>
    );
  }