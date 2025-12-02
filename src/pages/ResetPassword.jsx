import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import "./ForgotPassword.css";
import bcrypt from "bcryptjs";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to send confirmation email
  const sendConfirmationEmail = async (email) => {
    try {
      await fetch("http://localhost:3001/send-reset-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
      // Don't show error to user - this is just a notification
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const email = sessionStorage.getItem("resetEmail");
      if (!email) {
        throw new Error("Session expired. Please start the process again.");
      }

      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update password in Supabase and clear OTP
      const { error: updateError } = await supabase
        .from("Registered")
        .update({ 
          Password: hashedPassword, 
          otp_code: null, 
          otp_expires: null 
        })
        .eq("Email", email);

      if (updateError) throw updateError;

      // Send confirmation email
      await sendConfirmationEmail(email);

      // Clear session and show success
      sessionStorage.removeItem("resetEmail");
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-container">
        <div className="success-box">
          <h2>Password Reset Successful ✅</h2>
          <p>You can now log in with your new password.</p>
          <p>A confirmation email has been sent to your inbox.</p>
          <a href="/login" className="forgot-btn">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-container">
      <form className="forgot-box" onSubmit={handleReset}>
        <h1>Reset Password</h1>
        {error && <p className="error-message">{error}</p>}

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="forgot-input"
          required
          minLength={6}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="forgot-input"
          required
          minLength={6}
        />

        <button type="submit" className="forgot-btn" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;