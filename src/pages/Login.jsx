// import "./Login.css";
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { supabase } from "../lib/supabase";
// import bcrypt from "bcryptjs";

// function Login() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       console.log("Attempting login for:", formData.email);

//       const { data: userData, error: userError } = await supabase
//         .from("Registered")
//         .select("*")
//         .eq("Email", formData.email)
//         .single();

//       if (userError || !userData) {
//         console.log("No user found or error:", userError);
//         throw new Error("Invalid email or password");
//       }

//       console.log("User found, verifying password...");

       
//       const isPasswordValid = await bcrypt.compare(
//         formData.password,
//         userData.Password
//       );

//       if (!isPasswordValid) {
//         throw new Error("Invalid email or password");
//       }

//       console.log("Password verified successfully");

      
//       const userSession = {
//         id: userData.id,
//         FullName: userData.FullName,
//         Email: userData.Email,
//         role: userData.role
//       };

//       sessionStorage.setItem("user", JSON.stringify(userSession));
      
//       if (userData.role === 'admin') {
//         sessionStorage.setItem("admin", "true");
//         navigate("/admin");
//       } else {
//         navigate("/dashboard");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>Welcome Back 👋</h2>
//         <p className="auth-subtext">Login to your Fresher Hub account</p>

//         {error && <div className="error-message">{error}</div>}

//         <form className="auth-form" onSubmit={handleLogin}>
//           <div className="form-group">
//             <label>Email</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter your email"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Password</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter your password"
//               required
//             />
//           </div>

//           <button type="submit" className="auth-btn" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="auth-footer">
//           Don't have an account? <Link to="/register">Register</Link>
//         </p>
//         <p className="forgot-password">
//           <Link to="/forgot-password">Forgot Password?</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;



// // src/pages/Login.jsx
// import "./login.css";
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { supabase } from "../lib/supabase";
// import toast from "react-hot-toast";

// function Login() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       console.log("Attempting login for:", formData.email);

//       // Use Supabase Auth for login (handles password verification)
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       });

//       if (error) {
//         console.log("Login error:", error);
        
//         // Show user-friendly error messages
//         if (error.message.includes("Email not confirmed")) {
//           toast.error("Please verify your email before logging in. Check your inbox.");
//           setError("Email not verified. Please check your email inbox.");
//         } else if (error.message.includes("Invalid")) {
//           toast.error("Invalid email or password");
//           setError("Invalid email or password");
//         } else {
//           toast.error(error.message);
//           setError(error.message);
//         }
        
//         setLoading(false);
//         return;
//       }

//       console.log("Login successful:", data.user);
//       toast.success("Login successful!");

//       // Get additional user info from your Registered table
//       const { data: userData, error: userError } = await supabase
//         .from("Registered")
//         .select("*")
//         .eq("Email", formData.email)
//         .single();

//       // Create user session
//       const userSession = {
//         id: data.user.id,
//         FullName: userData?.FullName || data.user.user_metadata?.full_name,
//         Email: data.user.email,
//         role: userData?.role || data.user.user_metadata?.role || 'user'
//       };

//       sessionStorage.setItem("user", JSON.stringify(userSession));
      
//       // Navigate based on role
//       if (userSession.role === 'admin') {
//         sessionStorage.setItem("admin", "true");
//         navigate("/admin");
//       } else {
//         navigate("/dashboard");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error("An error occurred. Please try again.");
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>Welcome Back 👋</h2>
//         <p className="auth-subtext">Login to your Fresher Hub account</p>

//         {error && <div className="error-message">{error}</div>}

//         <form className="auth-form" onSubmit={handleLogin}>
//           <div className="form-group">
//             <label>Email</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter your email"
//               required
//               disabled={loading}
//             />
//           </div>

//           <div className="form-group">
//             <label>Password</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter your password"
//               required
//               disabled={loading}
//             />
//           </div>

//           <button type="submit" className="auth-btn" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="auth-footer">
//           Don't have an account? <Link to="/register">Register</Link>
//         </p>
//         <p className="forgot-password">
//           <Link to="/forgot-password">Forgot Password?</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;

// src/pages/Login.jsx
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login for:", formData.email);

      // Use Supabase Auth for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.log("Login error:", error);
        console.log("Error code:", error.code);
        console.log("Error status:", error.status);
        
        // Handle different error types
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email first. Check your inbox for the confirmation link.");
          setError("Email not verified. Please check your email inbox.");
        } else if (error.message.includes("Invalid login credentials") || 
                   error.message.includes("Invalid")) {
          toast.error("Invalid email or password. Please check your credentials and try again.");
          setError("Invalid email or password");
        } else if (error.status === 400) {
          toast.error("Login failed. Please check your email and password.");
          setError("Invalid credentials or account not found");
        } else {
          toast.error(error.message);
          setError(error.message);
        }
        
        setLoading(false);
        return;
      }

      console.log("Login successful:", data.user);
      console.log("User email confirmed:", data.user.email_confirmed_at);
      toast.success("Login successful!");

      // Get additional user info from your Registered table
      const { data: userData, error: userError } = await supabase
        .from("Registered")
        .select("*")
        .eq("Email", formData.email)
        .maybeSingle();

      if (userError) {
        console.warn("Could not fetch user data from Registered table:", userError);
      }

      // If user not in Registered table, create entry now
      if (!userData) {
        console.log("User not found in Registered table, creating entry...");
        const { error: insertError } = await supabase
          .from("Registered")
          .insert([
            {
              FullName: data.user.user_metadata?.full_name || "User",
              Email: data.user.email,
              role: data.user.user_metadata?.role || 'user',
              auth_id: data.user.id
            }
          ]);

        if (insertError) {
          console.error("Could not create Registered entry:", insertError);
        }
      }

      // Create user session
      const userSession = {
        id: data.user.id,
        FullName: userData?.FullName || data.user.user_metadata?.full_name || "User",
        Email: data.user.email,
        role: userData?.role || data.user.user_metadata?.role || 'user'
      };

      console.log("User session:", userSession);
      sessionStorage.setItem("user", JSON.stringify(userSession));
      
      // Navigate based on role
      if (userSession.role === 'admin') {
        sessionStorage.setItem("admin", "true");
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
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
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;