import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Nav.css";

function NavbarUser() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const logoutUser = () => {
    localStorage.removeItem("authToken");
    closeMenu();
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="nav-container">
      <div className="nav-logo">
        <Link to="/dashboard" onClick={closeMenu}>🎓 Fresher Hub</Link>
      </div>

      <button
        className={`hamburger ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <ul className={`nav-links ${isOpen ? "active" : ""}`}>
        <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
        <li><Link to="/upload" onClick={closeMenu}>Upload</Link></li>
        <li><button className="logout-btn" onClick={logoutUser}>Logout</button></li>
      </ul>
    </nav>
  );
}

export default NavbarUser;