export interface AdminDashboardSummary {
  totalCustomers: number;
  totalSubscriptions: number;
  totalCompanies: number;
  corporateLineCount: number;
  totalInvoices: number;
  monthlyRevenue: number;
  digitalInvoiceRatePercent: number;
  paperInvoiceRatePercent: number;
  paidOnTimeRatePercent: number;
  latePaymentRatePercent: number;
  averageInvoiceAmount: number;
  averageInternetUsageGb: number;
}

export interface NameCountItem {
  name: string;
  count: number;
}

export interface NameAmountItem {
  name: string;
  amount: number;
}

export interface MonthlyRevenuePoint {
  year: number;
  month: number;
  totalAmount: number;
}

export interface MonthlyCountPoint {
  year: number;
  month: number;
  count: number;
}

export interface AdminDashboardCharts {
  monthlyRevenueTrend: MonthlyRevenuePoint[];
  monthlyInvoiceCountTrend: MonthlyCountPoint[];
  packageDistribution: NameCountItem[];
  corporateVsIndividual: NameCountItem[];
  invoiceStatusDistribution: NameCountItem[];
  paymentChannelDistribution: NameCountItem[];
  digitalVsPaper: NameCountItem[];
  topCities: NameCountItem[];
  ageDistribution: NameCountItem[];
  genderDistribution: NameCountItem[];
  topPackages: NameCountItem[];
  topCompanies: NameAmountItem[];
  usageDistribution: NameCountItem[];
  latePaymentTrend: MonthlyCountPoint[];
}

export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";
export type CustomerStatus = "ACTIVE" | "PASSIVE" | "SUSPENDED" | "DELETED";

export interface AdminCustomerSummary {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  gender: Gender;
  age: number;
  subscriptionCount: number;
  status: CustomerStatus;
  customerType: "Individual" | "Corporate";
}

export interface AdminCustomerSubscriptionItem {
  id: number;
  subscriptionNumber: string;
  phoneNumber: string;
  packageName: string;
  status: string;
  startDate: string;
  organizationName: string | null;
}

export interface AdminInvoiceSummaryItem {
  id: number;
  invoiceNumber: string;
  invoiceMonth: number;
  invoiceYear: number;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
}

export interface AdminCurrentUsage {
  usageMonth: number;
  usageYear: number;
  usedInternetGb: number;
  usedMinutes: number;
  usedSms: number;
  internetLimitGb: number;
  minuteLimit: number;
  smsLimit: number;
  exceedsLimit: boolean;
}

export interface AdminPaymentHistoryItem {
  invoiceNumber: string;
  paymentDate: string;
  paymentChannel: string | null;
  amount: number;
  onTime: boolean;
}

export interface AdminCustomerDetail {
  id: number;
  tcIdentityNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: Gender;
  city: string;
  status: CustomerStatus;
  subscriptions: AdminCustomerSubscriptionItem[];
  invoiceHistory: AdminInvoiceSummaryItem[];
  currentUsage: AdminCurrentUsage[];
  monthlyInvoiceTrend: MonthlyRevenuePoint[];
  usageTrend: { year: number; month: number; internetGb: number; voiceMinutes: number; smsCount: number }[];
  paymentHistory: AdminPaymentHistoryItem[];
}

export interface CreateCustomerRequest {
  tcIdentityNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  birthDate: string;
  gender: Gender;
  city: string;
}

export interface UpdateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: Gender;
  city: string;
}

export interface CustomerFilters {
  search?: string;
  city?: string;
  gender?: Gender;
  status?: CustomerStatus;
  customerType?: "Individual" | "Corporate";
  packageId?: number;
  minAge?: number;
  maxAge?: number;
}

export interface AdminOrganizationSummary {
  id: number;
  name: string;
  taxIdentityNumber: string;
  sector: string;
  city: string;
  subscriptionCount: number;
  status: CustomerStatus;
}

export interface AdminSubscriptionItem {
  id: number;
  subscriptionNumber: string;
  phoneNumber: string;
  employeeName: string;
  tariffPackage: {
    id: number;
    packageCode: string;
    packageName: string;
    internetLimitGb: number;
    minuteLimit: number;
    smsLimit: number;
    monthlyFee: number;
  };
  status: string;
  commitmentStartDate: string | null;
  commitmentEndDate: string | null;
}

export interface AdminCorporateInvoiceItem {
  id: number;
  invoiceNumber: string;
  employeeName: string;
  phoneNumber: string;
  invoiceMonth: number;
  invoiceYear: number;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
}

export interface AdminOrganizationDetail {
  id: number;
  taxIdentityNumber: string;
  name: string;
  sector: string;
  employeeCount: number;
  city: string;
  status: CustomerStatus;
  subscriptionCount: number;
  activeSubscriptionCount: number;
  totalBilledAmount: number;
  subscriptions: AdminSubscriptionItem[];
  invoiceHistory: AdminCorporateInvoiceItem[];
  monthlyInvoiceTrend: MonthlyRevenuePoint[];
}

export interface CreateOrganizationRequest {
  taxIdentityNumber: string;
  name: string;
  password: string;
  sector: string;
  employeeCount: number;
  city: string;
}

export interface UpdateOrganizationRequest {
  name: string;
  sector: string;
  employeeCount: number;
  city: string;
}

export interface OrganizationFilters {
  search?: string;
  city?: string;
  sector?: string;
  status?: CustomerStatus;
}

export interface AdminPackageInfo {
  id: number;
  packageCode: string;
  packageName: string;
  internetLimitGb: number;
  minuteLimit: number;
  smsLimit: number;
  monthlyFee: number;
}

export interface AdminUserAccount {
  id: number;
  email: string;
  fullName: string;
  canCreateInvoices: boolean;
  status: CustomerStatus;
}

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  fullName: string;
  canCreateInvoices: boolean;
}
