import api, { getApiErrorMessage } from "../../services/api";

import type { LoginRequest, LoginResponse } from "./authTypes";

import { mockLogin } from "./mockAuth";

const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH !== "false";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  if (useMockAuth) {
    return mockLogin(data);
  }

  try {
    if (data.loginType === "INDIVIDUAL") {
      const response = await api.post<{
        token: string;
        tokenType: string;
        customerId: number;
        fullName: string;
        email: string;
      }>("/auth/login", {
        tcIdentityNumber: data.identifier,
        password: data.password,
      });

      return {
        accessToken: response.data.token,
        tokenType: response.data.tokenType,
        user: {
          id: response.data.customerId,
          displayName: response.data.fullName,
          role: "CUSTOMER",
          customerId: response.data.customerId,
          organizationId: null,
        },
      };
    }

    if (data.loginType === "CORPORATE") {
      const response = await api.post<{
        token: string;
        tokenType: string;
        organizationId: number;
        organizationName: string;
      }>("/auth/corporate-login", {
        taxIdentityNumber: data.identifier,
        password: data.password,
      });

      return {
        accessToken: response.data.token,
        tokenType: response.data.tokenType,
        user: {
          id: response.data.organizationId,
          displayName: response.data.organizationName,
          role: "ORGANIZATION_ADMIN",
          customerId: null,
          organizationId: response.data.organizationId,
        },
      };
    }

    // SYSTEM_ADMIN — mock login (no backend endpoint yet)
    return mockLogin(data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Login failed. Please try again."),
      { cause: error }
    );
  }
};