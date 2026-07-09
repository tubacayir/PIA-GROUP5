export interface PackageInfo {
  id: number;
  packageCode: string;
  packageName: string;
  internetLimitGb: number;
  minuteLimit: number;
  smsLimit: number;
  monthlyFee: number;
}

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

export interface CurrentUsage {
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

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  currentPackage: PackageInfo | null;
  subscriptionStatus: string | null;
  commitmentStartDate: string | null;
  commitmentEndDate: string | null;
  latestInvoice: InvoiceSummary | null;
  currentUsage: CurrentUsage | null;
  overageAmount: number;
  totalWithOverage: number;
}

export interface Subscription {
  id: number;
  subscriptionNumber: string;
  phoneNumber: string;
  employeeName: string;
  tariffPackage: PackageInfo;
  status: string;
  commitmentStartDate: string | null;
  commitmentEndDate: string | null;
}

export interface DashboardSummary {
  totalEmployees: number;
  totalActiveSubscriptions: number;
  totalMonthlyInvoiceAmount: number;
  totalInternetUsageGb: number;
  totalVoiceMinutes: number;
  totalSmsUsage: number;
  subscriptionsExceedingLimits: number;
  recommendationOpportunities: number;
  currentCorporatePackage: PackageInfo | null;
}

export interface Recommendation {
  id: number;
  currentPackage: PackageInfo | null;
  suggestedPackage: PackageInfo | null;
  recommendationType: string;
  reason: string;
  expectedSavingAmount: number | null;
  confidenceScore: number;
  status: string;
  createdAt: string;
  isHighPriority: boolean;
  averageUsageRatio: number | null;
}

export interface MonthlyUsageTrendPoint {
  year: number;
  month: number;
  internetGb: number;
  voiceMinutes: number;
  smsCount: number;
}

export interface MonthlyInvoiceTrendPoint {
  year: number;
  month: number;
  totalAmount: number;
}

export interface UsageRankingItem {
  subscriptionId: number;
  employeeName: string;
  phoneNumber: string;
  packageName: string;
  usedInternetGb: number;
  usedMinutes: number;
  usedSms: number;
  internetLimitGb: number;
  minuteLimit: number;
  smsLimit: number;
}

export interface UsageAnalytics {
  highestInternetConsumers: UsageRankingItem[];
  highestVoiceConsumers: UsageRankingItem[];
  highestSmsConsumers: UsageRankingItem[];
  exceedingLimits: UsageRankingItem[];
  underutilized: UsageRankingItem[];
}

export interface CorporateInvoiceSummary {
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

export interface InvoiceLine {
  lineType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceDetail {
  id: number;
  invoiceNumber: string;
  invoiceMonth: number;
  invoiceYear: number;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  subscriptionNumber: string;
  phoneNumber: string;
  packageName: string;
  lines: InvoiceLine[];
}

export interface TopSpenderItem {
  subscriptionId: number;
  employeeName: string;
  phoneNumber: string;
  packageName: string;
  totalBilledAmount: number;
}

export interface InvoiceAnalytics {
  averageInvoiceAmount: number;
  mostExpensiveSubscriptions: TopSpenderItem[];
}
