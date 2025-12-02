import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1️⃣ Check if user exists
    const { data: user, error: userError } = await supabase
      .from("Registered")
      .select("*")
      .eq("Email", email)
      .single();

    if (userError || !user) {
      setError("Unknown user");
      return;
    }

    // 2️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 3️⃣ Save OTP in Supabase
    await supabase
      .from("Registered")
      .update({ otp_code: otp, otp_expires: expiresAt })
      .eq("Email", email);

    // 4️⃣ Send OTP via backend
    try {
      const res = await fetch("http://localhost:3001/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) throw new Error("Failed to send OTP");

      sessionStorage.setItem("resetEmail", email);
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Please try again.");
    }
  };

  return (
    <div className="forgot-container">
      {sent ? (
        <div className="success-box">
          <h2>OTP Sent</h2>
          <p>Check your email for the OTP to reset your password.</p>
          <a href="/verify-otp" className="forgot-btn">Continue</a>
        </div>
      ) : (
        <form className="forgot-box" onSubmit={handleSubmit}>
          <h1>Forgot Password</h1>
          {error && <p className="error-message">{error}</p>}
          <input
            type="email"
            placeholder="Enter your account email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="forgot-input"
            required
          />
          <button type="submit" className="forgot-btn">Send OTP</button>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
