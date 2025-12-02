// import "./Register.css";
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { supabase } from "../lib/supabase";
// import bcrypt from 'bcryptjs';

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

      
//       const saltRounds = 12;
//       const hashedPassword = await bcrypt.hash(formData.password, saltRounds);

      

      
//       const { data, error } = await supabase
//         .from('Registered')
//         .insert([
//           {
//             FullName: formData.fullName,
//             Email: formData.email,
//             Password: hashedPassword,
//             role: 'user'
//           }
//         ])
//         .select();

//       if (error) {
//         console.error("Registration error:", error);
        
//         if (error.code === '23505') {
//           throw new Error("This email is already registered");
//         }
//         throw new Error("Registration failed: " + error.message);
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

// src/pages/Register.jsx
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";

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

      // 1️⃣ Sign up using Supabase Auth (password is automatically hashed)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'user'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error("This email is already registered");
        }
        throw new Error(authError.message);
      }

      // 2️⃣ Save extra user info in 'Registered' table (optional)
      // If you still want to use your custom table alongside Supabase Auth
      const { data, error } = await supabase
        .from('Registered')
        .insert([
          {
            FullName: formData.fullName,
            Email: formData.email,
            role: 'user',
            auth_id: authData.user?.id  // link to Supabase Auth user
          }
        ])
        .select();

      if (error) {
        console.warn("Could not save to Registered table:", error.message);
        // Continue anyway - auth user was created
      }

      console.log("Registration successful:", authData);
      
      if (authData.user && !authData.user.identities?.length) {
        // User already exists
        alert('⚠️ User already exists. Please login instead.');
        navigate('/login');
      } else if (authData.user) {
        // New user created
        alert('✅ Registration successful! Please check your email to verify your account.');
        navigate('/login');
      }

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
              disabled={loading}
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
              placeholder="Create a password (min. 6 characters)" 
              required 
              minLength="6"
              disabled={loading}
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
              disabled={loading}
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