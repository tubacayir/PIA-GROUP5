import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type LoginType } from "../store/authStore";

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
    key: "Customer",
    label: "Customer",
    idLabel: "Turkish ID Number",
    idPlaceholder: "11-digit ID number",
    maxLength: 11,
    numericOnly: true,
  },
  {
    key: "OrganizationAdmin",
    label: "Corporate",
    idLabel: "Tax Identification Number",
    idPlaceholder: "10-digit tax ID",
    maxLength: 10,
    numericOnly: true,
  },
  {
    key: "SystemAdmin",
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

  const [activeTab, setActiveTab] = useState<LoginType>("Customer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const tab = TABS.find((t) => t.key === activeTab)!;

  function switchTab(key: LoginType) {
    setActiveTab(key);
    // Reset fields when switching tabs so values don't leak between login types
    setIdentifier("");
    setPassword("");
    setShowPassword(false);
  }

  function handleIdentifierChange(value: string) {
    if (tab.numericOnly) {
      setIdentifier(value.replace(/\D/g, "").slice(0, tab.maxLength));
    } else {
      setIdentifier(value.slice(0, tab.maxLength));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: replace with real backend authentication call.
    // For now this only marks the user as "logged in" so the app flow can be tested.
    login(activeTab);
    navigate("/");
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
                type={activeTab === "SystemAdmin" ? "email" : "text"}
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

            <button
              type="submit"
              className="bg-blue-600 text-white py-2.5 rounded font-medium hover:bg-blue-700 transition-colors mt-2"
            >
              Sign In
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