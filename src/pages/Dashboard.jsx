import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { supabase } from "../lib/supabase";
import DarkModeToggle from "../components/DarkModeToggle";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUploads: 0,
    approved: 0,
    pending: 0,
    downloads: 0,
  });
  const [userUploads, setUserUploads] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

 
const fetchUserData = async () => {
  try {
    const userData = sessionStorage.getItem("user"); 
    
    if (!userData) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userData);
    
    const { data, error } = await supabase
      .from("Registered")
      .select("FullName, Email, role")
      .eq("Email", user.Email)
      .single();

    if (error) throw error;

    if (data && data.role === "user") {
      setUserData(data);
      fetchUserUploads(user.Email);
    } else {
      navigate("/login");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    navigate("/login");
  } finally {
    setLoading(false);
  }
};

  const fetchUserUploads = async (userEmail) => {
    try {
      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("uploader_email", userEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const uploads = data || [];
      setUserUploads(uploads);

      
      const totalUploads = uploads.length;
      const approved = uploads.filter(upload => upload.status === 'approved').length;
      const pending = uploads.filter(upload => upload.status === 'pending').length;
      
      
      const downloads = uploads.reduce((total, upload) => total + (upload.download_count || 0), 0);

      setStats({
        totalUploads,
        approved,
        pending,
        downloads,
      });

    } catch (error) {
      console.error("Error fetching user uploads:", error);
    }
  };

  
  const recentUploads = userUploads.slice(0, 3);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading user panel...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="dashboard-container">
        <div className="error">Access denied. Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DarkModeToggle /> 
      <h1>Welcome to Your Dashboard</h1>
      <p><strong>{userData.FullName}</strong>!</p>
      <p className="subtitle">Monitor your activities and manage your resources efficiently.</p>

     
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
        {/* <div className="stat-card purple">
          <h2>{stats.downloads}</h2>
          <p>Total Downloads</p>
        </div> */}
      </div>

      
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