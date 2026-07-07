import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FileText, LogOut } from "lucide-react";
import { getInvoiceDetail, getApiErrorMessage, type InvoiceDetail } from "../services/api";

function CustomerHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 lg:px-8">
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

export default function CustomerInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getInvoiceDetail(Number(id))
      .then(setInvoice)
      .catch((err) => setError(getApiErrorMessage(err, "Fatura detayı yüklenemedi.")))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />

      <div className="p-6">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <p className="text-gray-500">Yükleniyor...</p>
          ) : error || !invoice ? (
            <p className="text-red-500">{error ?? "Fatura bulunamadı."}</p>
          ) : (
            <>
              <Link to="/customer/invoices" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
                ← Faturalarıma Dön
              </Link>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h1 className="mb-1 text-xl font-bold text-gray-800">
                  Fatura: {invoice.invoiceNumber}
                </h1>
                <p className="mb-6 text-sm text-gray-500">
                  {invoice.invoiceMonth}/{invoice.invoiceYear} dönemi
                </p>

                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Abonelik No</p>
                    <p className="font-medium text-gray-800">{invoice.subscriptionNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Telefon</p>
                    <p className="font-medium text-gray-800">{invoice.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Paket</p>
                    <p className="font-medium text-gray-800">{invoice.packageName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Son Ödeme Tarihi</p>
                    <p className="font-medium text-gray-800">{invoice.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Durum</p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        invoice.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "OVERDUE"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Toplam Tutar</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₺{Number(invoice.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {invoice.lines.length > 0 && (
                  <>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Fatura Kalemleri
                    </h2>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                        <tr>
                          <th className="px-3 py-2">Tür</th>
                          <th className="px-3 py-2">Açıklama</th>
                          <th className="px-3 py-2 text-right">Adet</th>
                          <th className="px-3 py-2 text-right">Birim Fiyat</th>
                          <th className="px-3 py-2 text-right">Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {invoice.lines.map((line, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-gray-600">{line.lineType}</td>
                            <td className="px-3 py-2 text-gray-800">{line.description}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{line.quantity}</td>
                            <td className="px-3 py-2 text-right text-gray-600">
                              ₺{Number(line.unitPrice).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-gray-800">
                              ₺{Number(line.amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
