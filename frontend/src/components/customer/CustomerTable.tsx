import { useState } from "react";
import { Link } from "react-router-dom";
import type { Customer } from "../../types/entities";
import { useCustomerStore } from "../../store/customerStore";

interface CustomerTableProps {
  customers: Customer[];
}

export default function CustomerTable({ customers }: CustomerTableProps) {
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");

  function startEditing(c: Customer) {
    setEditingId(c.customer_id);
    setEditName(c.customer_name);
    setEditFee(String(c.monthly_fee));
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function saveEditing(id: string) {
    updateCustomer(id, {
      customer_name: editName,
      monthly_fee: Number(editFee),
    });
    setEditingId(null);
  }

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="p-2">Customer ID</th>
          <th className="p-2">Name</th>
          <th className="p-2">Type</th>
          <th className="p-2">Package</th>
          <th className="p-2">Monthly Fee</th>
          <th className="p-2">Active</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((c) => {
          const isEditing = editingId === c.customer_id;

          return (
            <tr key={c.customer_id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-2">{c.customer_id}</td>

              <td className="p-2">
                {isEditing ? (
                  <input
                    className="border p-1 rounded w-full"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  <Link to={`/customers/${c.customer_id}`} className="text-blue-600 hover:underline">
                    {c.customer_name}
                  </Link>
                )}
              </td>

              <td className="p-2">{c.customer_type}</td>
              <td className="p-2">{c.package_name}</td>

              <td className="p-2">
                {isEditing ? (
                  <input
                    type="number"
                    className="border p-1 rounded w-24"
                    value={editFee}
                    onChange={(e) => setEditFee(e.target.value)}
                  />
                ) : (
                  `${c.monthly_fee} TL`
                )}
              </td>

              <td className="p-2">{c.is_active ? "Yes" : "No"}</td>

              <td className="p-2 flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => saveEditing(c.customer_id)}
                      className="text-green-600 hover:underline"
                    >
                      Save
                    </button>
                    <button onClick={cancelEditing} className="text-gray-500 hover:underline">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(c)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCustomer(c.customer_id)}
                      className="text-red-600 hover:underline"
                    >
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