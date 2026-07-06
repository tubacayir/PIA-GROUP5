import {
    Activity,
    Building2,
    CircleAlert,
    CreditCard,
    Gauge,
    LogOut,
    ReceiptText,
    ShieldCheck,
    TrendingUp,
    Users,
  } from "lucide-react";
  import { Link } from "react-router-dom";
  
  import { useCustomerStore } from "../store/customerStore";
  import { useInvoiceStore } from "../store/invoiceStore";
  
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 2,
    }).format(value);
  }
  
  function formatBillingPeriod(value: string) {
    const [year, month] = value.split("-");
  
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(
      new Date(Number(year), Number(month) - 1, 1)
    );
  }
  
  export default function OrganizationDashboardPage() {
    const customers = useCustomerStore(
      (state) => state.customers
    );
  
    const invoices = useInvoiceStore(
      (state) => state.invoices
    );
  
    const corporateCustomers = customers.filter(
      (customer) =>
        customer.customer_type === "Corporate"
    );
  
    const organizationName =
      corporateCustomers.find(
        (customer) => customer.company_name
      )?.company_name ?? "PiaCell Corporate";
  
    const organizationCustomers =
      corporateCustomers.filter(
        (customer) =>
          !organizationName ||
          customer.company_name === organizationName
      );
  
    const organizationCustomerIds = new Set(
      organizationCustomers.map(
        (customer) => customer.customer_id
      )
    );
  
    const organizationInvoices = invoices
      .filter((invoice) =>
        organizationCustomerIds.has(invoice.customer_id)
      )
      .sort((a, b) =>
        b.billing_period.localeCompare(
          a.billing_period
        )
      );
  
    const activeCustomerCount =
      organizationCustomers.filter(
        (customer) => customer.is_active
      ).length;
  
    const highRiskCustomerCount =
      organizationCustomers.filter(
        (customer) =>
          customer.potential_churn_rate_flag === "High"
      ).length;
  
    const totalBilled = organizationInvoices.reduce(
      (sum, invoice) =>
        sum + invoice.total_amount,
      0
    );
  
    const paidInvoiceCount =
      organizationInvoices.filter(
        (invoice) => invoice.status === "Paid"
      ).length;
  
    const overdueInvoiceCount =
      organizationInvoices.filter(
        (invoice) => invoice.status === "Overdue"
      ).length;
  
    const anomalyCount =
      organizationInvoices.filter(
        (invoice) =>
          invoice.status === "Suspended_Anomalous"
      ).length;
  
    const paymentSuccessRate =
      organizationInvoices.length > 0
        ? Math.round(
            (paidInvoiceCount /
              organizationInvoices.length) *
              100
          )
        : 0;
  
    const billingPeriods = Array.from(
      new Set(
        organizationInvoices.map(
          (invoice) => invoice.billing_period
        )
      )
    )
      .sort()
      .map((period) => {
        const amount = organizationInvoices
          .filter(
            (invoice) =>
              invoice.billing_period === period
          )
          .reduce(
            (sum, invoice) =>
              sum + invoice.total_amount,
            0
          );
  
        return {
          period,
          amount,
        };
      });
  
    const highestPeriodAmount = Math.max(
      ...billingPeriods.map((item) => item.amount),
      1
    );
  
    const topCustomers = organizationCustomers
      .map((customer) => {
        const customerInvoices =
          organizationInvoices.filter(
            (invoice) =>
              invoice.customer_id ===
              customer.customer_id
          );
  
        const billedAmount = customerInvoices.reduce(
          (sum, invoice) =>
            sum + invoice.total_amount,
          0
        );
  
        return {
          ...customer,
          billedAmount,
        };
      })
      .sort(
        (a, b) =>
          b.billedAmount - a.billedAmount
      )
      .slice(0, 5);
  
    return (
      <main className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Building2 className="h-5 w-5" />
              </div>
  
              <div>
                <p className="text-lg font-bold tracking-tight text-slate-950">
                  PiaCell
                </p>
  
                <p className="text-xs text-slate-500">
                  Organization Portal
                </p>
              </div>
            </div>
  
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white lg:text-4xl">
  {organizationName}
</h1>
  
                <p className="text-xs text-slate-500">
                  Corporate Account
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
  
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-5 py-6 lg:px-8 lg:py-8">
          <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-xl lg:p-8">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
  
            <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
  
            <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-200">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Corporate Access
                </div>
  
                <h1 className="mt-5 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                  {organizationName}
                </h1>
  
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
                  Monitor corporate customers, billing,
                  payments, usage risks and financial
                  performance from one place.
                </p>
              </div>
  
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Accounts
                  </p>
  
                  <p className="mt-1 text-xl font-bold">
                    {organizationCustomers.length}
                  </p>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Active
                  </p>
  
                  <p className="mt-1 text-xl font-bold text-emerald-300">
                    {activeCustomerCount}
                  </p>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Payment Success
                  </p>
  
                  <p className="mt-1 text-xl font-bold">
                    {paymentSuccessRate}%
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
                    Corporate Accounts
                  </p>
  
                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {organizationCustomers.length}
                  </p>
  
                  <p className="mt-1 text-xs text-slate-400">
                    {activeCustomerCount} active
                  </p>
                </div>
  
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </article>
  
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Billed
                  </p>
  
                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {formatCurrency(totalBilled)}
                  </p>
  
                  <p className="mt-1 text-xs text-slate-400">
                    loaded billing periods
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
                    Overdue Invoices
                  </p>
  
                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {overdueInvoiceCount}
                  </p>
  
                  <p className="mt-1 text-xs text-slate-400">
                    requires attention
                  </p>
                </div>
  
                <div className="rounded-xl bg-red-50 p-3 text-red-600">
                  <CircleAlert className="h-5 w-5" />
                </div>
              </div>
            </article>
  
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    High Risk
                  </p>
  
                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {highRiskCustomerCount}
                  </p>
  
                  <p className="mt-1 text-xs text-slate-400">
                    customer accounts
                  </p>
                </div>
  
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </article>
          </section>
  
          <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-950">
                    Billing Trend
                  </h2>
  
                  <p className="mt-1 text-sm text-slate-500">
                    Revenue across loaded billing periods
                  </p>
                </div>
  
                <TrendingUp className="h-5 w-5 text-slate-400" />
              </div>
  
              <div className="mt-8 flex min-h-64 items-end gap-4">
                {billingPeriods.map((item) => {
                  const height = Math.max(
                    12,
                    Math.round(
                      (item.amount /
                        highestPeriodAmount) *
                        100
                    )
                  );
  
                  return (
                    <div
                      key={item.period}
                      className="flex flex-1 flex-col items-center"
                    >
                      <p className="mb-3 text-xs font-semibold text-slate-500">
                        {formatCurrency(item.amount)}
                      </p>
  
                      <div className="flex h-44 w-full items-end rounded-2xl bg-slate-100 p-1.5">
                        <div
                          className="w-full rounded-xl bg-blue-600 transition-all"
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>
  
                      <p className="mt-3 text-xs font-semibold text-slate-600">
                        {formatBillingPeriod(item.period)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
  
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-950">
                    Payment Health
                  </h2>
  
                  <p className="mt-1 text-sm text-slate-500">
                    Invoice payment performance
                  </p>
                </div>
  
                <CreditCard className="h-5 w-5 text-slate-400" />
              </div>
  
              <div className="mt-8 text-center">
                <p className="text-5xl font-bold tracking-tight text-slate-950">
                  {paymentSuccessRate}%
                </p>
  
                <p className="mt-2 text-sm text-slate-500">
                  payment success rate
                </p>
              </div>
  
              <div className="mt-8 space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Paid
                    </span>
  
                    <span className="font-semibold text-slate-900">
                      {paidInvoiceCount}
                    </span>
                  </div>
                </div>
  
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Overdue
                    </span>
  
                    <span className="font-semibold text-red-600">
                      {overdueInvoiceCount}
                    </span>
                  </div>
                </div>
  
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Anomalies
                    </span>
  
                    <span className="font-semibold text-amber-600">
                      {anomalyCount}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </section>
  
          <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      Top Corporate Accounts
                    </h2>
  
                    <p className="mt-1 text-sm text-slate-500">
                      Ranked by total billed amount
                    </p>
                  </div>
  
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
              </div>
  
              <div className="divide-y divide-slate-100">
                {topCustomers.map(
                  (customer, index) => (
                    <div
                      key={customer.customer_id}
                      className="flex items-center justify-between gap-4 p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                          {index + 1}
                        </div>
  
                        <div>
                          <p className="font-semibold text-slate-900">
                            {customer.customer_name}
                          </p>
  
                          <p className="mt-1 text-xs text-slate-500">
                            {customer.package_name}
                          </p>
                        </div>
                      </div>
  
                      <p className="font-bold text-slate-950">
                        {formatCurrency(
                          customer.billedAmount
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            </article>
  
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-950">
                    Organization Insights
                  </h2>
  
                  <p className="mt-1 text-sm text-slate-500">
                    Current risk overview
                  </p>
                </div>
  
                <Gauge className="h-5 w-5 text-slate-400" />
              </div>
  
              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Payment Monitoring
                  </p>
  
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {overdueInvoiceCount > 0
                      ? `${overdueInvoiceCount} overdue invoice records require attention.`
                      : "No overdue invoice records were detected."}
                  </p>
                </div>
  
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Anomaly Monitoring
                  </p>
  
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {anomalyCount > 0
                      ? `${anomalyCount} anomalous invoice records require review.`
                      : "No anomalous invoice records were detected."}
                  </p>
                </div>
  
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Account Risk
                  </p>
  
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {highRiskCustomerCount > 0
                      ? `${highRiskCustomerCount} corporate accounts have high churn risk.`
                      : "No high-risk corporate accounts were detected."}
                  </p>
                </div>
              </div>
            </article>
          </section>
  
          <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              PiaCell • Organization Intelligence Portal
            </p>
  
            <Link
              to="/logout"
              className="inline-flex items-center gap-2 font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Link>
          </footer>
        </div>
      </main>
    );
  }