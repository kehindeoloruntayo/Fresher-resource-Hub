import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Navbar from "./components/Navbar";
import NavbarUser from "./components/NavbarUser";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AdminPanel from "./pages/AdminPanel";
import AdminAccess from "./pages/AdminAccess";
import ResourceDetail from "./pages/ResourceDetail";
import Resources from "./pages/Resources";
import Pending from "./pages/Pending";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OTPVerification from "./pages/OTPVerification";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./pages/ProtectedRoute";
import NavbarAdmin from "./components/NavbarAdmin";

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      if (session) {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUserRole(userData.role);
        } else {
          try {
            const { data: userData } = await supabase
              .from("Registered")
              .select("role")
              .eq("Email", session.user.email)
              .single();

            if (userData) {
              setUserRole(userData.role);
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
          }
        }
      }

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session) {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUserRole(userData.role);
        }
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderNavbar = () => {
    if (!session) {
      return <Navbar />;
    }

    if (userRole === "admin") {
      return <NavbarAdmin />;
    } else {
      return <NavbarUser />;
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      {renderNavbar()}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="app-shell">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin-access" element={<AdminAccess />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resource/:id" element={<ResourceDetail />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            {/* Protected routes (require authentication) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pending"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Pending />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
