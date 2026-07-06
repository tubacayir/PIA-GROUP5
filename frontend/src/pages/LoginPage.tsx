import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";
import { useAuthStore, type LoginType } from "../store/authStore";

interface LoginResponse {
  token: string;
  tokenType: string;
  customerId: number;
  customerNumber: string;
  fullName: string;
  email: string;
}

// Tab configuration: label, input field label, placeholder and input rules per login type
const TABS: {
  key: LoginType;
  label: string;
  idLabel: string;
  idPlaceholder: string;
  maxLength: number;
  numericOnly: boolean;
}[] = [
  {
    key: "customer",
    label: "Customer",
    idLabel: "Turkish ID Number",
    idPlaceholder: "11-digit ID number",
    maxLength: 11,
    numericOnly: true,
  },
  {
    key: "corporate",
    label: "Corporate",
    idLabel: "Tax Identification Number",
    idPlaceholder: "10-digit tax ID",
    maxLength: 10,
    numericOnly: true,
  },
  {
    key: "admin",
    label: "System Admin",
    idLabel: "E-mail Address",
    idPlaceholder: "admin@example.com",
    maxLength: 100,
    numericOnly: false,
  },
];

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<LoginType>("customer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tab = TABS.find((t) => t.key === activeTab)!;

  function switchTab(key: LoginType) {
    setActiveTab(key);
    // Reset fields when switching tabs so values don't leak between login types
    setIdentifier("");
    setPassword("");
    setShowPassword(false);
    setError(null);
  }

  function handleIdentifierChange(value: string) {
    if (tab.numericOnly) {
      setIdentifier(value.replace(/\D/g, "").slice(0, tab.maxLength));
    } else {
      setIdentifier(value.slice(0, tab.maxLength));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (activeTab !== "customer") {
      setError("Bu giriş türü henüz aktif değil.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        tcIdentityNumber: identifier,
        password,
      });
      login(activeTab, {
        token: data.token,
        customer: {
          customerId: data.customerId,
          customerNumber: data.customerNumber,
          fullName: data.fullName,
          email: data.email,
        },
      });
      navigate("/");
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Giriş yapılamadı. Lütfen tekrar deneyin.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Invoice Management System
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab buttons */}
          <div className="flex border-b">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => switchTab(t.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === t.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-4">
            <label className="flex flex-col text-sm gap-1">
              <span className="font-medium text-gray-700">{tab.idLabel}</span>
              <input
                className="border border-gray-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                type={activeTab === "admin" ? "email" : "text"}
                inputMode={tab.numericOnly ? "numeric" : "email"}
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                placeholder={tab.idPlaceholder}
                required
              />
            </label>

            <label className="flex flex-col text-sm gap-1">
              <span className="font-medium text-gray-700">Password</span>
              <div className="relative">
                <input
                  className="border border-gray-300 p-2.5 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white py-2.5 rounded font-medium hover:bg-blue-700 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Forgot your password? Contact your system administrator.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}