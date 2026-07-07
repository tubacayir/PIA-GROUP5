import {
    getNextPackage,
    getPackageByCode,
    type PiacellPackage,
  } from "../mock/packageCatalog";
  
  export type UsageClassification =
    | "NORMAL"
    | "CONTINUOUS_OVERAGE"
    | "ANOMALOUS";
  
  export type InvoiceReviewStatus =
    | "VISIBLE"
    | "SUSPENDED_ANOMALOUS";
  
  interface UsageAnalysisInput {
    packageCode: string;
    currentUsageGb: number;
    lastThreeMonthsUsageGb: number[];
    totalAmount: number;
  }
  
  export interface UsageAnalysisResult {
    classification: UsageClassification;
    suggestUpperPackage: boolean;
    recommendedPackage: PiacellPackage | null;
    invoiceStatus: InvoiceReviewStatus;
    visibleToCustomer: boolean;
  }
  
  export const analyzeUsage = ({
    packageCode,
    currentUsageGb,
    lastThreeMonthsUsageGb,
    totalAmount,
  }: UsageAnalysisInput): UsageAnalysisResult => {
    const currentPackage = getPackageByCode(packageCode);
  
    if (!currentPackage) {
      throw new Error(`Package not found: ${packageCode}`);
    }
  
    const usageRatio =
      currentUsageGb / currentPackage.internetGb;
  
    const amountRatio =
      totalAmount / currentPackage.monthlyPrice;
  
    const isAnomalous =
      usageRatio >= 5 ||
      amountRatio > 3;
  
    if (isAnomalous) {
      return {
        classification: "ANOMALOUS",
        suggestUpperPackage: false,
        recommendedPackage: null,
        invoiceStatus: "SUSPENDED_ANOMALOUS",
        visibleToCustomer: false,
      };
    }
  
    const hasThreeMonthHistory =
      lastThreeMonthsUsageGb.length === 3;
  
    const exceedsPackageEveryMonth =
      hasThreeMonthHistory &&
      lastThreeMonthsUsageGb.every(
        (usage) =>
          usage > currentPackage.internetGb
      );
  
    if (exceedsPackageEveryMonth) {
      const recommendedPackage =
        getNextPackage(packageCode);
  
      return {
        classification: "CONTINUOUS_OVERAGE",
        suggestUpperPackage:
          recommendedPackage !== null,
        recommendedPackage,
        invoiceStatus: "VISIBLE",
        visibleToCustomer: true,
      };
    }
  
    return {
      classification: "NORMAL",
      suggestUpperPackage: false,
      recommendedPackage: null,
      invoiceStatus: "VISIBLE",
      visibleToCustomer: true,
    };
  };