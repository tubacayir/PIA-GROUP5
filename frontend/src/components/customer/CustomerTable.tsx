import type { Customer } from "../../types/entities";

interface CustomerTableProps {
  customers: Customer[];
}

export default function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="p-2">Müşteri ID</th>
          <th className="p-2">Ad</th>
          <th className="p-2">Tip</th>
          <th className="p-2">Paket</th>
          <th className="p-2">Aylık Ücret</th>
          <th className="p-2">Aktif mi</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((c) => (
          <tr key={c.customer_id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="p-2">{c.customer_id}</td>
            <td className="p-2">{c.customer_name}</td>
            <td className="p-2">{c.customer_type}</td>
            <td className="p-2">{c.package_name}</td>
            <td className="p-2">{c.monthly_fee} TL</td>
            <td className="p-2">{c.is_active ? "Evet" : "Hayır"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}