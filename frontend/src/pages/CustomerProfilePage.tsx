import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  MessageSquare,
  Phone,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuthStore } from "../features/auth/authStore";
import { useAsyncData } from "../features/customer/useAsyncData";
import {
  getCurrentUsage,
  getDashboardSummary,
  getInvoices,
  getRecommendations,
} from "../features/customer/customerService";
import { formatCurrency, formatDate, formatPeriodLabel } from "../features/customer/format";

type UsagePanelKey = "internet" | "minutes" | "sms";

function getStatusLabel(status: string) {
  switch (status) {
    case "PAID":
      return "Ödendi";
    case "OVERDUE":
      return "Gecikti";
    case "CANCELLED":
      return "İptal";
    default:
      return "Beklemede";
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700";
    case "OVERDUE":
      return "bg-red-100 text-red-700";
    case "CANCELLED":
      return "bg-slate-200 text-slate-600";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function CustomerProfilePage() {
  const user = useAuthStore((state) => state.user);

  const summary = useAsyncData(getDashboardSummary, []);
  const usage = useAsyncData(getCurrentUsage, []);
  const invoices = useAsyncData(getInvoices, []);
  const recommendations = useAsyncData(getRecommendations, []);

  const [panelIndex, setPanelIndex] = useState(0);
  const [upgradeRequested, setUpgradeRequested] = useState(false);

  const loading = summary.loading || usage.loading || invoices.loading;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Yükleniyor...</p>
      </main>
    );
  }

  if (summary.error || !summary.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />

          <h1 className="mt-4 text-xl font-bold text-slate-950">
            Hesap bilgileri yüklenemedi
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {summary.error ?? "Bilinmeyen bir hata oluştu."}
          </p>

          <Link
            to="/logout"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600"
          >
            Giriş sayfasına dön
          </Link>
        </div>
      </main>
    );
  }

  const dashboardSummary = summary.data;
  const currentUsage = usage.data;

  const sortedInvoices = [...(invoices.data ?? [])].sort((a, b) =>
    b.issueDate.localeCompare(a.issueDate)
  );

  const latestInvoice = sortedInvoices[0];
  const activeRecommendation = (recommendations.data ?? [])[0];

  const usagePanels: {
    key: UsagePanelKey;
    label: string;
    icon: typeof Wifi;
    used: number;
    limit: number;
    unit: string;
  }[] = currentUsage
    ? [
        {
          key: "internet",
          label: "İnternet Kullanımı",
          icon: Wifi,
          used: currentUsage.usedInternetGb,
          limit: currentUsage.internetLimitGb,
          unit: "GB",
        },
        {
          key: "minutes",
          label: "Dakika Kullanımı",
          icon: Phone,
          used: currentUsage.usedMinutes,
          limit: currentUsage.minuteLimit,
          unit: "dk",
        },
        {
          key: "sms",
          label: "SMS Kullanımı",
          icon: MessageSquare,
          used: currentUsage.usedSms,
          limit: currentUsage.smsLimit,
          unit: "SMS",
        },
      ]
    : [];

  const activePanel = usagePanels[panelIndex];

  const goToPanel = (direction: 1 | -1) => {
    setPanelIndex((current) => (current + direction + usagePanels.length) % usagePanels.length);
  };

  const now = new Date();
  const periodLabel = formatPeriodLabel(now.getMonth() + 1, now.getFullYear());

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">
                PiaCell
              </p>

              <p className="text-xs text-slate-500">Customer Portal</p>
            </div>
          </div>

          <Link
            to="/logout"
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-xl lg:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-200">
              <Sparkles className="h-4 w-4" />
              Welcome to PiaCell
            </div>

            <h1
              className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl"
              style={{ color: "#fff" }}
            >
              Merhaba, {user?.displayName ?? "Müşterimiz"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
              {periodLabel} dönemine ait fatura, ödeme ve kullanım bilgilerinizin özeti aşağıda yer alıyor.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Toplam Ödenmemiş Tutar
                </p>

                <p
                  className={`mt-2 text-xl font-bold ${
                    dashboardSummary.totalUnpaidAmount > 0 ? "text-red-600" : "text-slate-950"
                  }`}
                >
                  {formatCurrency(dashboardSummary.totalUnpaidAmount)}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <ReceiptText className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Sonraki Ödeme Tarihi
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  {dashboardSummary.nextPaymentDueDate
                    ? formatDate(dashboardSummary.nextPaymentDueDate)
                    : "Ödenmemiş fatura yok"}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Güncel Fatura Tutarı
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-950">
                  {latestInvoice ? formatCurrency(latestInvoice.totalAmount) : "—"}
                </p>

                <p className="mt-1 text-xs text-blue-700/70">
                  {latestInvoice
                    ? formatPeriodLabel(latestInvoice.invoiceMonth, latestInvoice.invoiceYear)
                    : "Fatura bulunamadı"}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
                <ReceiptText className="h-5 w-5" />
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="font-bold text-slate-950">Son Faturalar</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Son dönem fatura hareketleriniz
                </p>
              </div>

              <FileText className="h-5 w-5 text-slate-400" />
            </div>

            {sortedInvoices.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {sortedInvoices.slice(0, 3).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatPeriodLabel(invoice.invoiceMonth, invoice.invoiceYear)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Son ödeme: {formatDate(invoice.dueDate)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <p className="font-bold text-slate-950">
                        {formatCurrency(invoice.totalAmount)}
                      </p>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          invoice.status
                        )}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-sm text-slate-500">Henüz fatura bulunmuyor.</p>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-950">Kullanım Durumu</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Güncel dönem kota kullanımınız
                </p>
              </div>

              {usagePanels.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => goToPanel(-1)}
                    aria-label="Önceki"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => goToPanel(1)}
                    aria-label="Sonraki"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {activePanel ? (
              <>
                <div className="mt-6 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <activePanel.icon className="h-5 w-5" />
                  </div>

                  <p className="font-semibold text-slate-900">{activePanel.label}</p>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <p className="text-3xl font-bold text-slate-950">
                    {activePanel.used} / {activePanel.limit} {activePanel.unit}
                  </p>

                  <p className="text-sm font-semibold text-slate-500">
                    %{Math.min(100, Math.round((activePanel.used / activePanel.limit) * 100))}
                  </p>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      activePanel.used > activePanel.limit ? "bg-red-500" : "bg-blue-600"
                    }`}
                    style={{
                      width: `${Math.min(100, (activePanel.used / activePanel.limit) * 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-center gap-2">
                  {usagePanels.map((panel, index) => (
                    <button
                      key={panel.key}
                      type="button"
                      aria-label={panel.label}
                      onClick={() => setPanelIndex(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === panelIndex ? "w-6 bg-blue-600" : "w-1.5 bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-6 text-sm text-slate-500">
                Kullanım verisi henüz mevcut değil.
              </p>
            )}
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-slate-950">Account Security</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Your PiaCell session is protected by role-based access.
                </p>
              </div>
            </div>
          </article>

          {activeRecommendation && (
            <article
              className={`rounded-2xl border p-5 ${
                activeRecommendation.isHighPriority
                  ? "border-red-200 bg-red-50"
                  : "border-violet-100 bg-violet-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-xl bg-white p-2.5 shadow-sm ${
                    activeRecommendation.isHighPriority ? "text-red-600" : "text-violet-600"
                  }`}
                >
                  <Sparkles className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-950">Package Recommendation</p>
                    {activeRecommendation.isHighPriority && (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                        High Priority
                      </span>
                    )}
                  </div>

                  {activeRecommendation.currentPackage && activeRecommendation.suggestedPackage && (
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {activeRecommendation.currentPackage.packageName} &rarr;{" "}
                      {activeRecommendation.suggestedPackage.packageName}
                    </p>
                  )}

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {activeRecommendation.reason}
                  </p>

                  {activeRecommendation.averageUsageRatio != null && (
                    <p className="mt-2 text-xs text-slate-500">
                      Ortalama kullanımınız kotanın %{activeRecommendation.averageUsageRatio}&apos;i seviyesinde.
                    </p>
                  )}

                  {activeRecommendation.expectedSavingAmount != null &&
                    activeRecommendation.expectedSavingAmount > 0 && (
                      <p className="mt-1 text-xs font-semibold text-emerald-700">
                        Tahmini aylık tasarruf: {formatCurrency(activeRecommendation.expectedSavingAmount)}
                      </p>
                    )}

                  {activeRecommendation.recommendationType === "UPGRADE" && (
                    <div className="mt-3">
                      {upgradeRequested ? (
                        <p className="text-sm font-medium text-emerald-700">
                          Talebiniz alındı, ekibimiz sizinle iletişime geçecek.
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setUpgradeRequested(true)}
                          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Upgrade Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          )}
        </section>

        <footer className="flex items-center justify-center border-t border-slate-200 py-5 text-xs text-slate-400">
          <p>PiaCell • Smart Billing & Customer Intelligence</p>
        </footer>
      </div>
    </main>
  );
}
