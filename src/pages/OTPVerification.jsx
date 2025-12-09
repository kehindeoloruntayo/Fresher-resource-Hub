import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ForgotPassword.css";

function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const verifyOTP = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const email = sessionStorage.getItem("resetEmail");
    if (!email) {
      navigate("/forgot-password");
      return;
    }

    
    const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    
    const res = await fetch(`${backendURL}/api/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const result = await res.json();
    
    if (!res.ok || !result.success) {
      throw new Error(result.error || "Invalid OTP");
    }

    
    console.log("✅ OTP verified:", result);
    navigate("/reset-password");
    
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

const handleResendOTP = async () => {
  try {
    const email = sessionStorage.getItem("resetEmail");
    if (!email) {
      navigate("/forgot-password");
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
      throw new Error(result.error || "Failed to resend OTP");
    }

    if (result.otp) {
      alert(`New OTP: ${result.otp}`); 
    } else {
      alert("New OTP sent to your email!");
    }
    
  } catch (err) {
    console.error("Failed to resend OTP:", err);
    setError("Failed to resend OTP. Please try again.");
  }

  };

  return (
    <div className="forgot-container">
      <form className="forgot-box" onSubmit={verifyOTP}>
        <h1>Verify OTP</h1>
        <p className="auth-subtext">Enter the 6-digit code sent to your email</p>
        
        {error && <p className="error-message">{error}</p>}
        
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="forgot-input"
          required
          pattern="\d{6}"
          inputMode="numeric"
        />
        
        <div className="otp-hint">
          <p>Didn't receive the code?</p>
          <button 
            type="button" 
            onClick={handleResendOTP}
            className="resend-link"
            disabled={loading}
          >
            Resend OTP
          </button>
        </div>

        <button type="submit" className="forgot-btn" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>
    </div>
  );
}

export default OTPVerification;
