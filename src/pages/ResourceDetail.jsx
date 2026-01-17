

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import DarkModeToggle from "../components/DarkModeToggle";
import "./ResourceDetail.css";

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserAndFetchResource();
  }, [id]);

  const checkUserAndFetchResource = async () => {
    try {
      // Check user role
      const userData = sessionStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const { data: userRole } = await supabase
          .from("Registered")
          .select("role")
          .eq("Email", user.Email)
          .single();

        setIsAdmin(userRole?.role === "admin");
      }

      // Fetch resource
      await fetchResource();
    } catch (error) {
      console.error("Error in initialization:", error);
      setError("Failed to load resource details");
      setLoading(false);
    }
  };

  const fetchResource = async () => {
    try {
      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Resource not found");
        return;
      }

      // Only show approved resources to non-admins
      if (!isAdmin && data.status !== "approved") {
        setError("This resource is not available");
        return;
      }

      setResource(data);
    } catch (error) {
      console.error("Error fetching resource:", error);
      setError("Failed to load resource");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resource) return;

    try {
      // Track download (optional)
      await supabase
        .from("uploads")
        .update({
          download_count: (resource.download_count || 0) + 1,
        })
        .eq("id", resource.id);

      // Trigger download
      const link = document.createElement("a");
      link.href = resource.file_url;
      link.download = resource.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "📁";
    const ext = fileName.split(".").pop().toLowerCase();
    const iconMap = {
      pdf: "📕",
      ppt: "📊",
      pptx: "📊",
      doc: "📄",
      docx: "📄",
      txt: "📝",
      zip: "📦",
    };
    return iconMap[ext] || "📁";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="resource-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading resource details...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="resource-detail-container">
        <DarkModeToggle />
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>{error || "Resource not found"}</h2>
          <button className="back-btn" onClick={() => navigate("/resources")}>
            ← Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-detail-container">
      <DarkModeToggle />

      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-hero">
          <div className="file-icon-large">{getFileIcon(resource.file_name)}</div>
          <div className="hero-content">
            <h1 className="detail-title">{resource.title}</h1>
            <div className="detail-badges">
              {resource.course_code && (
                <span className="badge badge-course">📚 {resource.course_code}</span>
              )}
              {resource.department && (
                <span className="badge badge-department">🏛️ {resource.department}</span>
              )}
              {resource.level && (
                <span className="badge badge-level">🎓 {resource.level}</span>
              )}
              {isAdmin && (
                <span className={`badge badge-status status-${resource.status}`}>
                  {resource.status === "approved" && "✅"}
                  {resource.status === "pending" && "⏳"}
                  {resource.status === "rejected" && "❌"}
                  {" "}
                  {resource.status?.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-body">
          <section className="detail-section">
            <h2>File Information</h2>
            <div className="info-grid">
              <div className="info-card">
                <span className="info-icon">📄</span>
                <div className="info-content">
                  <span className="info-label">File Name</span>
                  <span className="info-value">{resource.file_name}</span>
                </div>
              </div>

              <div className="info-card">
                <span className="info-icon">💾</span>
                <div className="info-content">
                  <span className="info-label">File Size</span>
                  <span className="info-value">{formatFileSize(resource.file_size)}</span>
                </div>
              </div>

              <div className="info-card">
                <span className="info-icon">📅</span>
                <div className="info-content">
                  <span className="info-label">Uploaded On</span>
                  <span className="info-value">{formatDate(resource.created_at)}</span>
                </div>
              </div>

              <div className="info-card">
                <span className="info-icon">👤</span>
                <div className="info-content">
                  <span className="info-label">Uploaded By</span>
                  <span className="info-value">{resource.uploader_name}</span>
                </div>
              </div>

              {resource.download_count !== undefined && (
                <div className="info-card">
                  <span className="info-icon">⬇️</span>
                  <div className="info-content">
                    <span className="info-label">Downloads</span>
                    <span className="info-value">{resource.download_count || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {resource.course_code && (
            <section className="detail-section">
              <h2>Course Code</h2>
              <p className="description-text">{resource.course_code}</p>
            </section>
          )}

          <section className="detail-actions">
            <button className="action-btn btn-download" onClick={handleDownload}>
              <span className="btn-icon">⬇️</span>
              Download File
            </button>
            <a
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn btn-preview"
            >
              <span className="btn-icon">👁️</span>
              Preview in New Tab
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}