import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to Fresher Resource Hub</h1>
          <p>
            Browse, download, and share slides and past question papers. Learn smarter with resources from seniors and contributors.
          </p>
          <a href="/dashboard" className="hero-btn">Get Started</a>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Use Fresher Hub?</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Easy Browsing</h3>
            <p>Search and access resources quickly.</p>
          </div>
          <div className="feature-card">
            <h3>Upload & Share</h3>
            <p>Seniors can upload slides and notes for everyone.</p>
          </div>
          <div className="feature-card">
            <h3>Verified Content</h3>
            <p>Admins ensure resources are accurate and safe.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;