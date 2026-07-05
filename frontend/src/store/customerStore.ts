import { create } from "zustand";
import type { Customer } from "../types/entities";
import { generateMockCustomers } from "../mock/mockData";

interface CustomerStore {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updated: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: generateMockCustomers(20),

  addCustomer: (customer) =>
    set((state) => ({ customers: [...state.customers, customer] })),

  updateCustomer: (id, updated) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.customer_id === id ? { ...c, ...updated } : c
      ),
    })),

  deleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.customer_id !== id),
    })),
}));