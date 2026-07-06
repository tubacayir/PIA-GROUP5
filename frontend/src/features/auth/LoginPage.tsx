import { useState, type FormEvent } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "./authStore";

import type {
  LoginType,
  UserRole,
} from "./authTypes";

const TABS: {
  key: LoginType;
  label: string;
  idLabel: string;
  idPlaceholder: string;
  maxLength: number;
  numericOnly: boolean;
}[] = [
  {
    key: "INDIVIDUAL",
    label: "Customer",
    idLabel: "Turkish ID Number",
    idPlaceholder: "11-digit ID number",
    maxLength: 11,
    numericOnly: true,
  },
  {
    key: "CORPORATE",
    label: "Corporate",
    idLabel: "Tax Identification Number",
    idPlaceholder: "10-digit tax ID",
    maxLength: 10,
    numericOnly: true,
  },
  {
    key: "SYSTEM_ADMIN",
    label: "System Admin",
    idLabel: "E-mail Address",
    idPlaceholder: "admin@example.com",
    maxLength: 100,
    numericOnly: false,
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

export default function LoginPage() {
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

  const [activeTab, setActiveTab] =
    useState<LoginType>("INDIVIDUAL");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const tab = TABS.find(
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

  const switchTab = (key: LoginType) => {
    setActiveTab(key);
    setIdentifier("");
    setPassword("");
    setShowPassword(false);
    clearError();
  };

  const handleIdentifierChange = (value: string) => {
    clearError();

    if (tab.numericOnly) {
      setIdentifier(
        value
          .replace(/\D/g, "")
          .slice(0, tab.maxLength)
      );

      return;
    }

    setIdentifier(value.slice(0, tab.maxLength));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      const loggedInUser = await login({
        loginType: activeTab,
        identifier,
        password,
      });

      navigate(
        getHomePath(loggedInUser.role),
        {
          replace: true,
        }
      );
    } catch {
      // Hata mesajını authStore yönetiyor.
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Invoice Management System
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => switchTab(item.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === item.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-8 flex flex-col gap-4"
          >
            <label className="flex flex-col text-sm gap-1">
              <span className="font-medium text-gray-700">
                {tab.idLabel}
              </span>

              <input
                className="border border-gray-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                type={
                  activeTab === "SYSTEM_ADMIN"
                    ? "email"
                    : "text"
                }
                inputMode={
                  tab.numericOnly
                    ? "numeric"
                    : "email"
                }
                maxLength={tab.maxLength}
                value={identifier}
                onChange={(event) =>
                  handleIdentifierChange(
                    event.target.value
                  )
                }
                placeholder={tab.idPlaceholder}
                required
              />
            </label>

            <label className="flex flex-col text-sm gap-1">
              <span className="font-medium text-gray-700">
                Password
              </span>

              <div className="relative">
                <input
                  className="border border-gray-300 p-2.5 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError();
                  }}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white py-2.5 rounded font-medium hover:bg-blue-700 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Signing in..."
                : "Sign In"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Forgot your password? Contact your
              system administrator.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}