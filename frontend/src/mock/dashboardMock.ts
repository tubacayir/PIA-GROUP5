import { datasetScenario } from "./datasetScenario";

const calculatePercentage = (
  value: number,
  total: number
) => Math.round((value / total) * 100);

export const greenInvoiceData = {
  digitalInvoices: datasetScenario.delivery.digital,

  paperInvoices: datasetScenario.delivery.paper,

  digitalInvoiceRate: calculatePercentage(
    datasetScenario.delivery.digital,
    datasetScenario.invoices.total
  ),

  carbonSavedKg:
    datasetScenario.sustainability.carbonSavedKg,

  treesEquivalent:
    datasetScenario.sustainability.treesEquivalent,
};



  export const invoiceTrendData = [
    {
      month: "Apr",
      issued: 12_000,
      paidOnTime: 9_800,
    },
    {
      month: "May",
      issued: 12_000,
      paidOnTime: 10_050,
    },
    {
      month: "Jun",
      issued: 12_000,
      paidOnTime: 10_750,
    },
  ];

const unpaidInvoices =
  datasetScenario.latePaymentBreakdown
    .twoMonthsOrMoreUnpaid +
  datasetScenario.latePaymentBreakdown
    .oneMonthUnpaid;

export const paymentStatusChartData = [
  {
    name: "Paid on time",
    value: datasetScenario.paymentStatus.paidOnTime,
    percentage: calculatePercentage(
      datasetScenario.paymentStatus.paidOnTime,
      datasetScenario.invoices.total
    ),
    color: "#16a34a",
  },
  {
    name: "Late payment",
    value:
      datasetScenario.latePaymentBreakdown
        .oneToTenDaysLate,
    percentage: calculatePercentage(
      datasetScenario.latePaymentBreakdown
        .oneToTenDaysLate,
      datasetScenario.invoices.total
    ),
    color: "#f59e0b",
  },
  {
    name: "Unpaid",
    value: unpaidInvoices,
    percentage: calculatePercentage(
      unpaidInvoices,
      datasetScenario.invoices.total
    ),
    color: "#ef4444",
  },
];

export const paymentChannelData = [
  {
    label: "Bank App",
    percentage: calculatePercentage(
      datasetScenario.paymentChannels.bankApp,
      datasetScenario.invoices.total
    ),
  },
  {
    label: "Piacell App",
    percentage: calculatePercentage(
      datasetScenario.paymentChannels.piacellMobileApp,
      datasetScenario.invoices.total
    ),
  },
  {
    label: "Auto Payment",
    percentage: calculatePercentage(
      datasetScenario.paymentChannels
        .automaticCreditCard,
      datasetScenario.invoices.total
    ),
  },
  {
    label: "Store",
    percentage: calculatePercentage(
      datasetScenario.paymentChannels.store,
      datasetScenario.invoices.total
    ),
  },
];