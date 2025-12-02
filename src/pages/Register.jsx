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
      console.log("Registering user:", formData.email);

      
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(formData.password, saltRounds);

      

      
      const { data, error } = await supabase
        .from('Registered')
        .insert([
          {
            FullName: formData.fullName,
            Email: formData.email,
            Password: hashedPassword,
            role: 'user'
          }
        ])
        .select();

      if (error) {
        console.error("Registration error:", error);
        
        if (error.code === '23505') {
          throw new Error("This email is already registered");
        }
        throw new Error("Registration failed: " + error.message);
      }

      console.log("Registration successful:", data);
      alert('✅ Registration successful! You can now login.');
      navigate('/login');

    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
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

// import "./Register.css";
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { supabase } from "../lib/supabase";

// function Register() {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     // Validation
//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords don't match");
//       setLoading(false);
//       return;
//     }

//     if (formData.password.length < 6) {
//       setError("Password must be at least 6 characters");
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log("Registering user:", formData.email);

//       // 1️⃣ Sign up using Supabase Auth (password is automatically hashed)
//       const { data: authData, error: authError } = await supabase.auth.signUp({
//         email: formData.email,
//         password: formData.password,
//       });

//       if (authError) {
//         throw new Error(authError.message);
//       }

//       // 2️⃣ Save extra user info in 'Registered' table
//       const { data, error } = await supabase
//         .from('Registered')
//         .insert([
//           {
//             FullName: formData.fullName,
//             Email: formData.email,
//             role: 'user',
//             auth_id: authData.user?.id  // link Registered row to Supabase Auth user
//           }
//         ])
//         .select();

//       if (error) {
//         throw new Error(error.message);
//       }

//       console.log("Registration successful:", data);
//       alert('✅ Registration successful! You can now login.');
//       navigate('/login');

//     } catch (error) {
//       console.error('Registration error:', error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>Create an Account 📝</h2>
//         <p className="auth-subtext">Join the Fresher Hub community</p>

//         {error && <div className="error-message">{error}</div>}

//         <form className="auth-form" onSubmit={handleRegister}>
//           <div className="form-group">
//             <label>Full Name</label>
//             <input 
//               type="text" 
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               placeholder="Enter your full name" 
//               required 
//             />
//           </div>

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
//               placeholder="Create a password (min. 6 characters)" 
//               required 
//               minLength="6"
//             />
//           </div>

//           <div className="form-group">
//             <label>Confirm Password</label>
//             <input 
//               type="password" 
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               placeholder="Confirm your password" 
//               required 
//             />
//           </div>

//           <button 
//             type="submit" 
//             className="auth-btn" 
//             disabled={loading}
//           >
//             {loading ? "Creating Account..." : "Register"}
//           </button>
//         </form>

//         <p className="auth-footer">
//           Already have an account?{" "}
//           <Link to="/login">Login</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Register;





// // src/pages/Register.jsx
// import "./Register.css";
// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import AuthService from "../services/authService";
// import config from "../config/config";

// function Register() {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [passwordStrength, setPasswordStrength] = useState({
//     isValid: false,
//     errors: [],
//   });
//   const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
//   const navigate = useNavigate();

//   // Check if user is already logged in
//   useEffect(() => {
//     if (AuthService.isAuthenticated()) {
//       const user = AuthService.getCurrentUser();
//       navigate(user.role === "admin" ? "/admin" : "/dashboard");
//     }
//   }, [navigate]);

//   // Validate password strength on change
//   useEffect(() => {
//     if (formData.password) {
//       const validation = AuthService.validatePasswordStrength(formData.password);
//       setPasswordStrength(validation);
//     } else {
//       setPasswordStrength({ isValid: false, errors: [] });
//     }
//   }, [formData.password]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     // Clear error when user starts typing
//     if (error) setError("");
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     // Client-side validation
//     if (!formData.fullName.trim()) {
//       setError("Please enter your full name");
//       setLoading(false);
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords don't match");
//       setLoading(false);
//       return;
//     }

//     if (!passwordStrength.isValid) {
//       setError(passwordStrength.errors[0]);
//       setLoading(false);
//       return;
//     }

//     try {
//       const result = await AuthService.register({
//         fullName: formData.fullName,
//         email: formData.email,
//         password: formData.password,
//       });

//       if (result.success) {
//         alert("✅ Registration successful! You can now login.");
//         navigate("/login");
//       } else {
//         setError(result.error);
//       }
//     } catch (error) {
//       console.error("Registration error:", error);
//       setError("An unexpected error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>Create an Account 📝</h2>
//         <p className="auth-subtext">Join the Fresher Hub community</p>

//         {error && <div className="error-message">{error}</div>}

//         <form className="auth-form" onSubmit={handleRegister}>
//           <div className="form-group">
//             <label>Full Name</label>
//             <input
//               type="text"
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               placeholder="Enter your full name"
//               required
//               disabled={loading}
//             />
//           </div>

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
//               onFocus={() => setShowPasswordRequirements(true)}
//               placeholder={`Create a password (min. ${config.auth.minPasswordLength} characters)`}
//               required
//               disabled={loading}
//             />
//             {showPasswordRequirements && formData.password && (
//               <div className="password-requirements">
//                 <p className="requirements-title">Password must contain:</p>
//                 <ul>
//                   <li className={formData.password.length >= config.auth.minPasswordLength ? "valid" : ""}>
//                     At least {config.auth.minPasswordLength} characters
//                   </li>
//                   <li className={/[A-Z]/.test(formData.password) ? "valid" : ""}>
//                     One uppercase letter
//                   </li>
//                   <li className={/[a-z]/.test(formData.password) ? "valid" : ""}>
//                     One lowercase letter
//                   </li>
//                   <li className={/[0-9]/.test(formData.password) ? "valid" : ""}>
//                     One number
//                   </li>
//                   <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "valid" : ""}>
//                     One special character
//                   </li>
//                 </ul>
//               </div>
//             )}
//           </div>

//           <div className="form-group">
//             <label>Confirm Password</label>
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               placeholder="Confirm your password"
//               required
//               disabled={loading}
//             />
//           </div>

//           <button type="submit" className="auth-btn" disabled={loading}>
//             {loading ? (
//               <span>
//                 <span className="spinner"></span> Creating Account...
//               </span>
//             ) : (
//               "Register"
//             )}
//           </button>
//         </form>

//         <p className="auth-footer">
//           Already have an account? <Link to="/login">Login</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Register;