import { useState } from "react";
import { useInvoiceStore } from "../../store/invoiceStore";
import { useCustomerStore } from "../../store/customerStore";
import type { Invoice, DeliveryMethod } from "../../types/entities";

export default function InvoiceForm() {
  const addInvoice = useInvoiceStore((state) => state.addInvoice);
  const customers = useCustomerStore((state) => state.customers);

  const [customerId, setCustomerId] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("2026-07");
  const [actualUsedData, setActualUsedData] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("Digital");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const customer = customers.find((c) => c.customer_id === customerId);
    if (!customer) return;

    const usedData = Number(actualUsedData);
    const overageGb = Math.max(0, usedData - customer.allocated_data_gb);
    const overageCharge = overageGb * 10;
  const wirelessFee = 35;
  const totalAmount = customer.monthly_fee + overageCharge + wirelessFee;
    const overagePercent = Math.round((overageGb / customer.allocated_data_gb) * 100);

    const newInvoice: Invoice = {
      invoice_id: `INV-${Date.now()}`,
      customer_id: customerId,
      billing_period: billingPeriod,
      actual_used_data: usedData,
      wireless_usage_fee: wirelessFee,
      overage_charge: overageCharge,
      total_amount: totalAmount,
      due_date: dueDate,
      payment_date: null,
      payment_channel: null,
      delivery_method: deliveryMethod,
      status: "Pending",
      usage_anomaly_level: overagePercent > 50 ? "ShockAnomaly" : overagePercent > 0 ? "SustainableOverage" : "Normal",
      overage_percent: overagePercent,
      days_overdue: 0,
      carbon_saved_kg: deliveryMethod === "Digital" ? 0.05 : 0,
      requires_admin_approval: totalAmount > customer.monthly_fee * 3,
    };

    addInvoice(newInvoice);

    setCustomerId("");
    setActualUsedData("");
    setDueDate("");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow flex flex-col gap-3 max-w-md">
      <h2 className="text-lg font-semibold">Add New Invoice</h2>

      <label className="flex flex-col text-sm">
        Customer
        <select
          className="border p-2 rounded"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
        >
          <option value="">Select</option>
          {customers.map((c) => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.customer_name} ({c.customer_id})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm">
        Period (YYYY-MM)
        <input
          className="border p-2 rounded"
          value={billingPeriod}
          onChange={(e) => setBillingPeriod(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col text-sm">
        Used Data (GB)
        <input
          type="number"
          className="border p-2 rounded"
          value={actualUsedData}
          onChange={(e) => setActualUsedData(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col text-sm">
        Due Date
        <input
          type="date"
          className="border p-2 rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col text-sm">
        Delivery Method
        <select
          className="border p-2 rounded"
          value={deliveryMethod}
          onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
        >
          <option value="Digital">Digital</option>
          <option value="Paper">Paper</option>
        </select>
      </label>

      <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Save
      </button>
    </form>
  );
}