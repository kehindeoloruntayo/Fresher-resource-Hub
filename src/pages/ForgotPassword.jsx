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


// import React, { useState } from "react";
// import { supabase } from "../lib/supabase";
// import "./ForgotPassword.css";
// import { Link } from "react-router-dom";

// function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [sent, setSent] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       // 1️⃣ Check if user exists in Registered table
//       const { data: user, error: userError } = await supabase
//         .from("Registered")
//         .select("*")
//         .eq("Email", email)
//         .single();

//       if (userError || !user) {
//         setError("No account found with this email");
//         setLoading(false);
//         return;
//       }

//       // 2️⃣ Generate OTP
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
//       const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

//       // 3️⃣ Save OTP in Supabase
//       const { error: updateError } = await supabase
//         .from("Registered")
//         .update({ 
//           otp_code: otp, 
//           otp_expires: expiresAt 
//         })
//         .eq("Email", email);

//       if (updateError) {
//         throw new Error("Failed to save OTP");
//       }

//       console.log("OTP generated for", email, ":", otp);

//       // 4️⃣ Try to send OTP via backend
//       try {
//         // const res = await fetch("http://localhost:3001/send-otp", {
//         //   method: "POST",
//         //   headers: { "Content-Type": "application/json" },
//         //   body: JSON.stringify({ email, otp }),
//         // });
//         const res = await fetch("/api/send-otp", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ email, otp }),
// });

//         const result = await res.json();
        
//         if (!res.ok) {
//           // If email fails, fallback to showing OTP
//           console.warn("Email service failed, showing OTP in alert");
//           alert(`🔐 TEST OTP for ${email}: ${otp}\n\n(In production, this would be emailed)`);
//         } else {
//           console.log("OTP sent successfully:", result);
//           if (result.previewUrl) {
//             console.log("Email preview:", result.previewUrl);
//           }
//         }

//         // Store email in session for verification step
//         sessionStorage.setItem("resetEmail", email);
//         setSent(true);
//       } catch (emailErr) {
//         console.error("Email error:", emailErr);
//         // Fallback: Show OTP for testing
//         alert(`🔐 TEST OTP for ${email}: ${otp}\n\n(Email service offline for testing)`);
//         sessionStorage.setItem("resetEmail", email);
//         setSent(true);
//       }

//     } catch (err) {
//       console.error("Forgot password error:", err);
//       setError(err.message || "Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Resend OTP function
//   const handleResendOTP = async () => {
//     setError("");
//     setLoading(true);
    
//     try {
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
//       const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

//       await supabase
//         .from("Registered")
//         .update({ otp_code: otp, otp_expires: expiresAt })
//         .eq("Email", email);

//       alert(`New OTP for ${email}: ${otp}`);
//       setLoading(false);
//     } catch (err) {
//       setError("Failed to resend OTP");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="forgot-container">
//       {sent ? (
//         <div className="success-box">
//           <h2>✓ OTP Generated!</h2>
//           <p>A 6-digit OTP has been generated for:</p>
//           <p className="user-email">{email}</p>
//           <p>Check your email for the OTP code.</p>
//           <p className="test-note">
//             <strong>Testing:</strong> If you didn't receive an email, 
//             check the browser alert for the OTP.
//           </p>
//           <div className="button-group">
//             <Link to="/verify-otp" className="forgot-btn">
//               Continue to Verify OTP
//             </Link>
//             <button 
//               onClick={handleResendOTP} 
//               className="forgot-btn secondary"
//               disabled={loading}
//             >
//               {loading ? "Resending..." : "Resend OTP"}
//             </button>
//           </div>
//           <p className="back-link">
//             <Link to="/login">← Back to Login</Link>
//           </p>
//         </div>
//       ) : (
//         <form className="forgot-box" onSubmit={handleSubmit}>
//           <h1>Forgot Password</h1>
//           <p className="auth-subtext">
//             Enter your email to receive a password reset OTP
//           </p>
          
//           {error && <div className="error-message">{error}</div>}
          
//           <div className="form-group">
//             <label htmlFor="email">Email Address</label>
//             <input
//               id="email"
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="forgot-input"
//               required
//               disabled={loading}
//             />
//           </div>
          
//           <button 
//             type="submit" 
//             className="forgot-btn primary" 
//             disabled={loading || !email}
//           >
//             {loading ? (
//               <>
//                 <span className="spinner"></span>
//                 Sending OTP...
//               </>
//             ) : (
//               "Send OTP"
//             )}
//           </button>
          
//           <div className="links">
//             <Link to="/login" className="link">
//               ← Back to Login
//             </Link>
//             <Link to="/register" className="link">
//               Need an account? Register
//             </Link>
//           </div>
          
//           <p className="test-note">
//             <strong>Note for testing:</strong> OTP will be shown in alert if email service fails.
//           </p>
//         </form>
//       )}
//     </div>
//   );
// }

// export default ForgotPassword;




import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      // Check if user exists
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (userError || !users) {
        toast.error('No account found with this email');
        setLoading(false);
        return;
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Store OTP in database
      const { error: otpError } = await supabase
        .from('password_reset_otps')
        .insert([
          {
            email,
            otp,
            expires_at: expiresAt,
            used: false
          }
        ]);

      if (otpError) throw otpError;

      // Send OTP via API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const result = await response.json();

      if (result.success) {
        // If mock service, show OTP in toast
        if (result.service === 'Mock' && result.otp) {
          toast.success(
            `Your OTP is: ${result.otp}`,
            {
              duration: 15000, // Show for 15 seconds
              style: {
                background: '#667eea',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '16px 24px'
              },
              icon: '🔐'
            }
          );
        } else {
          toast.success('OTP sent to your email!');
        }

        // Navigate to verification page
        setTimeout(() => {
          navigate('/verify-otp', { state: { email } });
        }, 1000);
      } else {
        toast.error(result.error || 'Failed to send OTP');
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">No worries, we'll send you reset instructions</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </span>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-2 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}