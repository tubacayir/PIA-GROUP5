import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "./authStore";
import type { LoginType, UserRole } from "./authTypes";

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
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [loginType, setLoginType] =
    useState<LoginType>("INDIVIDUAL");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const loggedInUser = await login({
        loginType,
        identifier,
        password,
      });

      navigate(getHomePath(loggedInUser.role), {
        replace: true,
      });
    } catch {
      
    }
  };

  const getIdentifierLabel = () => {
    if (loginType === "INDIVIDUAL") {
      return "T.C. Kimlik Numarası";
    }

    if (loginType === "CORPORATE") {
      return "Vergi Kimlik Numarası";
    }

    return "E-posta";
  };

  return (
    <div>
      <h1>Giriş Yap</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="loginType">Giriş tipi</label>

          <select
            id="loginType"
            value={loginType}
            onChange={(event) => {
              setLoginType(event.target.value as LoginType);
              setIdentifier("");
              clearError();
            }}
          >
            <option value="INDIVIDUAL">Bireysel</option>
            <option value="CORPORATE">Kurumsal</option>
            <option value="SYSTEM_ADMIN">Sistem Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="identifier">
            {getIdentifierLabel()}
          </label>

          <input
            id="identifier"
            type={
              loginType === "SYSTEM_ADMIN"
                ? "email"
                : "text"
            }
            inputMode={
              loginType === "SYSTEM_ADMIN"
                ? undefined
                : "numeric"
            }
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              clearError();
            }}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Şifre</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearError();
            }}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}