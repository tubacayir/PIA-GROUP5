import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");

      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred."
) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    if (!error.response) {
      return "Cannot connect to the server. Please check your connection.";
    }

    const backendMessage =
      error.response.data?.message ?? error.response.data?.error;

    if (backendMessage) {
      return backendMessage;
    }

    switch (error.response.status) {
      case 400:
        return "The request is invalid.";
      case 401:
        return "Your credentials are incorrect.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource could not be found.";
      case 409:
        return "This operation conflicts with existing data.";
      case 500:
        return "A server error occurred. Please try again later.";
      default:
        return fallbackMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export default api;

// ── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceSummary {
  id: number;
  invoiceNumber: string;
  invoiceMonth: number;
  invoiceYear: number;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
}

export interface InvoiceLine {
  lineType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceDetail extends InvoiceSummary {
  subscriptionNumber: string;
  phoneNumber: string;
  packageName: string;
  lines: InvoiceLine[];
}

// ── Customer invoice endpoints ────────────────────────────────────────────────

export const getMyInvoices = (): Promise<InvoiceSummary[]> =>
  api.get<InvoiceSummary[]>("/invoices").then((r) => r.data);

export const getInvoiceDetail = (id: number): Promise<InvoiceDetail> =>
  api.get<InvoiceDetail>(`/invoices/${id}`).then((r) => r.data);
