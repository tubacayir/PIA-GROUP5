import api, {
    getApiErrorMessage,
  } from "../../services/api";
  
  import type {
    LoginRequest,
    LoginResponse,
  } from "./authTypes";
  
  import { mockLogin } from "./mockAuth";
  
  const useMockAuth =
    import.meta.env.VITE_USE_MOCK_AUTH !== "false";
  
  const authLoginEndpoint =
    import.meta.env.VITE_AUTH_LOGIN_ENDPOINT;
  
  export const login = async (
    data: LoginRequest
  ): Promise<LoginResponse> => {
    if (useMockAuth) {
      return mockLogin(data);
    }
  
    if (!authLoginEndpoint) {
      throw new Error(
        "Backend login endpoint is not configured."
      );
    }
  
    try {
      const response = await api.post<LoginResponse>(
        authLoginEndpoint,
        data
      );
  
      return response.data;
    } catch (error) {
        throw new Error(
          getApiErrorMessage(
            error,
            "Login failed. Please try again."
          ),
          {
            cause: error,
          }
        );
      } 
  }