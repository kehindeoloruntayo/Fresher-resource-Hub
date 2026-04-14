import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import "./ForgotPassword.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      
      const { data: user, error: userError } = await supabase
        .from("Registered")
        .select("*")
        .eq("Email", email)
        .single();

      if (userError || !user) {
        const message = "We could not find an account with that email address.";
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      
      const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const res = await fetch(`${backendURL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const result = await res.json();

      
      if (!res.ok || !result.success) {
        console.error("Email service failed:", result);
        setError(result.error || "We could not send your code right now");
        toast.error("We could not send your code right now. Please try again.");
        setLoading(false);
        return;
      }

      

      
      if (result.otp) {
        // toast.success(`Your OTP is: ${result.otp}`, {
        //   duration: 20000,
        //   style: {
        //     background: "#667eea",
        //     color: "white",
        //     fontSize: "18px",
        //     fontWeight: "bold",
        //     padding: "20px 30px",
        //     borderRadius: "10px"
        //   },
        //   icon: "🔐"
        // });
      } else {
        toast.success("Your verification code has been sent to your email!");
      }

      sessionStorage.setItem("resetEmail", email);
      setSent(true);

    } catch (err) {
      console.error("Email error:", err);
      const errorMsg = err.message || "Something went wrong. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const res = await fetch(`${backendURL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const result = await res.json();

      
      if (!res.ok || !result.success) {
        toast.error(result.error || "We could not resend your code right now.");
        setLoading(false);
        return;
      }

     
      if (result.otp) {
        // toast.success(`New OTP: ${result.otp}`, {
        //   duration: 15000,
        //   style: {
        //     background: "#667eea",
        //     color: "white",
        //     fontSize: "18px",
        //     fontWeight: "bold",
        //     padding: "20px 30px",
        //     borderRadius: "10px"
        //   },
        //   icon: "🔐"
        // });
      } else {
        toast.success("A new verification code has been sent to your email!");
      }

      setLoading(false);
    } catch (err) {
      console.error("Resend error:", err);
      const errorMsg = err.message || "We could not resend your code right now.";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      {sent ? (
        <div className="success-box">
          <h2>Check your email</h2>
          <p>We sent a 6-digit verification code to:</p>
          <p className="user-email">{email}</p>
          <p>Check your email or Spam notification for the code.</p>
          <div className="button-group">
            <Link to="/verify-otp" className="forgot-btn">
              Continue to verification
            </Link>
            <button 
              onClick={handleResendOTP} 
              className="forgot-btn secondary"
              disabled={loading}
            >
              {loading ? "Resending..." : "Resend Code"}
            </button>
          </div>
          <p className="back-link">
            <Link to="/login">← Back to Login</Link>
          </p>
        </div>
      ) : (
        <form className="forgot-box" onSubmit={handleSubmit}>
          <h1>Forgot Password</h1>
          <p className="auth-subtext">
            Enter your email to receive code
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="forgot-input"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="forgot-btn primary" 
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending OTP...
              </>
            ) : (
              "Send code"
            )}
          </button>

          <div className="links">
            <Link to="/login" className="link">
              ← Back to Login
            </Link>
            <Link to="/register" className="link">
              Need an account? Register
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;