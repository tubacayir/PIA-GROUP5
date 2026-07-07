import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "./authStore";

export default function LogoutPage() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/login" replace />;
}