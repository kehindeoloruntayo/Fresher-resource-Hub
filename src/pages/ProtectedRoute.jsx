import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, user, userRole, requireAdmin = false }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  
  if (requireAdmin && userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;