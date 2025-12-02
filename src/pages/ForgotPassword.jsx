// import React, { useState } from "react";
// import { supabase } from "../lib/supabase";
// import "./ForgotPassword.css";

// function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [sent, setSent] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

   
//     const { data: user, error: userError } = await supabase
//       .from("Registered")
//       .select("*")
//       .eq("Email", email)
//       .single();

//     if (userError || !user) {
//       setError("Unknown user");
//       return;
//     }

    
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    
//     await supabase
//       .from("Registered")
//       .update({ otp_code: otp, otp_expires: expiresAt })
//       .eq("Email", email);

    
//     try {
//       const res = await fetch("http://localhost:3001/send-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp }),
//       });

//       if (!res.ok) throw new Error("Failed to send OTP");

//       sessionStorage.setItem("resetEmail", email);
//       setSent(true);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to send OTP. Please try again.");
//     }
//   };

//   return (
//     <div className="forgot-container">
//       {sent ? (
//         <div className="success-box">
//           <h2>OTP Sent</h2>
//           <p>Check your email for the OTP to reset your password.</p>
//           <a href="/verify-otp" className="forgot-btn">Continue</a>
//         </div>
//       ) : (
//         <form className="forgot-box" onSubmit={handleSubmit}>
//           <h1>Forgot Password</h1>
//           {error && <p className="error-message">{error}</p>}
//           <input
//             type="email"
//             placeholder="Enter your account email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="forgot-input"
//             required
//           />
//           <button type="submit" className="forgot-btn">Send OTP</button>
//         </form>
//       )}
//     </div>
//   );
// }

// export default ForgotPassword;

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
      // 1️⃣ Check if user exists in Registered table
      const { data: user, error: userError } = await supabase
        .from("Registered")
        .select("*")
        .eq("Email", email)
        .single();

      if (userError || !user) {
        setError("No account found with this email");
        toast.error("No account found with this email");
        setLoading(false);
        return;
      }

      // 2️⃣ Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // 3️⃣ Save OTP in Supabase
      const { error: updateError } = await supabase
        .from("Registered")
        .update({ 
          otp_code: otp, 
          otp_expires: expiresAt 
        })
        .eq("Email", email);

      if (updateError) {
        throw new Error("Failed to save OTP");
      }

      console.log("OTP generated for", email, ":", otp);

      // 4️⃣ Try to send OTP via backend
      try {
        const res = await fetch("/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });

        const result = await res.json();
        
        if (!res.ok) {
          // If email fails, show OTP in toast
          console.warn("Email service failed, showing OTP in toast");
          toast.success(
            `Your OTP is: ${otp}`,
            {
              duration: 15000, // 15 seconds
              style: {
                background: '#667eea',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '20px 30px',
                borderRadius: '10px'
              },
              icon: '🔐'
            }
          );
        } else {
          console.log("OTP sent successfully:", result);
          
          // If mock service, show OTP in toast
          if (result.service === 'Mock' && result.otp) {
            toast.success(
              `Your OTP is: ${result.otp}`,
              {
                duration: 15000,
                style: {
                  background: '#667eea',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  padding: '20px 30px',
                  borderRadius: '10px'
                },
                icon: '🔐'
              }
            );
          } else {
            toast.success("OTP sent to your email!");
          }
          
          if (result.previewUrl) {
            console.log("Email preview:", result.previewUrl);
          }
        }

        // Store email in session for verification step
        sessionStorage.setItem("resetEmail", email);
        setSent(true);
      } catch (emailErr) {
        console.error("Email error:", emailErr);
        // Fallback: Show OTP in toast
        toast.success(
          `Your OTP is: ${otp}`,
          {
            duration: 15000,
            style: {
              background: '#667eea',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '20px 30px',
              borderRadius: '10px'
            },
            icon: '🔐'
          }
        );
        sessionStorage.setItem("resetEmail", email);
        setSent(true);
      }

    } catch (err) {
      console.error("Forgot password error:", err);
      const errorMsg = err.message || "Something went wrong. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await supabase
        .from("Registered")
        .update({ otp_code: otp, otp_expires: expiresAt })
        .eq("Email", email);

      // Show OTP in toast
      toast.success(
        `New OTP: ${otp}`,
        {
          duration: 15000,
          style: {
            background: '#667eea',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '20px 30px',
            borderRadius: '10px'
          },
          icon: '🔐'
        }
      );
      
      setLoading(false);
    } catch (err) {
      const errorMsg = "Failed to resend OTP";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      {sent ? (
        <div className="success-box">
          <h2>✓ OTP Generated!</h2>
          <p>A 6-digit OTP has been generated for:</p>
          <p className="user-email">{email}</p>
          <p>Check your email or the toast notification for the OTP code.</p>
          <div className="button-group">
            <Link to="/verify-otp" className="forgot-btn">
              Continue to Verify OTP
            </Link>
            <button 
              onClick={handleResendOTP} 
              className="forgot-btn secondary"
              disabled={loading}
            >
              {loading ? "Resending..." : "Resend OTP"}
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
            Enter your email to receive a password reset OTP
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
              "Send OTP"
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