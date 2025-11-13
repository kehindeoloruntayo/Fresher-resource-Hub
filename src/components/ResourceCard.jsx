import React from "react";
import { Link } from "react-router-dom";

export default function ResourceCard({ resource }) {
  // resource: { id, title, fileType, uploader, course, status, createdAt }
  return (
    <article className="card">
      <div className="card-left">
        <div className={`file-pill ${resource.fileType}`}>{resource.fileType.toUpperCase()}</div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{resource.title}</h3>
        <div className="card-meta">
          <span className="muted">{resource.course || "General"}</span>
          <span className="muted">•</span>
          <span className="muted">by {resource.uploader || "Unknown"}</span>
        </div>

        <p className="card-desc">{resource.description || ""}</p>

        <div className="card-actions">
          <Link to={`/resource/${resource.id}`} className="btn btn-sm">View</Link>
          <a href={resource.fileUrl || "#"} className="btn btn-ghost" download>Download</a>
          <span className={`status-badge ${resource.status === "Approved" ? "approved" : "pending"}`}>
            {resource.status || "Pending"}
          </span>
        </div>
      </div>
    </article>
  );
}