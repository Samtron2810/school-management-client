import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children || <Outlet />;
}
