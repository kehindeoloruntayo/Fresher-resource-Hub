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

      // Get user data
      const { data: user, error: userError } = await supabase
        .from("Registered")
        .select("*")
        .eq("Email", email)
        .single();

      if (userError || !user) {
        throw new Error("Session expired. Please try again.");
      }

      // Check OTP
      if (!user.otp_code || user.otp_code !== otp) {
        throw new Error("Invalid OTP code");
      }

      // Check expiry
      const now = new Date();
      const expiryDate = new Date(user.otp_expires);
      
      if (now > expiryDate) {
        throw new Error("OTP has expired. Please request a new one.");
      }

      // OTP valid, navigate to reset password
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

      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Update in database
      await supabase
        .from("Registered")
        .update({ 
          otp_code: newOtp, 
          otp_expires: expiresAt 
        })
        .eq("Email", email);

      // Send new OTP
      await fetch("http://localhost:3001/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: newOtp }),
      });

      alert("New OTP sent to your email!");
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