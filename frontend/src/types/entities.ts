// ============================================================================
// CUSTOMER INVOICE MANAGEMENT & ANALYZE APPLICATION
// Frontend Entity / Type Tanımları
// ============================================================================

// 1. ENUM / UNION TİPLER
export type CustomerType = "Individual" | "Corporate";

export type PaymentChannel = "Mobile_App" | "Web" | "Bank_App" | "Store" | null;

export type DeliveryMethod = "Digital" | "Paper";

export type InvoiceStatus =
  | "Paid"
  | "Overdue"
  | "Pending"
  | "Suspended_Anomalous";

export type ChurnRiskLevel = "Low" | "Medium" | "High";

export type UsageAnomalyLevel = "Normal" | "SustainableOverage" | "ShockAnomaly";

export type AgeGroup = "Genç (18-30)" | "Orta Yaş (31-50)" | "Kıdemli (51+)";

// 2. CORE ENTITY: CUSTOMER
export interface Customer {
  customer_id: string;
  customer_name: string;
  customer_type: CustomerType;
  company_name: string | null;
  birth_date: string;
  registration_date: string;
  package_name: string;
  allocated_data_gb: number;
  monthly_fee: number;
  contract_end_date: string;
  is_active: boolean;

  age_group: AgeGroup;
  loyalty_years: number;
  is_loyal_customer: boolean;
  loyalty_discount_percent: number;
  potential_churn_rate_flag: ChurnRiskLevel;
  suggest_upper_package: boolean;
  contract_ending_soon: boolean;
  preferred_channel_trend: "Digital" | "Traditional";
}

// 3. CORE ENTITY: INVOICE
export interface Invoice {
  invoice_id: string;
  customer_id: string;
  billing_period: string;
  actual_used_data: number;
  telsiz_kullanim_ucreti: number;
  overage_charge: number;
  total_amount: number;
  due_date: string;
  payment_date: string | null;
  payment_channel: PaymentChannel;
  delivery_method: DeliveryMethod;

  status: InvoiceStatus;
  usage_anomaly_level: UsageAnomalyLevel;
  overage_percent: number;
  days_overdue: number;
  carbon_saved_kg: number;
  requires_admin_approval: boolean;
}

// 4. TÜRETİLMİŞ ENTITY: CORPORATE ACCOUNT
export interface CorporateAccountSummary {
  company_name: string;
  employee_count: number;
  total_consolidated_amount: number;
  average_payment_delay_days: number;
  employees: Pick<Customer, "customer_id" | "customer_name" | "package_name">[];
  billing_period: string;
}

// 5. ADMIN DASHBOARD KPI VIEW-MODELS
export interface FinancialSummaryKPI {
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  period: string;
}

export interface ChannelDistributionKPI {
  channel: PaymentChannel;
  percentage: number;
  customer_count: number;
}

export interface DemographicCorrelationKPI {
  age_group: AgeGroup;
  on_time_payment_rate: number;
  digital_adoption_rate: number;
}

export interface GreenInvoiceKPI {
  total_digital_invoices: number;
  total_carbon_saved_kg: number;
  estimated_trees_saved: number;
}

export interface ChurnRiskListItem {
  customer_id: string;
  customer_name: string;
  potential_churn_rate_flag: ChurnRiskLevel;
  usage_drop_percent: number;
  last_invoice_status: InvoiceStatus;
}

export interface CorporateVsIndividualDelayKPI {
  customer_type: CustomerType;
  average_delay_days: number;
}