import { create } from "zustand";

export type LoginType = "customer" | "corporate" | "admin";

interface AuthStore {
  isLoggedIn: boolean;
  loginType: LoginType | null;
  // UI-only placeholder. Real authentication will be handled by the backend.
  login: (type: LoginType) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  loginType: null,
  login: (type) => set({ isLoggedIn: true, loginType: type }),
  logout: () => set({ isLoggedIn: false, loginType: null }),
}));