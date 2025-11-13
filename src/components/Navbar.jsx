import { Link } from "react-router-dom";
import "./Nav.css";

function Navbar() {
  return (
    <nav className="nav-container">
      <div className="nav-logo">
        <Link to="/">🎓 Fresher Hub</Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/upload">Upload</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;