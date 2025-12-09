import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase"; 
import "./Nav.css";

function NavbarAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const logoutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        return;
      }
      
      
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("admin");
      
      closeMenu();
      navigate("/login");
      
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="nav-container">
      <div className="nav-logo">
        <Link to="/dashboard" onClick={closeMenu}>🎓 Fresher Hub</Link>
      </div>

      <button
        className={`hamburger ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <ul className={`nav-links ${isOpen ? "active" : ""}`}>
        <li><Link to="/admin" onClick={closeMenu}> Admin Dashboard</Link></li>
        <li><Link to="/upload" onClick={closeMenu}>Upload</Link></li>
        <li><Link to="/pending" onClick={closeMenu}>My Uploads</Link></li>
         <li><Link to="/admin-access" onClick={closeMenu}>Admin Access</Link></li>
      </ul>
    </nav>
  );
}

export default NavbarAdmin;