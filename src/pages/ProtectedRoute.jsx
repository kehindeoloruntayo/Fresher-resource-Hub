import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function ProtectedRoute({ children, requireAdmin = false }) {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsAuthenticated(false);
          setIsValidating(false);
          return;
        }

        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setIsAuthenticated(true);
          setUserRole(userData.role);
          setIsValidating(false);
          return;
        }

        const { data: userData, error } = await supabase
          .from("Registered")
          .select("role, FullName, Email")
          .eq("Email", session.user.email)
          .single();

        if (error || !userData) {
          console.error("User not found in database:", error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
          setUserRole(userData.role);

          sessionStorage.setItem(
            "user",
            JSON.stringify({
              id: session.user.id,
              FullName: userData.FullName,
              Email: userData.Email,
              role: userData.role,
            })
          );
        }
      } catch (error) {
        console.error("Auth validation error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    checkAuth();
  }, []);

  if (isValidating) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;