const TOTAL_CUSTOMERS = 10_000;
const INDIVIDUAL_ONLY_CUSTOMERS = 8_000;
const HYBRID_CUSTOMERS = 2_000;

const CORPORATE_COMPANIES = 50;

const INDIVIDUAL_LINES = 10_000;
const CORPORATE_LINES = 2_000;
const TOTAL_LINES = INDIVIDUAL_LINES + CORPORATE_LINES;

const INVOICE_HISTORY_MONTHS = 3;

const INDIVIDUAL_INVOICES =
  INDIVIDUAL_LINES * INVOICE_HISTORY_MONTHS;

const CORPORATE_INVOICES =
  CORPORATE_LINES * INVOICE_HISTORY_MONTHS;

const TOTAL_INVOICES =
  INDIVIDUAL_INVOICES + CORPORATE_INVOICES;

export const datasetScenario = {
  customers: {
    total: TOTAL_CUSTOMERS,
    individualOnly: INDIVIDUAL_ONLY_CUSTOMERS,
    hybrid: HYBRID_CUSTOMERS,
    corporateCompanies: CORPORATE_COMPANIES,
  },

  lines: {
    individual: INDIVIDUAL_LINES,
    corporate: CORPORATE_LINES,
    total: TOTAL_LINES,
  },

  invoices: {
    historyMonths: INVOICE_HISTORY_MONTHS,
    individual: INDIVIDUAL_INVOICES,
    corporate: CORPORATE_INVOICES,
    total: TOTAL_INVOICES,
  },

  delivery: {
    digital: 23_400,
    paper: 12_600,
  },

  paymentStatus: {
    paidOnTime: 30_600,
    late: 5_400,
  },

  latePaymentBreakdown: {
    twoMonthsOrMoreUnpaid: 2_160,
    oneMonthUnpaid: 1_800,
    oneToTenDaysLate: 1_440,
  },

  paymentChannels: {
    bankApp: 16_200,
    piacellMobileApp: 7_200,
    store: 3_600,
    automaticCreditCard: 9_000,
  },

  usage: {
    normal: 33_120,
    continuousOverage: 2_160,
    anomalous: 720,
  },

  recommendations: {
    upperPackage: 2_160,
  },

  sustainability: {
    carbonSavedKg: 1_170,
    treesEquivalent: 58,
  },
} as const;