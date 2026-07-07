import api, { getApiErrorMessage } from "../../services/api.ts";

import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "./authTypes";

import { mockLogin } from "./mockAuth";

interface CustomerLoginApiResponse {
  token: string;
  tokenType: string;
  customerId: number;
  fullName: string;
  email: string;
}

interface CorporateLoginApiResponse {
  token: string;
  tokenType: string;
  organizationId: number;
  organizationName: string;
}

const toLoginResponse = (
  data: CustomerLoginApiResponse | CorporateLoginApiResponse,
  loginType: LoginRequest["loginType"]
): LoginResponse => {
  const user: AuthUser =
    loginType === "CORPORATE"
      ? {
          id: (data as CorporateLoginApiResponse).organizationId,
          displayName: (data as CorporateLoginApiResponse)
            .organizationName,
          role: "ORGANIZATION_ADMIN",
          customerId: null,
          organizationId: (data as CorporateLoginApiResponse)
            .organizationId,
        }
      : {
          id: (data as CustomerLoginApiResponse).customerId,
          displayName: (data as CustomerLoginApiResponse).fullName,
          role: "CUSTOMER",
          customerId: (data as CustomerLoginApiResponse).customerId,
          organizationId: null,
        };

  return {
    accessToken: data.token,
    tokenType: data.tokenType,
    user,
  };
};

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  if (data.loginType === "SYSTEM_ADMIN") {
    // No backend endpoint exists yet for system-admin login.
    return mockLogin(data);
  }

  try {
    if (data.loginType === "CORPORATE") {
      const response = await api.post<CorporateLoginApiResponse>(
        "/auth/corporate-login",
        {
          taxIdentityNumber: data.identifier,
          password: data.password,
        }
      );

      return toLoginResponse(response.data, data.loginType);
    }

    const response = await api.post<CustomerLoginApiResponse>(
      "/auth/login",
      {
        tcIdentityNumber: data.identifier,
        password: data.password,
      }
    );

    return toLoginResponse(response.data, data.loginType);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Login failed. Please try again."),
      {
        cause: error,
      }
    );
  }
};
