import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, Phone, Wifi } from "lucide-react";

import StatusBadge from "../../components/organization/StatusBadge";
import { ErrorState, LoadingState } from "../../components/organization/AsyncStates";
import { useAsyncData } from "../../features/organization/useAsyncData";
import { getEmployee } from "../../features/organization/organizationService";
import { formatCurrency, formatDate } from "../../features/organization/format";

function UsageBar({
  icon: Icon,
  label,
  used,
  limit,
  unit,
}: {
  icon: typeof Wifi;
  label: string;
  used: number;
  limit: number;
  unit: string;
}) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const exceeds = used > limit;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <Icon className="h-4 w-4 text-slate-400" />
          {label}
        </span>

        <span className={exceeds ? "font-semibold text-red-600" : "text-slate-500"}>
          {used} / {limit} {unit}
        </span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${exceeds ? "bg-red-500" : "bg-blue-600"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <EmployeeDetailContent key={id} employeeId={Number(id)} />;
}

function EmployeeDetailContent({ employeeId }: { employeeId: number }) {
  const { data: employee, loading, error } = useAsyncData(
    () => getEmployee(employeeId),
    [employeeId]
  );

  if (loading) {
    return <LoadingState label="Loading employee..." />;
  }

  if (error || !employee) {
    return <ErrorState message={error ?? "Employee not found."} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/organization/employees"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          {employee.firstName} {employee.lastName}
        </h1>

        <p className="mt-1 text-sm text-slate-500">{employee.phoneNumber}</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-950">Subscription</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Package</dt>
              <dd className="font-medium text-slate-900">
                {employee.currentPackage?.packageName ?? "—"}
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <StatusBadge status={employee.subscriptionStatus} />
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Commitment Start</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(employee.commitmentStartDate)}
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Commitment End</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(employee.commitmentEndDate)}
              </dd>
            </div>

            {employee.currentPackage && (
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Monthly Fee</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(employee.currentPackage.monthlyFee)}
                </dd>
              </div>
            )}
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-950">Latest Invoice</h2>

          {employee.latestInvoice ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Invoice Number</dt>
                <dd className="font-medium text-slate-900">{employee.latestInvoice.invoiceNumber}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Amount</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(employee.latestInvoice.totalAmount)}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <StatusBadge status={employee.latestInvoice.status} />
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Due Date</dt>
                <dd className="font-medium text-slate-900">{formatDate(employee.latestInvoice.dueDate)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No invoices found.</p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-950">Current Usage</h2>

          {employee.currentUsage ? (
            <div className="mt-4 space-y-5">
              <UsageBar
                icon={Wifi}
                label="Internet"
                used={employee.currentUsage.usedInternetGb}
                limit={employee.currentUsage.internetLimitGb}
                unit="GB"
              />

              <UsageBar
                icon={Phone}
                label="Voice"
                used={employee.currentUsage.usedMinutes}
                limit={employee.currentUsage.minuteLimit}
                unit="min"
              />

              <UsageBar
                icon={MessageSquare}
                label="SMS"
                used={employee.currentUsage.usedSms}
                limit={employee.currentUsage.smsLimit}
                unit="SMS"
              />

              {employee.currentUsage.exceedsLimit && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  This subscription is exceeding its package limits.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No usage data found.</p>
          )}
        </article>
      </section>
    </div>
  );
}
