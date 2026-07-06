import { create } from "zustand";

import { generateMockInvoicesForCustomers } from "../mock/mockData";
import type { Invoice } from "../types/entities";
import { useCustomerStore } from "./customerStore";

interface InvoiceStore {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (
    id: string,
    updated: Partial<Invoice>
  ) => void;
  deleteInvoice: (id: string) => void;
}

const BILLING_PERIODS = [
  "2026-04",
  "2026-05",
  "2026-06",
];

const customers =
  useCustomerStore.getState().customers;

const initialInvoices = BILLING_PERIODS.flatMap(
  (billingPeriod) =>
    generateMockInvoicesForCustomers(
      customers,
      billingPeriod
    )
);

export const useInvoiceStore =
  create<InvoiceStore>((set) => ({
    invoices: initialInvoices,

    addInvoice: (invoice) =>
      set((state) => ({
        invoices: [...state.invoices, invoice],
      })),

    updateInvoice: (id, updated) =>
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice.invoice_id === id
            ? { ...invoice, ...updated }
            : invoice
        ),
      })),

    deleteInvoice: (id) =>
      set((state) => ({
        invoices: state.invoices.filter(
          (invoice) =>
            invoice.invoice_id !== id
        ),
      })),
  }));