import { useState } from "react";
import type { Invoice } from "../../types/entities";
import { useInvoiceStore } from "../../store/invoiceStore";

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
  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);
  const deleteInvoice = useInvoiceStore((state) => state.deleteInvoice);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Invoice["status"]>("Pending");

  function startEditing(inv: Invoice) {
    setEditingId(inv.invoice_id);
    setEditStatus(inv.status);
  }

  function saveEditing(id: string) {
    updateInvoice(id, { status: editStatus });
    setEditingId(null);
  }

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="p-2">Invoice ID</th>
          <th className="p-2">Customer ID</th>
          <th className="p-2">Period</th>
          <th className="p-2">Usage (GB)</th>
          <th className="p-2">Total Amount</th>
          <th className="p-2">Due Date</th>
          <th className="p-2">Status</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => {
          const isEditing = editingId === inv.invoice_id;

          return (
            <tr key={inv.invoice_id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-2">{inv.invoice_id}</td>
              <td className="p-2">{inv.customer_id}</td>
              <td className="p-2">{inv.billing_period}</td>
              <td className="p-2">{inv.actual_used_data} GB</td>
              <td className="p-2">{inv.total_amount.toFixed(2)} TL</td>
              <td className="p-2">{inv.due_date}</td>

              <td className="p-2">
                {isEditing ? (
                  <select
                    className="border p-1 rounded"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Invoice["status"])}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Suspended_Anomalous">Suspended_Anomalous</option>
                  </select>
                ) : (
                  <span className={statusColor(inv.status)}>{inv.status}</span>
                )}
              </td>

              <td className="p-2 flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={() => saveEditing(inv.invoice_id)} className="text-green-600 hover:underline">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(inv)} className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => deleteInvoice(inv.invoice_id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}