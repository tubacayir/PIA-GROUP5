export type LoginType =
  | "INDIVIDUAL"
  | "CORPORATE"
  | "SYSTEM_ADMIN";

export type UserRole =
  | "CUSTOMER"
  | "ORGANIZATION_ADMIN"
  | "SYSTEM_ADMIN";

export interface LoginRequest {
  loginType: LoginType;
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: number;
  displayName: string;
  role: UserRole;
  customerId: number | null;
  organizationId: number | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}