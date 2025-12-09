// import "./Register.css";
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { supabase } from "../lib/supabase";
// import toast from "react-hot-toast";

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

    
//     if (formData.password !== formData.confirmPassword) {
//       const errorMsg = "Passwords don't match";
//       setError(errorMsg);
//       toast.error(errorMsg);
//       setLoading(false);
//       return;
//     }

//     if (formData.password.length < 6) {
//       const errorMsg = "Password must be at least 6 characters";
//       setError(errorMsg);
//       toast.error(errorMsg);
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log("Registering user:", formData.email);

      
//       const { data: authData, error: authError } = await supabase.auth.signUp({
//         email: formData.email,
//         password: formData.password,
//         options: {
//           data: {
//             full_name: formData.fullName,
//             role: 'user'
//           }
//         }
//       });

//       if (authError) {
//         console.error("Auth error:", authError);
//         if (authError.message.includes('already registered')) {
//           toast.error("This email is already registered. Please login instead.");
//           throw new Error("This email is already registered");
//         }
//         toast.error(authError.message);
//         throw new Error(authError.message);
//       }

      
//       if (authData.user && !authData.user.identities?.length) {
//         toast.error("User already exists. Please login instead.");
//         setTimeout(() => navigate('/login'), 2000);
//         return;
//       }

//       console.log("Auth user created:", authData.user);

      
//       if (authData.user) {
       
        
//         const { data: insertData, error: tableError } = await supabase
//           .from('Registered')
//           .insert([
//             {
//               FullName: formData.fullName,
//               Email: formData.email,
//               role: 'user',
//               auth_id: authData.user.id
//             }
//           ])
//           .select();

//         if (tableError) {
//           console.error("Error saving to Registered table:", tableError);
          
//           if (tableError.code === '23505') {
//             // console.log("User already in Registered table");
//           } else if (tableError.message.includes('auth_id')) {
//             // Try without auth_id if column doesn't exist
//             // console.log("Retrying without auth_id column...");
//             const { error: retryError } = await supabase
//               .from('Registered')
//               .insert([
//                 {
//                   FullName: formData.fullName,
//                   Email: formData.email,
//                   role: 'user'
//                 }
//               ]);
            
//             if (retryError) {
//               // console.error("Retry failed:", retryError);
//               toast.warning("Account created but profile setup incomplete");
//             }
//           } else {
//             toast.warning("Account created but profile setup incomplete");
//           }
//         } else {
//           console.log("Successfully saved to Registered table:", insertData);
//         }
//       }
      
//       toast.success("Registration successful! You can now login.");
//       setTimeout(() => navigate('/login'), 2000);

//     } catch (error) {
//       console.error('Registration error:', error);
//       setError(error.message);
//       toast.error(error.message || "Registration failed");
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
//               placeholder="Create a password (min. 6 characters)" 
//               required 
//               minLength="6"
//               disabled={loading}
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
//               disabled={loading}
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


import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

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
      const errorMsg = "Passwords don't match";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      const errorMsg = "Password must be at least 6 characters";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      console.log("Registering user:", formData.email);

      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Update fetch call:
const response = await fetch(`${API_BASE_URL}/api/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: formData.fullName,
    email: formData.email,
    password: formData.password
  })
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log("Registration successful:", data);
      toast.success("Registration successful! You can now login.");
      
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      toast.error(error.message || "Registration failed");
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