export interface PackageInfo {
  id: number;
  packageCode: string;
  packageName: string;
  internetLimitGb: number;
  minuteLimit: number;
  smsLimit: number;
  monthlyFee: number;
}

export interface DashboardSummary {
  totalUnpaidAmount: number;
  nextPaymentDueDate: string | null;
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
}
