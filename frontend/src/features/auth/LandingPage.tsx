import { ArrowRight, BarChart3, Building2, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">PiaCell</p>
              <p className="text-xs text-slate-400">Smart Billing Intelligence</p>
            </div>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">Invoice Insight Platform</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight lg:text-7xl">
              Customer, usage and invoice intelligence in one place.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              PiaCell helps customers, companies and administrators monitor subscriptions, invoices, payments,
              package usage and risk signals through role-based dashboards.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-black/20 transition hover:bg-blue-50"
              >
                <UserRound className="h-4 w-4" />
                Bireysel / Şirket Girişi
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Login
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[28px] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-500/20 p-3 text-blue-200">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Advanced analytics</h2>
                  <p className="mt-1 text-sm text-slate-400">Revenue, package usage, geography and payment trends.</p>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-200">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Role-based access</h2>
                  <p className="mt-1 text-sm text-slate-400">Separate experiences for customers, companies and admins.</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
