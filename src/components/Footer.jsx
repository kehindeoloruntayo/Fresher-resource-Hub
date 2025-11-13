import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>🎓 Fresher Resource Hub</h3>
          <p>
            A collaborative space for students to share lecture slides, past
            questions, and academic resources — bridging knowledge between
            seniors and freshers.
          </p>
        </div>

        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/upload">Upload</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Register</a></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h4>Contact</h4>
          <p>Email: support@fresherhub.edu.ng</p>
          <p>Phone: +234 813 456 7890</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Fresher Resource Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;