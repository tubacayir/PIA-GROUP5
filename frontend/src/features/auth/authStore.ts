import { create } from "zustand";
import { login as loginRequest } from "./authService";
import type {
  AuthUser,
  LoginRequest,
} from "./authTypes";

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginRequest) => Promise<AuthUser>;
  logout: () => void;
  clearError: () => void;
}

const getStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem("authUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem("authUser");
    return null;
  }
};

const storedUser = getStoredUser();
const storedToken = localStorage.getItem("accessToken");

export const useAuthStore = create<AuthStore>((set) => ({
  user: storedUser,
  accessToken: storedToken,
  isAuthenticated: Boolean(storedUser && storedToken),
  isLoading: false,
  error: null,

  login: async (data) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await loginRequest(data);

      localStorage.setItem(
        "accessToken",
        response.accessToken
      );

      localStorage.setItem(
        "authUser",
        JSON.stringify(response.user)
      );

      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return response.user;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Giriş sırasında bir hata oluştu.";

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));