import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { auth, hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f5f8]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
      </div>
    );
  }

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && auth.user?.role?.name !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (
    requiredPermission &&
    (!auth.user || !hasPermission(...requiredPermission))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
