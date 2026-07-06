import type { LoginRequest, LoginResponse } from "./authTypes";
import { mockLogin } from "./mockAuth";

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  return mockLogin(data);
};