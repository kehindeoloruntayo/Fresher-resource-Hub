import "./pending.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Pending() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserUploads();
  }, []);

  const fetchUserUploads = async () => {
    try {
      
      const userData = sessionStorage.getItem("user");
      if (!userData) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userData);

      
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('uploader_email', user.Email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUploads(data || []);
    } catch (error) {
      console.error("Error fetching uploads:", error);
      setError("Failed to load your uploads");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: "pending", text: "⏳ Pending" },
      approved: { class: "approved", text: "✅ Approved" },
      rejected: { class: "rejected", text: "❌ Rejected" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📕',
      doc: '📄',
      docx: '📄',
      ppt: '📊',
      pptx: '📊',
      txt: '📝',
      zip: '📦'
    };
    return icons[ext] || '📁';
  };

  if (loading) {
    return (
      <div className="pending-container">
        <div className="loading">Loading your uploads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const pendingUploads = uploads.filter(upload => upload.status === 'pending');
  const approvedUploads = uploads.filter(upload => upload.status === 'approved');
  const rejectedUploads = uploads.filter(upload => upload.status === 'rejected');

  return (
    <div className="pending-container">
      <h1>My Uploads Status</h1>
      <p>Track the approval status of your uploaded documents.</p>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-number">{uploads.length}</div>
          <div className="stat-label">Total Uploads</div>
        </div>
        <div className="stat-item">
          <div className="stat-number pending-count">{pendingUploads.length}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-item">
          <div className="stat-number approved-count">{approvedUploads.length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-item">
          <div className="stat-number rejected-count">{rejectedUploads.length}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Pending Uploads Section */}
      <div className="uploads-section">
        <h2>⏳ Pending Approval ({pendingUploads.length})</h2>
        {pendingUploads.length > 0 ? (
          <table className="pending-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Date Uploaded</th>
                <th>File Info</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingUploads.map((upload) => (
                <tr key={upload.id}>
                  <td>
                    <div className="document-info">
                      <span className="file-icon">{getFileIcon(upload.file_name)}</span>
                      <div>
                        <div className="document-title">{upload.title}</div>
                        <div className="document-description">{upload.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(upload.created_at)}</td>
                  <td>
                    <div className="file-info">
                      <div>{upload.file_name}</div>
                      <div className="file-size">
                        {(upload.file_size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(upload.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-uploads">
            <p>No documents pending approval. 🎉</p>
          </div>
        )}
      </div>

      {/* Approved Uploads Section */}
      {approvedUploads.length > 0 && (
        <div className="uploads-section">
          <h2>✅ Approved Documents ({approvedUploads.length})</h2>
          <table className="pending-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Date Approved</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedUploads.map((upload) => (
                <tr key={upload.id}>
                  <td>
                    <div className="document-info">
                      <span className="file-icon">{getFileIcon(upload.file_name)}</span>
                      <div>
                        <div className="document-title">{upload.title}</div>
                        <div className="document-description">{upload.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(upload.updated_at)}</td>
                  <td>
                    {getStatusBadge(upload.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejected Uploads Section */}
      {rejectedUploads.length > 0 && (
        <div className="uploads-section">
          <h2>❌ Rejected Documents ({rejectedUploads.length})</h2>
          <table className="pending-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Date Rejected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rejectedUploads.map((upload) => (
                <tr key={upload.id}>
                  <td>
                    <div className="document-info">
                      <span className="file-icon">{getFileIcon(upload.file_name)}</span>
                      <div>
                        <div className="document-title">{upload.title}</div>
                        <div className="document-description">{upload.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(upload.updated_at)}</td>
                  <td>
                    {getStatusBadge(upload.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No uploads at all */}
      {uploads.length === 0 && (
        <div className="no-uploads">
          <div className="no-uploads-icon">📭</div>
          <h3>No uploads yet</h3>
          <p>You haven't uploaded any documents yet.</p>
          <button 
            onClick={() => navigate("/upload")}
            className="upload-cta-btn"
          >
            Upload Your First Document
          </button>
        </div>
      )}
    </div>
  );
}

export default Pending;