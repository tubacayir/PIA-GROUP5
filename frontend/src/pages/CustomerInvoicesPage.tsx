import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, LogOut } from "lucide-react";
import { getMyInvoices, getApiErrorMessage, type InvoiceSummary } from "../services/api";

function CustomerHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">PiaCell</p>
            <p className="text-xs text-slate-500">Customer Portal</p>
          </div>
        </div>

        <Link
          to="/logout"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyInvoices()
      .then(setInvoices)
      .catch((err) => setError(getApiErrorMessage(err, "Faturalar yüklenemedi.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />

      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          {loading ? (
            <p className="text-gray-500">Yükleniyor...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <h1 className="mb-6 text-2xl font-bold text-gray-800">Faturalarım</h1>

              {invoices.length === 0 ? (
                <p className="text-gray-500">Henüz fatura bulunmuyor.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Fatura No</th>
                        <th className="px-4 py-3">Dönem</th>
                        <th className="px-4 py-3">Son Ödeme</th>
                        <th className="px-4 py-3 text-right">Tutar</th>
                        <th className="px-4 py-3">Durum</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{inv.invoiceNumber}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {inv.invoiceMonth}/{inv.invoiceYear}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{inv.dueDate}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-800">
                            ₺{Number(inv.totalAmount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                inv.status === "PAID"
                                  ? "bg-green-100 text-green-700"
                                  : inv.status === "OVERDUE"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to={`/customer/invoices/${inv.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              Detay
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
