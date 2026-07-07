import type { Customer, Invoice, InvoiceStatus, UsageAnomalyLevel, AgeGroup } from "../types/entities";
import {
  corporatePackages,
  individualPackages,
} from "./packageCatalog";


const COMPANIES = [
  "PiA Holding", "X Software", "Deniz Logistics", "Kaya Construction", "Nova Technology",
  "Mavi Textile", "Anka Energy", "Berk Automotive", "Sude Food", "Vera Health",
];

const PAYMENT_CHANNELS = ["Mobile_App", "Web", "Bank_App", "Store"] as const;

// --- Helper functions ---
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function calcAgeGroup(birthDate: string): AgeGroup {
  const year = parseInt(birthDate.split("-")[0], 10);
  const age = 2026 - year;
  if (age <= 30) return "Young (18-30)";
  if (age <= 50) return "Middle Age (31-50)";
  return "Senior (51+)";
}

// --- CUSTOMER generator ---
export function generateMockCustomer(index: number): Customer {
  const isCorporate = Math.random() < 0.2; // 20% corporate
  const availablePackages = isCorporate
  ? corporatePackages
  : individualPackages;

const pkg = randomFrom(availablePackages);
  const birthYear = 1950 + Math.floor(Math.random() * 55);
  const birth_date = `${birthYear}-0${1 + Math.floor(Math.random() * 8)}-15`;
  const regYear = 2018 + Math.floor(Math.random() * 8);
  const registration_date = `${regYear}-03-01`;
  const loyalty_years = 2026 - regYear;

  return {
    customer_id: `CUST-${1000 + index}`,
    customer_name: `Customer ${index}`,
    customer_type: isCorporate ? "Corporate" : "Individual",
    company_name: isCorporate ? randomFrom(COMPANIES) : null,
    birth_date,
    registration_date,
    package_name: pkg.name,
allocated_data_gb: pkg.internetGb,
monthly_fee: pkg.monthlyPrice,
    contract_end_date: "2027-01-15",
    is_active: true,
    age_group: calcAgeGroup(birth_date),
    loyalty_years,
    is_loyal_customer: loyalty_years >= 5,
    loyalty_discount_percent: loyalty_years >= 5 ? 15 : 0,
    potential_churn_rate_flag: "Low",
    suggest_upper_package: false,
    contract_ending_soon: false,
    preferred_channel_trend: Math.random() < 0.6 ? "Digital" : "Traditional",
  };
}

// --- INVOICE generator (was not in the docx, added as needed) ---
export function generateMockInvoice(customer: Customer, billingPeriod: string, index: number): Invoice {
  const actual_used_data = Math.round(customer.allocated_data_gb * (0.5 + Math.random() * 1.2));
  const overage_gb = Math.max(0, actual_used_data - customer.allocated_data_gb);
  const overage_charge = overage_gb * 10; // unit price: 10 TL/GB assumption
  const telsiz_kullanim_ucreti = 35;
  const total_amount = customer.monthly_fee + overage_charge + telsiz_kullanim_ucreti;

  const isPaid = Math.random() < 0.7;
  const payment_date = isPaid ? "2026-06-20" : null;
  const due_date = "2026-06-25";

  let status: InvoiceStatus = "Pending";
  if (isPaid) status = "Paid";
  else if (new Date(due_date) < new Date("2026-07-05")) status = "Overdue";

  const overage_percent = Math.round((overage_gb / customer.allocated_data_gb) * 100);
  let usage_anomaly_level: UsageAnomalyLevel = "Normal";
  if (overage_percent > 50) usage_anomaly_level = "ShockAnomaly";
  else if (overage_percent > 0) usage_anomaly_level = "SustainableOverage";

  const requires_admin_approval = total_amount > customer.monthly_fee * 3;
  if (requires_admin_approval) status = "Suspended_Anomalous";

  const delivery_method = Math.random() < 0.6 ? "Digital" : "Paper";

  return {
    invoice_id: `INV-${billingPeriod}-${customer.customer_id}-${index}`,
    customer_id: customer.customer_id,
    billing_period: billingPeriod,
    actual_used_data,
    wireless_usage_fee: telsiz_kullanim_ucreti,
    overage_charge,
    total_amount,
    due_date,
    payment_date,
    payment_channel: isPaid ? randomFrom([...PAYMENT_CHANNELS]) : null,
    delivery_method,
    status,
    usage_anomaly_level,
    overage_percent,
    days_overdue: status === "Overdue" ? 10 : 0,
    carbon_saved_kg: delivery_method === "Digital" ? 0.05 : 0,
    requires_admin_approval,
  };
}


export function generateMockCustomers(count: number): Customer[] {
  return Array.from({ length: count }, (_, i) => generateMockCustomer(i + 1));
}

export function generateMockInvoicesForCustomers(customers: Customer[], billingPeriod: string): Invoice[] {
  return customers.map((c, i) => generateMockInvoice(c, billingPeriod, i + 1));
}