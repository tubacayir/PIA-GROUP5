import { useInvoiceStore } from "../store/invoiceStore";
import InvoiceTable from "../components/invoice/InvoiceTable";
import InvoiceForm from "../components/invoice/InvoiceForm";

export default function InvoiceListPage() {
  const invoices = useInvoiceStore((state) => state.invoices);

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Invoice List</h1>
      <InvoiceForm />
      <InvoiceTable invoices={invoices} />
    </div>
  );
}