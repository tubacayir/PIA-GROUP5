import { create } from "zustand";
import type { Invoice } from "../types/entities";
import { useCustomerStore } from "./customerStore";
import { generateMockInvoicesForCustomers } from "../mock/mockData";

interface InvoiceStore {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updated: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: generateMockInvoicesForCustomers(
    useCustomerStore.getState().customers,
    "2026-06"
  ),

  addInvoice: (invoice) =>
    set((state) => ({ invoices: [...state.invoices, invoice] })),

  updateInvoice: (id, updated) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.invoice_id === id ? { ...inv, ...updated } : inv
      ),
    })),

  deleteInvoice: (id) =>
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.invoice_id !== id),
    })),
}));