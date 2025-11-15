import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import bcrypt from 'bcryptjs';

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login for:", formData.email);

      const { data: userData, error: userError } = await supabase
        .from('Registered')
        .select('*')
        .eq('Email', formData.email)
        .single();

      if (userError || !userData) {
        console.log("No user found or error:", userError);
        throw new Error("Invalid email or password");
      }

      console.log("User found, verifying password...");

      
      const isPasswordValid = await bcrypt.compare(formData.password, userData.Password);
      
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      console.log("Password verified successfully");

      
      const userSession = {
        id: userData.id,
        FullName: userData.FullName,
        Email: userData.Email,
        role: userData.role
      };

      sessionStorage.setItem("user", JSON.stringify(userSession));
      
      if (userData.role === 'admin') {
        sessionStorage.setItem("admin", "true");
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back 👋</h2>
        <p className="auth-subtext">Login to your Fresher Hub account</p>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password" 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;