import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      let query = supabase
        .from('uploads')
        .select('*')
        .order('created_at', { ascending: false });

      // Check if user is admin
      const userData = localStorage.getItem("user");
      let isAdmin = false;

      if (userData) {
        const user = JSON.parse(userData);
        const { data: userRole } = await supabase
          .from("Registered")
          .select("role")
          .eq("Email", user.Email)
          .single();
        
        isAdmin = userRole?.role === 'admin';
      }

      // If not admin, only show approved resources
      if (!isAdmin) {
        query = query.eq('status', 'approved');
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

  // Filtering logic
  const filteredResources = resources.filter((resource) => {
    const categoryMatch = category === "All" || (resource.category && resource.category === category);
    const typeMatch = fileType === "All" || getFileExtension(resource.file_name) === fileType.toLowerCase();
    const searchMatch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.uploader_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && typeMatch && searchMatch;
  });

  const displayed = filteredResources.slice(0, visibleCount);

  const getFileExtension = (fileName) => {
    return fileName.split('.').pop().toLowerCase();
  };

  const getFileTypeDisplay = (fileName) => {
    const ext = getFileExtension(fileName);
    const typeMap = {
      pdf: 'PDF',
      ppt: 'PPT',
      pptx: 'PPT',
      doc: 'DOC',
      docx: 'DOC',
      txt: 'TXT',
      zip: 'ZIP'
    };
    return typeMap[ext] || ext.toUpperCase();
  };

  const handleDownload = (resource) => {
    const link = document.createElement('a');
    link.href = resource.file_url;
    link.download = resource.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (resource) => {
    window.open(resource.file_url, '_blank');
  };

  
  const categories = ["All", ...new Set(resources.filter(r => r.category).map(r => r.category))];
  
  
  const fileTypes = ["All", ...new Set(resources.map(r => getFileTypeDisplay(r.file_name)))];

  if (loading) {
    return (
      <div className="resources-container">
        <div className="loading">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="resources-container">
      {/* --- Filter Section --- */}
      <div className="filter-section">
        <h1 className="page-title">Available Resources</h1>
        <input
          type="text"
          placeholder="Search by title, author, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="dropdowns">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
          >
            {fileTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

     
      <div className="results-count">
        Showing {displayed.length} of {filteredResources.length} resources
        {searchTerm && ` for "${searchTerm}"`}
      </div>

      {/* --- Resource Cards --- */}
      <div className="resources-grid">
        {displayed.map((resource) => (
          <div
            key={resource.id}
            className="resource-card"
            onClick={() => setSelectedDoc(resource)}
          >
            <h3>{resource.title}</h3>
            <p><strong>Category:</strong> {resource.category || "Uncategorized"}</p>
            <p><strong>Type:</strong> {getFileTypeDisplay(resource.file_name)}</p>
            <p><strong>By:</strong> {resource.uploader_name}</p>
            <p><strong>Uploaded:</strong> {new Date(resource.created_at).toLocaleDateString()}</p>
            <p><strong>Size:</strong> {(resource.file_size / 1024 / 1024).toFixed(2)} MB</p>
            
            {/* Status badge for admin users */}
            {localStorage.getItem("admin") === "true" && (
              <span className={`status-badge status-${resource.status}`}>
                {resource.status.toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* --- Load More Button --- */}
      {visibleCount < filteredResources.length && (
        <button
          className="load-more"
          onClick={() => setVisibleCount((prev) => prev + 8)}
        >
          Load More
        </button>
      )}

      {/* No results message */}
      {filteredResources.length === 0 && !loading && (
        <div className="no-results">
          <h3>No resources found</h3>
          <p>
            {searchTerm 
              ? `No resources match "${searchTerm}"` 
              : "No resources available yet."
            }
          </p>
          {localStorage.getItem("user") && (
            <button 
              onClick={() => navigate('/upload')}
              className="upload-cta-btn"
            >
              Upload First Resource
            </button>
          )}
        </div>
      )}

      {/* --- Modal Preview --- */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedDoc.title}</h2>
            <p><strong>Description:</strong> {selectedDoc.description}</p>
            <p><strong>Category:</strong> {selectedDoc.category || "Uncategorized"}</p>
            <p><strong>File Type:</strong> {getFileTypeDisplay(selectedDoc.file_name)}</p>
            <p><strong>Uploaded by:</strong> {selectedDoc.uploader_name}</p>
            <p><strong>Date:</strong> {new Date(selectedDoc.created_at).toLocaleDateString()}</p>
            <p><strong>File Size:</strong> {(selectedDoc.file_size / 1024 / 1024).toFixed(2)} MB</p>
            
            {/* Status for admin users */}
            {localStorage.getItem("admin") === "true" && (
              <p><strong>Status:</strong> 
                <span className={`status-badge status-${selectedDoc.status}`}>
                  {selectedDoc.status.toUpperCase()}
                </span>
              </p>
            )}

            <div className="modal-actions">
             
              <button
                className="download-btn"
                onClick={() => handleDownload(selectedDoc)}
              >
                Download
              </button>

              <button
                className="close-btn"
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