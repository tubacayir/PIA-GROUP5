import { useParams, Link } from "react-router-dom";
import { useCustomerStore } from "../store/customerStore";
import { useInvoiceStore } from "../store/invoiceStore";
import InvoiceTable from "../components/invoice/InvoiceTable";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const customer = useCustomerStore((state) =>
    state.customers.find((c) => c.customer_id === id)
  );
  const allInvoices = useInvoiceStore((state) => state.invoices);
const invoices = allInvoices.filter((inv) => inv.customer_id === id);

  if (!customer) {
    return (
      <div className="p-6">
        <p>Customer not found.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to customer list
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <Link to="/" className="text-blue-600 hover:underline w-fit">
        ← Back to customer list
      </Link>

      <div className="bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{customer.customer_name}</h1>
        <p><strong>ID:</strong> {customer.customer_id}</p>
        <p><strong>Type:</strong> {customer.customer_type}</p>
        {customer.company_name && <p><strong>Company:</strong> {customer.company_name}</p>}
        <p><strong>Package:</strong> {customer.package_name} ({customer.allocated_data_gb} GB)</p>
        <p><strong>Monthly Fee:</strong> {customer.monthly_fee} TL</p>
        <p><strong>Active:</strong> {customer.is_active ? "Yes" : "No"}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Invoices</h2>
        {invoices.length > 0 ? (
          <InvoiceTable invoices={invoices} />
        ) : (
          <p className="text-gray-500">No invoices found for this customer.</p>
        )}
      </div>
    </div>
  );
}