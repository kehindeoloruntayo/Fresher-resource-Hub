


import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import NavbarUser from "./components/NavbarUser";
import NavbarAdmin from "./components/NavbarAdmin";
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

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';


function AppContent() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  useEffect(() => {
    
    checkSession();
    
    const intervalId = setInterval(checkSession, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  
  const checkSession = async () => {
    
    
    try {
      const storedUser = sessionStorage.getItem("user");
      
      
      if (!storedUser) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      const userData = JSON.parse(storedUser);
      
      
      
      if (userData.sessionId) {
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/validate-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: userData.sessionId })
          });

         
          
          if (response.ok) {
            const { success, user: validatedUser } = await response.json();
           
            
            if (success) {
             
              setUser({
                ...userData,
                ...validatedUser
              });
              setUserRole(validatedUser.role);
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.log("❌ Session validation failed:", error.message);
        }
      }

      
      if (userData.expiresAt && Date.now() > userData.expiresAt) {
       
        
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("admin");
        setUser(null);
        setUserRole(null);
      } else {
        
        console.log('✅ Using stored session');
        setUser(userData);
        setUserRole(userData.role);
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Error checking session:", error);
      setUser(null);
      setUserRole(null);
      setLoading(false);
    }
  };

 
  const handleLogout = async () => {
    
    
    try {
      const storedUser = sessionStorage.getItem("user");
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        
        if (userData.sessionId) {
          await fetch(`${API_BASE_URL}/api/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: userData.sessionId })
          }).catch(error => {
            console.log("Logout API call failed:", error);
            
          });
        }
      }
      
     
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("admin");
      
     
      setUser(null);
      setUserRole(null);
      
      
      
      navigate("/");
      
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderNavbar = () => {
    
    
    if (!user) {
     
      return <Navbar />;
    }

    if (userRole === "admin") {
      
      return <NavbarAdmin user={user} onLogout={handleLogout} />;
    } else {
      
      return <NavbarUser user={user} onLogout={handleLogout} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
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
            <Route path="/login" element={<Login setUser={setUser} setUserRole={setUserRole} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resource/:id" element={<ResourceDetail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin-access" element={<AdminAccess />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user} userRole={userRole}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute user={user} userRole={userRole}>
                  <Upload />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user} userRole={userRole} requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
  path="/pending"
  element={
    <ProtectedRoute user={user} userRole={userRole}>
      <Pending />
    </ProtectedRoute>
  }
/>
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;