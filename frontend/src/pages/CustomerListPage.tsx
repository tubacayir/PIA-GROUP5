import { generateMockCustomers } from "../mock/mockData";
import CustomerTable from "../components/customer/CustomerTable";

export default function CustomerListPage() {
  const customers = generateMockCustomers(20);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Müşteri Listesi</h1>
      <CustomerTable customers={customers} />
    </div>
  );
}