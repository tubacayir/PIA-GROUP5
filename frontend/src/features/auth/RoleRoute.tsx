import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./authStore";
import type { UserRole } from "./authTypes";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export default function RoleRoute({
  allowedRoles,
}: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}