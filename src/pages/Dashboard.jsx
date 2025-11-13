import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // Simulated real-time stats (these can later come from backend API)
  const [stats, setStats] = useState({
    totalUploads: 25,
    approved: 18,
    pending: 7,
    downloads: 210,
  });

  // Example of live data updating every few seconds (simulate activity)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        downloads: prev.downloads + Math.floor(Math.random() * 3), // simulate more downloads
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Dashboard</h1>
      <p className="subtitle">Monitor your activities and manage your resources efficiently.</p>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <h2>{stats.totalUploads}</h2>
          <p>Total Uploads</p>
        </div>
        <div className="stat-card green">
          <h2>{stats.approved}</h2>
          <p>Approved Resources</p>
        </div>
        <div className="stat-card orange">
          <h2>{stats.pending}</h2>
          <p>Pending Approvals</p>
        </div>
        <div className="stat-card purple">
          <h2>{stats.downloads}</h2>
          <p>Total Downloads</p>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="card-grid">
        <div className="dashboard-card" onClick={() => navigate("/upload")}>
          <h3>📤 Upload New File</h3>
          <p>Share new notes or slides with freshers</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/resources")}>
          <h3>📚 View All Resources</h3>
          <p>Browse uploaded materials and download them easily</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/pending")}>
          <h3>🕓 Pending Approvals</h3>
          <p>Check the approval status of your uploaded files</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;