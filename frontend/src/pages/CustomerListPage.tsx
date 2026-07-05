import { useCustomerStore } from "../store/customerStore";
import CustomerTable from "../components/customer/CustomerTable";
import CustomerForm from "../components/customer/CustomerForm";

export default function CustomerListPage() {
  const customers = useCustomerStore((state) => state.customers);

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Customer List</h1>
      <CustomerForm />
      <CustomerTable customers={customers} />
    </div>
  );
}