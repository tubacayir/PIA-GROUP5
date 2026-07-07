import api, { getApiErrorMessage } from "../../services/api";
import type {
  CorporateInvoiceSummary,
  DashboardSummary,
  Employee,
  InvoiceAnalytics,
  InvoiceDetail,
  MonthlyInvoiceTrendPoint,
  MonthlyUsageTrendPoint,
  PackageInfo,
  Subscription,
  UsageAnalytics,
} from "./organizationTypes";

async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error), { cause: error });
  }
}

export const getDashboardSummary = () =>
  unwrap<DashboardSummary>(api.get("/corporate/dashboard/summary"));

export const getUsageTrend = () =>
  unwrap<MonthlyUsageTrendPoint[]>(api.get("/corporate/dashboard/usage-trend"));

export const getInvoiceTrend = () =>
  unwrap<MonthlyInvoiceTrendPoint[]>(api.get("/corporate/dashboard/invoice-trend"));

export const getEmployees = () =>
  unwrap<Employee[]>(api.get("/corporate/employees"));

export const getEmployee = (id: number) =>
  unwrap<Employee>(api.get(`/corporate/employees/${id}`));

export const getSubscriptions = () =>
  unwrap<Subscription[]>(api.get("/corporate/subscriptions"));

export const getSubscription = (id: number) =>
  unwrap<Subscription>(api.get(`/corporate/subscriptions/${id}`));

export const updateSubscriptionPackage = (id: number, packageId: number) =>
  unwrap<Subscription>(api.patch(`/corporate/subscriptions/${id}/package`, { packageId }));

export const updateSubscriptionStatus = (id: number, status: string) =>
  unwrap<Subscription>(api.patch(`/corporate/subscriptions/${id}/status`, { status }));

export const getPackages = () =>
  unwrap<PackageInfo[]>(api.get("/corporate/packages"));

export const getUsageAnalytics = () =>
  unwrap<UsageAnalytics>(api.get("/corporate/usage-analytics"));

export const getInvoices = () =>
  unwrap<CorporateInvoiceSummary[]>(api.get("/corporate/invoices"));

export const getInvoice = (id: number) =>
  unwrap<InvoiceDetail>(api.get(`/corporate/invoices/${id}`));

export const getInvoiceAnalytics = () =>
  unwrap<InvoiceAnalytics>(api.get("/corporate/invoices/analytics"));
