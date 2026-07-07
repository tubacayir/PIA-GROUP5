import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "../types/entities";

export type LoginType = UserRole;

interface AuthStore {
  isLoggedIn: boolean;
  loginType: LoginType | null;
  // UI-only placeholder. Real authentication will be handled by the backend.
  login: (type: LoginType) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      loginType: null,
      login: (type) => set({ isLoggedIn: true, loginType: type }),
      logout: () => set({ isLoggedIn: false, loginType: null }),
    }),
    { name: "auth-storage" }
  )
);
