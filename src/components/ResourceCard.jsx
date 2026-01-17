

import React from "react";
import { Link } from "react-router-dom";
import "./ResourceCard.css";

export default function ResourceCard({ resource, onDownload }) {
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

  const getFileTypeDisplay = (fileName) => {
    if (!fileName) return "FILE";
    const ext = fileName.split(".").pop().toLowerCase();
    const typeMap = {
      pdf: "PDF",
      ppt: "PPT",
      pptx: "PPT",
      doc: "DOC",
      docx: "DOC",
      txt: "TXT",
      zip: "ZIP",
    };
    return typeMap[ext] || ext.toUpperCase();
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownload = (e) => {
    e.preventDefault();
    if (onDownload) {
      onDownload(resource);
    } else {
      const link = document.createElement("a");
      link.href = resource.file_url;
      link.download = resource.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <article className="resource-card">
      <div className="card-header">
        <span className="file-icon">{getFileIcon(resource.file_name)}</span>
        <div className="file-type-badge">
          {getFileTypeDisplay(resource.file_name)}
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{resource.title}</h3>

        <div className="card-meta">
          {resource.course_code && (
            <span className="meta-item">
              <span className="meta-icon">📚</span>
              {resource.course_code}
            </span>
          )}
          {resource.department && (
            <span className="meta-item">
              <span className="meta-icon">🏛️</span>
              {resource.department}
            </span>
          )}
          {resource.level && (
            <span className="meta-item">
              <span className="meta-icon">🎓</span>
              {resource.level}
            </span>
          )}
        </div>

        <div className="card-info">
          <div className="info-item">
            <span className="info-label">Uploaded by:</span>
            <span className="info-value">{resource.uploader_name || "Unknown"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Date:</span>
            <span className="info-value">{formatDate(resource.created_at)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Size:</span>
            <span className="info-value">{formatFileSize(resource.file_size)}</span>
          </div>
        </div>

        {resource.status && (
          <div className="status-container">
            <span className={`status-badge status-${resource.status.toLowerCase()}`}>
              {resource.status === "approved" && "✅"}
              {resource.status === "pending" && "⏳"}
              {resource.status === "rejected" && "❌"}
              {" "}
              {resource.status.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <Link to={`/resource/${resource.id}`} className="btn btn-primary">
          <span className="btn-icon">👁️</span>
          View Details
        </Link>
        <button onClick={handleDownload} className="btn btn-secondary">
          <span className="btn-icon">⬇️</span>
          Download
        </button>
      </div>
    </article>
  );
}