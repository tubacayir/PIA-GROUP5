import api, { getApiErrorMessage } from "../../services/api.tsx";
import type {
  CurrentUsage,
  DashboardSummary,
  InvoiceSummary,
  Recommendation,
} from "./customerTypes";

async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error), { cause: error });
  }
}

export const getDashboardSummary = () =>
  unwrap<DashboardSummary>(api.get("/customer/dashboard/summary"));

export const getCurrentUsage = () =>
  unwrap<CurrentUsage | null>(api.get("/customer/dashboard/usage"));

export const getInvoices = () =>
  unwrap<InvoiceSummary[]>(api.get("/invoices"));

export const getRecommendations = () =>
  unwrap<Recommendation[]>(api.get("/customer/recommendations"));

export const approveRecommendation = (id: number) =>
  unwrap<Recommendation>(api.post(`/customer/recommendations/${id}/approve`));

export const rejectRecommendation = (id: number) =>
  unwrap<Recommendation>(api.post(`/customer/recommendations/${id}/reject`));
