
// import "./login.css";
// import { Link, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import toast from "react-hot-toast";


// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
// console.log('API Base URL:', API_BASE_URL);

// function Login({ setUser, setUserRole }) {
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
//       console.log("Connecting to:", `${API_BASE_URL}/api/login`);

//       const response = await fetch(`${API_BASE_URL}/api/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password
//         })
//       });

//       console.log('Response status:', response.status);
      
      
//       const contentType = response.headers.get('content-type');
//       if (!contentType || !contentType.includes('application/json')) {
//         const text = await response.text();
//         console.error('Non-JSON response:', text);
//         throw new Error('Server returned non-JSON response');
//       }

//       const data = await response.json();
//       console.log('Response data:', data);

//       if (!response.ok) {
//         if (response.status === 401) {
//           toast.error("Invalid email or password. Please try again.");
//           setError("Invalid email or password");
//         } else if (response.status === 404) {
//           toast.error("Service unavailable. Please try again later.");
//           setError("Service unavailable");
//         } else {
//           toast.error(data.error || "Login failed");
//           setError(data.error || "Login failed");
//         }
//         setLoading(false);
//         return;
//       }

//       if (!data.success) {
//         toast.error(data.error || "Login failed");
//         setError(data.error || "Login failed");
//         setLoading(false);
//         return;
//       }

//       console.log("Login successful:", data);
//       toast.success("Login successful!");

      
//       const userSession = {
//         id: data.user.id,
//         FullName: data.user.FullName,
//         Email: data.user.Email,
//         role: data.user.role,
//         sessionId: data.sessionId,
//         expiresAt: data.expiresAt
//       };

//       console.log("User session:", userSession);
//       sessionStorage.setItem("user", JSON.stringify(userSession));

//       if (setUser) setUser(userSession);
//   if (setUserRole) setUserRole(data.user.role);
      
      
//       if (userSession.role === 'admin') {
//         sessionStorage.setItem("admin", "true");
//         navigate("/admin");
//         window.location.reload();
//       } else {
//         navigate("/dashboard");
//         window.location.reload();
//       }
      
//     } catch (error) {
//       console.error("Login error:", error);
//       if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
//         toast.error("Cannot connect to server. Please check your internet connection or try again later.");
//         setError("Connection failed. Server might be down.");
//       } else {
//         toast.error("An error occurred. Please try again.");
//         setError(error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>Welcome Back 👋</h2>
//         <p className="auth-subtext">Login to your Fresher Hub account</p>

//         {error && (
//           <div className="error-message">
//             {error}
//             <br />
//             <small>Backend URL: {API_BASE_URL}</small>
//           </div>
//         )}

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



import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
console.log('API Base URL:', API_BASE_URL);

function Login({ setUser, setUserRole }) {
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
      console.log("Connecting to:", `${API_BASE_URL}/api/login`);

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Invalid email or password. Please try again.");
          setError("Invalid email or password");
        } else if (response.status === 404) {
          toast.error("Service unavailable. Please try again later.");
          setError("Service unavailable");
        } else {
          toast.error(data.error || "Login failed");
          setError(data.error || "Login failed");
        }
        setLoading(false);
        return;
      }

      if (!data.success) {
        toast.error(data.error || "Login failed");
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      console.log("Login successful:", data);
      toast.success("Login successful!");

      // Store user session
      const userSession = {
        id: data.user.id,
        FullName: data.user.FullName,
        Email: data.user.Email,
        role: data.user.role,
        sessionId: data.sessionId,
        expiresAt: data.expiresAt
      };

      console.log("User session:", userSession);
      sessionStorage.setItem("user", JSON.stringify(userSession));

      if (userSession.role === 'admin') {
        sessionStorage.setItem("admin", "true");
      }

      // Update parent state
      if (setUser) setUser(userSession);
      if (setUserRole) setUserRole(data.user.role);

      // Trigger custom event to notify App.js
      window.dispatchEvent(new Event('user-login'));

      // Navigate based on role WITHOUT reload
      if (userSession.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        toast.error("Cannot connect to server. Please check your internet connection or try again later.");
        setError("Connection failed. Server might be down.");
      } else {
        toast.error("An error occurred. Please try again.");
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back 👋</h2>
        <p className="auth-subtext">Login to your Fresher Hub account</p>

        {error && (
          <div className="error-message">
            {error}
            <br />
            <small>Backend URL: {API_BASE_URL}</small>
          </div>
        )}

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