import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "./authStore";
import type {
  LoginType,
  UserRole,
} from "./authTypes";

interface LoginTab {
  key: LoginType;
  label: string;
  description: string;
  idLabel: string;
  idPlaceholder: string;
  maxLength: number;
  numericOnly: boolean;
  icon: typeof UserRound;
}

const TABS: LoginTab[] = [
  {
    key: "INDIVIDUAL",
    label: "Customer",
    description: "Individual customer access",
    idLabel: "Turkish ID Number",
    idPlaceholder: "Enter your 11-digit ID number",
    maxLength: 11,
    numericOnly: true,
    icon: UserRound,
  },
  {
    key: "CORPORATE",
    label: "Corporate",
    description: "Organization account access",
    idLabel: "Tax Identification Number",
    idPlaceholder: "Enter your 10-digit tax ID",
    maxLength: 10,
    numericOnly: true,
    icon: Building2,
  },
  {
    key: "SYSTEM_ADMIN",
    label: "System Admin",
    description: "Administrative platform access",
    idLabel: "E-mail Address",
    idPlaceholder: "admin@example.com",
    maxLength: 100,
    numericOnly: false,
    icon: ShieldCheck,
  },
];

const getHomePath = (role: UserRole) => {
  switch (role) {
    case "SYSTEM_ADMIN":
      return "/dashboard";

    case "ORGANIZATION_ADMIN":
      return "/organization/dashboard";

    case "CUSTOMER":
      return "/customer/profile";
  }
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface LoginPageProps {
  variant?: "public" | "admin";
}

export default function LoginPage({ variant = "public" }: LoginPageProps) {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);

  const isLoading = useAuthStore(
    (state) => state.isLoading
  );

  const error = useAuthStore((state) => state.error);

  const clearError = useAuthStore(
    (state) => state.clearError
  );

  const visibleTabs =
    variant === "admin"
      ? TABS.filter((item) => item.key === "SYSTEM_ADMIN")
      : TABS.filter((item) => item.key !== "SYSTEM_ADMIN");

  const [activeTab, setActiveTab] = useState<LoginType>(
    variant === "admin" ? "SYSTEM_ADMIN" : "INDIVIDUAL"
  );

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  const activeTabConfig = TABS.find(
    (item) => item.key === activeTab
  )!;

  if (user) {
    return (
      <Navigate
        to={getHomePath(user.role)}
        replace
      />
    );
  }

  const clearErrors = () => {
    clearError();
    setValidationError(null);
  };

  const switchTab = (loginType: LoginType) => {
    setActiveTab(loginType);
    setIdentifier("");
    setPassword("");
    setShowPassword(false);
    clearErrors();
  };

  const handleIdentifierChange = (value: string) => {
    clearErrors();

    if (activeTabConfig.numericOnly) {
      const numericValue = value
        .replace(/\D/g, "")
        .slice(0, activeTabConfig.maxLength);

      setIdentifier(numericValue);
      return;
    }

    setIdentifier(
      value.slice(0, activeTabConfig.maxLength)
    );
  };

  const validateForm = () => {
    const normalizedIdentifier = identifier.trim();

    if (!normalizedIdentifier) {
      return `${activeTabConfig.idLabel} is required.`;
    }

    if (
      activeTab === "INDIVIDUAL" &&
      normalizedIdentifier.length !== 11
    ) {
      return "Turkish ID Number must contain exactly 11 digits.";
    }

    if (
      activeTab === "CORPORATE" &&
      normalizedIdentifier.length !== 10
    ) {
      return "Tax Identification Number must contain exactly 10 digits.";
    }

    if (
      activeTab === "SYSTEM_ADMIN" &&
      !isValidEmail(normalizedIdentifier)
    ) {
      return "Please enter a valid e-mail address.";
    }

    if (!password.trim()) {
      return "Password is required.";
    }

    return null;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearErrors();

    const formError = validateForm();

    if (formError) {
      setValidationError(formError);
      return;
    }

    try {
      const loggedInUser = await login({
        loginType: activeTab,
        identifier: identifier.trim(),
        password,
      });

      navigate(
        getHomePath(loggedInUser.role),
        {
          replace: true,
        }
      );
    } catch {
      // Authentication errors are managed by authStore.
    }
  };

  const ActiveTabIcon = activeTabConfig.icon;

  const visibleError = validationError ?? error;

  return (
    <main className="min-h-screen bg-slate-100 p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1500px] overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-300/60 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/40">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight">
                  PiaCell
                </p>

                <p className="text-xs text-slate-400">
                Smart Billing & Customer Intelligence
                </p>
            </div>
          </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Turn billing data into
              <span className="block text-blue-400">
                actionable insights.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Monitor customers, invoices, payments,
              usage patterns, anomalies and smart
              recommendations from one unified platform.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Customer 360° visibility
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Review lines, contracts, invoices,
                    payments and usage history.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Analytics and anomaly monitoring
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Detect unusual usage, overdue patterns
                    and revenue risks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Role-based secure access
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Dedicated access flows for customers,
                    organizations and administrators.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-500">
          PiaCell • Smart Billing & Customer Intelligence
          </p>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10 xl:p-16">
          <div className="w-full max-w-lg">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold text-slate-950">
                    Invoice Intelligence
                  </p>

                  <p className="text-xs text-slate-500">
                  Smart Billing Platform
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-600">
                Welcome
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Select your account type and enter your
                credentials to continue.
              </p>
            </div>

            {visibleTabs.length > 1 && (
            <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
              {visibleTabs.map((item) => {
                const Icon = item.icon;

                const isActive =
                  activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      switchTab(item.key)
                    }
                    className={`flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-center transition ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />

                    <span className="text-xs font-semibold sm:text-sm">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            )}

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <ActiveTabIcon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {activeTabConfig.label} Login
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {activeTabConfig.description}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
              noValidate
            >
              <div>
                <label
                  htmlFor="login-identifier"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  {activeTabConfig.idLabel}
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <ActiveTabIcon className="h-5 w-5" />
                  </div>

                  <input
                    id="login-identifier"
                    type={
                      activeTab === "SYSTEM_ADMIN"
                        ? "email"
                        : "text"
                    }
                    inputMode={
                      activeTabConfig.numericOnly
                        ? "numeric"
                        : "email"
                    }
                    autoComplete={
                      activeTab === "SYSTEM_ADMIN"
                        ? "email"
                        : "username"
                    }
                    maxLength={
                      activeTabConfig.maxLength
                    }
                    value={identifier}
                    onChange={(event) =>
                      handleIdentifierChange(
                        event.target.value
                      )
                    }
                    placeholder={
                      activeTabConfig.idPlaceholder
                    }
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {activeTabConfig.numericOnly && (
                  <p className="mt-2 text-right text-xs text-slate-400">
                    {identifier.length}/
                    {activeTabConfig.maxLength}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <LockKeyhole className="h-5 w-5" />
                  </div>

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearErrors();
                    }}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (currentValue) =>
                          !currentValue
                      )
                    }
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {visibleError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {visibleError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In

                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}