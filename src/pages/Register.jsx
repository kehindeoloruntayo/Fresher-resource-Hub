
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = "Passwords don't match";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      const errorMsg = "Password must be at least 6 characters";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      console.log("Registering user:", formData.email);

      // 1️⃣ Sign up using Supabase Auth (password is automatically hashed)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'user'
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      if (authError) {
        console.error("Auth error:", authError);
        if (authError.message.includes('already registered')) {
          toast.error("This email is already registered");
          throw new Error("This email is already registered");
        }
        toast.error(authError.message);
        throw new Error(authError.message);
      }

      // Check if user already exists
      if (authData.user && !authData.user.identities?.length) {
        toast.error("User already exists. Please login instead.");
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // 2️⃣ Save extra user info in 'Registered' table (optional)
      if (authData.user) {
        const { error: tableError } = await supabase
          .from('Registered')
          .insert([
            {
              FullName: formData.fullName,
              Email: formData.email,
              role: 'user',
              auth_id: authData.user.id
            }
          ]);

        if (tableError) {
          console.warn("Could not save to Registered table:", tableError.message);
          // Continue anyway - auth user was created
        }
      }

      console.log("Registration successful:", authData);
      
      // Check if email confirmation is enabled
      if (authData.user?.email_confirmed_at) {
        // Email confirmation is disabled - user can login immediately
        toast.success("Registration successful! You can now login.");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        // Email confirmation is enabled
        toast.success(
          "Registration successful! Please check your email to verify your account.",
          { duration: 6000 }
        );
        setTimeout(() => navigate('/login'), 2000);
      }

    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create an Account 📝</h2>
        <p className="auth-subtext">Join the Fresher Hub community</p>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name" 
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email" 
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min. 6 characters)" 
              required 
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password" 
              required 
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;