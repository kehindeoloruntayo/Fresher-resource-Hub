import { Link } from "react-router-dom";
import { useState } from "react";
import "./Nav.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="nav-container">
      {/* Logo */}
      <div className="nav-logo">
        <Link to="/" onClick={closeMenu}>
          Fresher Hub
        </Link>
      </div>

      {/* Hamburger Button - visible only on mobile */}
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

      {/* Navigation Links */}
      <ul className={`nav-links ${isOpen ? "active" : ""}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
        <li><Link to="/upload" onClick={closeMenu}>Upload</Link></li>
        <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
        <li><Link to="/register" onClick={closeMenu}>Register</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;