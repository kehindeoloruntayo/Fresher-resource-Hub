import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import bcrypt from 'bcryptjs';

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
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(formData.password, saltRounds);

      // Insert into Registered table with hashed password
      const { data, error } = await supabase
        .from('Registered')
        .insert([
          {
            FullName: formData.fullName,
            Email: formData.email,
            Password: hashedPassword, // Store the hashed password
            role: 'user' // Default role
          }
        ])
        .select();

      if (error) throw error;

      alert('Registration successful! You can now login.');
      navigate('/login');

    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
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