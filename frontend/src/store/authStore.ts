import { create } from "zustand";

export type LoginType = "customer" | "corporate" | "admin";

export const AUTH_TOKEN_KEY = "auth_token";

interface AuthenticatedCustomer {
  customerId: number;
  customerNumber: string;
  fullName: string;
  email: string;
}

interface AuthSession {
  token: string;
  customer: AuthenticatedCustomer;
}

interface AuthStore {
  isLoggedIn: boolean;
  loginType: LoginType | null;
  token: string | null;
  customer: AuthenticatedCustomer | null;
  login: (type: LoginType, session?: AuthSession) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: !!storedToken,
  loginType: storedToken ? "customer" : null,
  token: storedToken,
  customer: null,
  login: (type, session) => {
    if (session) {
      localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    }
    set({
      isLoggedIn: true,
      loginType: type,
      token: session?.token ?? null,
      customer: session?.customer ?? null,
    });
  },
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    set({ isLoggedIn: false, loginType: null, token: null, customer: null });
  },
}));
