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

const rawInvoices = BILLING_PERIODS.flatMap(
  (billingPeriod) =>
    generateMockInvoicesForCustomers(
      customers,
      billingPeriod
    )
);

/*
 * Payment history consistency rule:
 *
 * Once a customer has an unpaid invoice,
 * a later invoice cannot appear as Paid.
 *
 * Example:
 * April -> Overdue
 * May   -> Pending
 * June  -> Pending
 *
 * This prevents unrealistic mock histories such as:
 * April -> Pending
 * May   -> Paid
 */
function normalizePaymentHistory(
  invoices: Invoice[]
): Invoice[] {
  const invoicesByCustomer = new Map<
    string,
    Invoice[]
  >();

  invoices.forEach((invoice) => {
    const customerInvoices =
      invoicesByCustomer.get(invoice.customer_id) ??
      [];

    customerInvoices.push(invoice);

    invoicesByCustomer.set(
      invoice.customer_id,
      customerInvoices
    );
  });

  const normalizedInvoices: Invoice[] = [];

  invoicesByCustomer.forEach(
    (customerInvoices) => {
      const orderedInvoices = [
        ...customerInvoices,
      ].sort((a, b) =>
        a.billing_period.localeCompare(
          b.billing_period
        )
      );

      let unpaidInvoiceDetected = false;

      orderedInvoices.forEach((invoice) => {
        if (invoice.status !== "Paid") {
          unpaidInvoiceDetected = true;

          normalizedInvoices.push(invoice);
          return;
        }

        if (unpaidInvoiceDetected) {
          normalizedInvoices.push({
            ...invoice,
            status: "Pending",
            payment_date: null,
            payment_channel: null,
          });

          return;
        }

        normalizedInvoices.push(invoice);
      });
    }
  );

  return normalizedInvoices;
}

const initialInvoices =
  normalizePaymentHistory(rawInvoices);

export const useInvoiceStore =
  create<InvoiceStore>((set) => ({
    invoices: initialInvoices,

    addInvoice: (invoice) =>
      set((state) => ({
        invoices: [
          ...state.invoices,
          invoice,
        ],
      })),

    updateInvoice: (id, updated) =>
      set((state) => ({
        invoices: state.invoices.map(
          (invoice) =>
            invoice.invoice_id === id
              ? {
                  ...invoice,
                  ...updated,
                }
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