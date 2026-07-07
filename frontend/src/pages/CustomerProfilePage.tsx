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
    UserRound,
  } from "lucide-react";
  import { Link } from "react-router-dom";

  import { useAuthStore } from "../features/auth/authStore";
  import { useCustomerStore } from "../store/customerStore";
  import { useInvoiceStore } from "../store/invoiceStore";
  import type {
    InvoiceStatus,
    UsageAnomalyLevel,
  } from "../types/entities";
  
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
  
    const latestInvoice = invoices[0];
  
    const paidInvoiceCount = invoices.filter(
      (invoice) => invoice.status === "Paid"
    ).length;
  
    const totalBilled = invoices.reduce(
      (sum, invoice) =>
        sum + invoice.total_amount,
      0
    );
  
    const usageRate = latestInvoice
      ? Math.round(
          (latestInvoice.actual_used_data /
            customer.allocated_data_gb) *
            100
        )
      : 0;
  
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
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
  
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
  
            <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-200">
                  <Sparkles className="h-4 w-4" />
                  Welcome to PiaCell
                </div>
  
                <h1 className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl">
                  Hello, {customer.customer_name}
                </h1>
  
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
                  Review your package, invoices, usage and
                  payment history from one place.
                </p>
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
  
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className="font-bold text-slate-950">
                          {formatCurrency(
                            invoice.total_amount
                          )}
                        </p>
  
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            invoice.status
                          )}`}
                        >
                          {invoice.status.replace(
                            "_",
                            " "
                          )}
                        </span>
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
                    Latest billing period
                  </p>
                </div>
  
                <Activity className="h-5 w-5 text-slate-400" />
              </div>
  
              {latestInvoice ? (
                <>
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-slate-950">
                        {latestInvoice.actual_used_data} GB
                      </p>
  
                      <p className="mt-1 text-sm text-slate-500">
                        of {customer.allocated_data_gb} GB
                      </p>
                    </div>
  
                    {latestUsageInfo && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${latestUsageInfo.classes}`}
                      >
                        {latestUsageInfo.label}
                      </span>
                    )}
                  </div>
  
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          usageRate,
                          100
                        )}%`,
                      }}
                    />
                  </div>
  
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <Phone className="h-5 w-5 text-blue-600" />
  
                      <p className="mt-3 text-xs text-slate-500">
                        Customer Line
                      </p>
  
                      <p className="mt-1 font-semibold text-slate-900">
                        Primary Line
                      </p>
                    </div>
  
                    <div className="rounded-xl bg-slate-50 p-4">
                      <CalendarDays className="h-5 w-5 text-violet-600" />
  
                      <p className="mt-3 text-xs text-slate-500">
                        Contract End
                      </p>
  
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDate(
                          customer.contract_end_date
                        )}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-6 text-sm text-slate-500">
                  No usage information is currently
                  available.
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
  
            <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                  <CreditCard className="h-5 w-5" />
                </div>
  
                <div>
                  <p className="font-bold text-slate-950">
                    Total Billed
                  </p>
  
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatCurrency(totalBilled)}
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
      </main>
    );
  }