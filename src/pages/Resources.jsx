import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Resources.css";

function Resources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [fileType, setFileType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      let query = supabase
        .from("uploads")
        .select("*")
        .order("created_at", { ascending: false });

      const userData = localStorage.getItem("user");
      let isAdmin = false;

      if (userData) {
        const user = JSON.parse(userData);
        const { data: userRole } = await supabase
          .from("Registered")
          .select("role")
          .eq("Email", user.Email)
          .single();

        isAdmin = userRole?.role === "admin";
      }

      if (!isAdmin) {
        query = query.eq("status", "approved");
      }

      const { data, error } = await query;

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop().toLowerCase();
  };

  const getFileTypeDisplay = (fileName) => {
    const ext = getFileExtension(fileName);
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

const filteredAndSortedResources = useMemo(() => {
  let result = [...resources];

result = result.filter(resource => {
    const categoryMatch = category === "All" || resource.category === category;
    const typeMatch = fileType === "All" || getFileTypeDisplay(resource.file_name) === fileType;
    const searchMatch = !searchTerm ||
      resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.uploader_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return categoryMatch && typeMatch && searchMatch;
  });

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy) {
      case "newest":     return new Date(b.created_at) - new Date(a.created_at);
      case "oldest":     return new Date(a.created_at) - new Date(b.created_at);
      case "name-asc":   return a.title.localeCompare(b.title);
      case "name-desc":  return b.title.localeCompare(a.title);
      case "size-desc":  return b.file_size - a.file_size;
      case "size-asc":   return a.file_size - b.file_size;
      default:           return 0;
    }
  });

  return result;
}, [resources, category, fileType, searchTerm, sortBy]);

  const categories = useMemo(() => {
    const cats = ["All"];
    resources.forEach((resource) => {
      if (resource.category && !cats.includes(resource.category)) {
        cats.push(resource.category);
      }
    });
    return cats;
  }, [resources]);

  const fileTypes = useMemo(() => {
    const types = ["All"];
    resources.forEach((resource) => {
      const type = getFileTypeDisplay(resource.file_name);
      if (type && !types.includes(type)) {
        types.push(type);
      }
    });
    return types;
  }, [resources]);

  const displayed = filteredAndSortedResources.slice(0, visibleCount);

  const handleDownload = (resource) => {
    const link = document.createElement("a");
    link.href = resource.file_url;
    link.download = resource.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileName) => {
    const ext = getFileExtension(fileName);
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
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="resources-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-container">
      {/* --- Header and Filter Section --- */}
      <div className="filter-section">
        <h1 className="page-title">📚 Available Resources</h1>
        <p className="page-subtitle">
          Browse and download study materials shared by the community
        </p>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search by title, author, or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(8);
            }}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="filters-grid">
          <div className="filter-group">
            <label>📁 Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setVisibleCount(8);
              }}
              className="filter-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>📄 File Type</label>
            <select
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value);
                setVisibleCount(8);
              }}
              className="filter-select"
            >
              {fileTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All File Types" : type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters Badges */}
        {(category !== "All" || fileType !== "All" || searchTerm) && (
          <div className="active-filters">
            <span className="active-filters-label">Active Filters:</span>
            {category !== "All" && (
              <span className="filter-badge">
                Category: {category}
                <button onClick={() => setCategory("All")}>×</button>
              </span>
            )}
            {fileType !== "All" && (
              <span className="filter-badge">
                Type: {fileType}
                <button onClick={() => setFileType("All")}>×</button>
              </span>
            )}
            {searchTerm && (
              <span className="filter-badge">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm("")}>×</button>
              </span>
            )}
            <button
              className="clear-all-filters"
              onClick={() => {
                setCategory("All");
                setFileType("All");
                setSearchTerm("");
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* --- Results Summary --- */}
      <div className="results-summary">
        <div className="results-count">
          Showing <strong>{displayed.length}</strong> of{" "}
          <strong>{filteredAndSortedResources.length}</strong> resources
          {searchTerm && ` for "${searchTerm}"`}
          {category !== "All" && ` in ${category}`}
          {fileType !== "All" && ` (${fileType} files)`}
          {sortBy !== "newest" && (
            <span className="sort-indicator">
              {" "}
              • Sorted by {sortBy === "oldest" && "Oldest"}
              {sortBy === "name-asc" && "Name (A→Z)"}
              {sortBy === "name-desc" && "Name (Z→A)"}
              {sortBy === "size-desc" && "Largest"}
              {sortBy === "size-asc" && "Smallest"}
            </span>
          )}
        </div>
        <div className="upload-cta">
          {localStorage.getItem("user") && (
            <button
              onClick={() => navigate("/upload")}
              className="upload-cta-btn"
            >
              📤 Upload New Resource
            </button>
          )}
        </div>
      </div>

      {/* --- Resource Cards Grid --- */}
      {filteredAndSortedResources.length > 0 ? (
        <>
          <div className="resources-grid">
            {displayed.map((resource) => (
              <div
                key={resource.id}
                className="resource-card"
                onClick={() => setSelectedDoc(resource)}
              >
                <div className="card-header">
                  <span className="file-icon">
                    {getFileIcon(resource.file_name)}
                  </span>
                  <h3 className="card-title">{resource.title}</h3>
                </div>

                <div className="card-content">
                  {resource.description && (
                    <p className="card-description">{resource.description}</p>
                  )}

                  <div className="card-meta">
                    <div className="meta-item">
                      <span className="meta-label">📁 Category:</span>
                      <span className="meta-value">
                        {resource.category || "Uncategorized"}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">📄 Type:</span>
                      <span className="meta-value">
                        {getFileTypeDisplay(resource.file_name)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">👤 By:</span>
                      <span className="meta-value">
                        {resource.uploader_name}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">📅 Uploaded:</span>
                      <span className="meta-value">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">💾 Size:</span>
                      <span className="meta-value">
                        {formatFileSize(resource.file_size)}
                      </span>
                    </div>
                  </div>

                  {/* Status badge for admin users */}
                  {localStorage.getItem("admin") === "true" && (
                    <div className="card-status">
                      <span
                        className={`status-badge status-${resource.status}`}
                      >
                        {resource.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    className="download-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(resource);
                    }}
                    title="Download"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* --- Load More Button --- */}
          {visibleCount < filteredAndSortedResources.length && (
            <div className="load-more-container">
              <button
                className="load-more-btn"
                onClick={() => setVisibleCount((prev) => prev + 8)}
              >
                Load More ({filteredAndSortedResources.length - visibleCount} more)
              </button>
            </div>
          )}
        </>
      ) : (
        /* --- No Results --- */
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No resources found</h3>
          <p>
            {searchTerm || category !== "All" || fileType !== "All"
              ? "No resources match your current filters. Try adjusting your search criteria."
              : "No resources available yet. Be the first to upload!"}
          </p>
          <div className="no-results-actions">
            {(searchTerm || category !== "All" || fileType !== "All") && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setCategory("All");
                  setFileType("All");
                  setSearchTerm("");
                }}
              >
                Clear All Filters
              </button>
            )}
            {localStorage.getItem("user") && (
              <button
                onClick={() => navigate("/upload")}
                className="upload-cta-btn"
              >
                Upload First Resource
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- Modal Preview --- */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDoc.title}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedDoc(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-icon">
                {getFileIcon(selectedDoc.file_name)}
              </div>

              <div className="modal-details">
                {selectedDoc.description && (
                  <div className="modal-section">
                    <h4>Description</h4>
                    <p>{selectedDoc.description}</p>
                  </div>
                )}

                <div className="modal-grid">
                  <div className="detail-item">
                    <span className="detail-label">📁 Category:</span>
                    <span className="detail-value">
                      {selectedDoc.category || "Uncategorized"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📄 File Type:</span>
                    <span className="detail-value">
                      {getFileTypeDisplay(selectedDoc.file_name)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">👤 Uploaded by:</span>
                    <span className="detail-value">
                      {selectedDoc.uploader_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📅 Date:</span>
                    <span className="detail-value">
                      {new Date(selectedDoc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">💾 File Size:</span>
                    <span className="detail-value">
                      {formatFileSize(selectedDoc.file_size)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📤 File Name:</span>
                    <span className="detail-value">
                      {selectedDoc.file_name}
                    </span>
                  </div>
                </div>

                {/* Status for admin users */}
                {localStorage.getItem("admin") === "true" && (
                  <div className="modal-section">
                    <h4>Status</h4>
                    <span
                      className={`status-badge status-${selectedDoc.status}`}
                    >
                      {selectedDoc.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-download-btn"
                onClick={() => handleDownload(selectedDoc)}
              >
                ⬇️ Download File
              </button>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedDoc(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resources;