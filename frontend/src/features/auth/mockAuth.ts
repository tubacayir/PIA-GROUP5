import type { LoginRequest, LoginResponse } from "./authTypes";

const mockUsers = [
  {
    loginType: "INDIVIDUAL",
    identifier: "11111111111",
    password: "123456",
    response: {
      accessToken: "mock-customer-token",
      tokenType: "Bearer",
      user: {
        id: 1,
        displayName: "Bireysel Kullanıcı",
        role: "CUSTOMER",
        customerId: 1,
        organizationId: null,
      },
    },
  },
  {
    loginType: "CORPORATE",
    identifier: "2222222222",
    password: "123456",
    response: {
      accessToken: "mock-organization-token",
      tokenType: "Bearer",
      user: {
        id: 2,
        displayName: "Kurumsal Kullanıcı",
        role: "ORGANIZATION_ADMIN",
        customerId: null,
        organizationId: 1,
      },
    },
  },
  {
    loginType: "SYSTEM_ADMIN",
    identifier: "admin@test.com",
    password: "123456",
    response: {
      accessToken: "mock-system-admin-token",
      tokenType: "Bearer",
      user: {
        id: 3,
        displayName: "System Admin",
        role: "SYSTEM_ADMIN",
        customerId: null,
        organizationId: null,
      },
    },
  },
] satisfies Array<{
  loginType: LoginRequest["loginType"];
  identifier: string;
  password: string;
  response: LoginResponse;
}>;

export const mockLogin = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const foundUser = mockUsers.find(
    (user) =>
      user.loginType === data.loginType &&
      user.identifier === data.identifier &&
      user.password === data.password
  );

  if (!foundUser) {
    throw new Error("Kimlik bilgileri hatalı.");
  }

  return foundUser.response;
};