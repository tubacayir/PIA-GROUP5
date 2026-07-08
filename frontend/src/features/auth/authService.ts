import api, { getApiErrorMessage } from "../../services/api.ts";

import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "./authTypes";

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

interface AdminLoginApiResponse {
  token: string;
  tokenType: string;
  adminId: number;
  fullName: string;
  canCreateInvoices: boolean;
}

type AnyLoginApiResponse =
  | CustomerLoginApiResponse
  | CorporateLoginApiResponse
  | AdminLoginApiResponse;

const toLoginResponse = (
  data: AnyLoginApiResponse,
  loginType: LoginRequest["loginType"]
): LoginResponse => {
  let user: AuthUser;

  if (loginType === "CORPORATE") {
    const corporate = data as CorporateLoginApiResponse;
    user = {
      id: corporate.organizationId,
      displayName: corporate.organizationName,
      role: "ORGANIZATION_ADMIN",
      customerId: null,
      organizationId: corporate.organizationId,
    };
  } else if (loginType === "SYSTEM_ADMIN") {
    const admin = data as AdminLoginApiResponse;
    user = {
      id: admin.adminId,
      displayName: admin.fullName,
      role: "SYSTEM_ADMIN",
      customerId: null,
      organizationId: null,
    };
  } else {
    const customer = data as CustomerLoginApiResponse;
    user = {
      id: customer.customerId,
      displayName: customer.fullName,
      role: "CUSTOMER",
      customerId: customer.customerId,
      organizationId: null,
    };
  }

  return {
    accessToken: data.token,
    tokenType: data.tokenType,
    user,
  };
};

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
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

    if (data.loginType === "SYSTEM_ADMIN") {
      const response = await api.post<AdminLoginApiResponse>(
        "/auth/admin-login",
        {
          email: data.identifier,
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
