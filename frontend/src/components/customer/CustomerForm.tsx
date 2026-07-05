import { useState } from "react";
import { useCustomerStore } from "../../store/customerStore";
import type { Customer, CustomerType } from "../../types/entities";

export default function CustomerForm() {
  const addCustomer = useCustomerStore((state) => state.addCustomer);

  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("Individual");
  const [companyName, setCompanyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [packageName, setPackageName] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [allocatedDataGb, setAllocatedDataGb] = useState("");

  function calcAgeGroup(birth: string): Customer["age_group"] {
    const year = parseInt(birth.split("-")[0], 10);
    const age = 2026 - year;
    if (age <= 30) return "Young (18-30)";
    if (age <= 50) return "Middle Age (31-50)";
    return "Senior (51+)";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newCustomer: Customer = {
      customer_id: `CUST-${Date.now()}`,
      customer_name: customerName,
      customer_type: customerType,
      company_name: customerType === "Corporate" ? companyName : null,
      birth_date: birthDate,
      registration_date: "2026-07-05",
      package_name: packageName,
      allocated_data_gb: Number(allocatedDataGb),
      monthly_fee: Number(monthlyFee),
      contract_end_date: "2027-07-05",
      is_active: true,
      age_group: calcAgeGroup(birthDate),
      loyalty_years: 0,
      is_loyal_customer: false,
      loyalty_discount_percent: 0,
      potential_churn_rate_flag: "Low",
      suggest_upper_package: false,
      contract_ending_soon: false,
      preferred_channel_trend: "Digital",
    };

    addCustomer(newCustomer);

    // Clear form
    setCustomerName("");
    setCustomerType("Individual");
    setCompanyName("");
    setBirthDate("");
    setPackageName("");
    setMonthlyFee("");
    setAllocatedDataGb("");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow flex flex-col gap-3 max-w-md">
      <h2 className="text-lg font-semibold">Add New Customer</h2>

      <label className="flex flex-col text-sm">
        Full Name
        <input
          className="border p-2 rounded"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col text-sm">
        Customer Type
        <select
          className="border p-2 rounded"
          value={customerType}
          onChange={(e) => setCustomerType(e.target.value as CustomerType)}
        >
          <option value="Individual">Individual</option>
          <option value="Corporate">Corporate</option>
        </select>
      </label>

      {customerType === "Corporate" && (
        <label className="flex flex-col text-sm">
          Company Name
          <input
            className="border p-2 rounded"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </label>
      )}

      <label className="flex flex-col text-sm">
        Date of Birth
        <input
          type="date"
          className="border p-2 rounded"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col text-sm">
        Package Name
        <input
          className="border p-2 rounded"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col text-sm">
        Monthly Fee (TL)
        <input
          type="number"
          className="border p-2 rounded"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col text-sm">
        Package Quota (GB)
        <input
          type="number"
          className="border p-2 rounded"
          value={allocatedDataGb}
          onChange={(e) => setAllocatedDataGb(e.target.value)}
          required
        />
      </label>

      <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Save
      </button>
    </form>
  );
}