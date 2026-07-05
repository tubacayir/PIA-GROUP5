import type { Invoice } from "../../types/entities";

interface InvoiceTableProps {
  invoices: Invoice[];
}

function statusColor(status: Invoice["status"]): string {
  switch (status) {
    case "Paid":
      return "text-green-600";
    case "Overdue":
      return "text-red-600";
    case "Suspended_Anomalous":
      return "text-orange-600 font-bold";
    default:
      return "text-gray-600";
  }
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="p-2">Fatura ID</th>
          <th className="p-2">Müşteri ID</th>
          <th className="p-2">Dönem</th>
          <th className="p-2">Kullanım (GB)</th>
          <th className="p-2">Toplam Tutar</th>
          <th className="p-2">Son Ödeme</th>
          <th className="p-2">Durum</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.invoice_id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="p-2">{inv.invoice_id}</td>
            <td className="p-2">{inv.customer_id}</td>
            <td className="p-2">{inv.billing_period}</td>
            <td className="p-2">{inv.actual_used_data} GB</td>
            <td className="p-2">{inv.total_amount.toFixed(2)} TL</td>
            <td className="p-2">{inv.due_date}</td>
            <td className={`p-2 ${statusColor(inv.status)}`}>{inv.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}