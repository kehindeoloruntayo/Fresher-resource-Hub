import "./AdminPanel.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Pagination from "../components/Pagination";
import DarkModeToggle from "../components/DarkModeToggle";

function AdminPanel() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAdminData();
    fetchUploads();
  }, [refresh]);

  const fetchAdminData = async () => {
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

      if (data && data.role === "admin") {
        setAdminData(data);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  };

  const handleApprove = async (uploadId) => {
    try {
      const { error } = await supabase
        .from("uploads")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", uploadId);

      if (error) throw error;

      setRefresh((prev) => prev + 1);
      alert("Document approved successfully!");
    } catch (error) {
      console.error("Error approving document:", error);
      alert("Error approving document: " + error.message);
    }
  };

  const handleReject = async (uploadId) => {
    if (
      window.confirm(
        "Are you sure you want to reject this document? This action cannot be undone."
      )
    ) {
      try {
        const { error } = await supabase
          .from("uploads")
          .update({
            status: "rejected",
            updated_at: new Date().toISOString(),
          })
          .eq("id", uploadId);

        if (error) throw error;

        setRefresh((prev) => prev + 1);
        alert("Document rejected successfully!");
      } catch (error) {
        console.error("Error rejecting document:", error);
        alert("Error rejecting document: " + error.message);
      }
    }
  };

  const handleDelete = async (uploadId, fileName) => {
    if (
      window.confirm(
        "Are you sure you want to delete this document? This will remove it from the database and storage permanently."
      )
    ) {
      try {
        const storageFileName = fileName.includes("/")
          ? fileName.split("/").pop()
          : fileName;

        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([storageFileName]);

        if (storageError) {
          console.warn(
            "Storage delete error (file might not exist):",
            storageError
          );
        }

        const { error: dbError } = await supabase
          .from("uploads")
          .delete()
          .eq("id", uploadId);

        if (dbError) throw dbError;

        setRefresh((prev) => prev + 1);
        alert("Document deleted successfully!");
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Error deleting document: " + error.message);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("admin");
    navigate("/login");
  };

  const pendingUploads = uploads.filter(
    (upload) => upload.status === "pending"
  );
  const approvedUploads = uploads.filter(
    (upload) => upload.status === "approved"
  );
  const rejectedUploads = uploads.filter(
    (upload) => upload.status === "rejected"
  );

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="admin-container">
        <div className="error">Access denied. Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <DarkModeToggle />
      <div className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Review and manage uploaded documents</p>
        </div>
        <div className="admin-info">
          <p>
            Welcome back, <strong>{adminData.FullName}</strong>!
          </p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-cards">
          <div className="stat-card pending">
            <h3>{pendingUploads.length}</h3>
            <p>Pending Review</p>
          </div>
          <div className="stat-card approved">
            <h3>{approvedUploads.length}</h3>
            <p>Approved</p>
          </div>
          <div className="stat-card rejected">
            <h3>{rejectedUploads.length}</h3>
            <p>Rejected</p>
          </div>
          <div className="stat-card total">
            <h3>{uploads.length}</h3>
            <p>Total Uploads</p>
          </div>
        </div>
      </div>

      <div className="uploads-section">
        <h2>Documents Pending Review ({pendingUploads.length})</h2>
        {pendingUploads.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Course Code</th>
                <th>Uploader</th>
                <th>File</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUploads
                .slice(
                  (pendingPage - 1) * itemsPerPage,
                  pendingPage * itemsPerPage
                )
                .map((upload) => (
                  <tr key={upload.id}>
                    <td>
                      <strong>{upload.title}</strong>
                    </td>
                    <td>{upload.course_code}</td>
                    <td>{upload.uploader_name}</td>
                    <td>
                      <a
                        href={upload.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        📎 {upload.file_name}
                      </a>
                      <br />
                      <small>
                        {(upload.file_size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    </td>
                    <td>{new Date(upload.created_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(upload.id)}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(upload.id)}
                      >
                        ❌ Reject
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(upload.id, upload.file_name)
                        }
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="no-documents">
            <p>No documents pending review. 🎉</p>
          </div>
        )}
        <Pagination
          currentPage={pendingPage}
          totalPages={Math.ceil(pendingUploads.length / itemsPerPage)}
          onPageChange={setPendingPage}
        />
      </div>

      <div className="uploads-section">
        <h2>Approved Documents ({approvedUploads.length})</h2>
        {approvedUploads.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Uploader</th>
                <th>File</th>
                <th>Approved Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedUploads
                .slice(
                  (approvedPage - 1) * itemsPerPage,
                  approvedPage * itemsPerPage
                )
                .map((upload) => (
                  <tr key={upload.id}>
                    <td>
                      <strong>{upload.title}</strong>
                    </td>
                    <td>{upload.uploader_name}</td>
                    <td>
                      <a
                        href={upload.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        📎 {upload.file_name}
                      </a>
                    </td>
                    <td>{new Date(upload.updated_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(upload.id, upload.file_name)
                        }
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="no-documents">
            <p>No approved documents yet.</p>
          </div>
        )}
        <Pagination
          currentPage={approvedPage}
          totalPages={Math.ceil(approvedUploads.length / itemsPerPage)}
          onPageChange={setApprovedPage}
        />
      </div>

      <div className="uploads-section">
        <h2>Rejected Documents ({rejectedUploads.length})</h2>
        {rejectedUploads.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Uploader</th>
                <th>File</th>
                <th>Rejected Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rejectedUploads
                .slice(
                  (rejectedPage - 1) * itemsPerPage,
                  rejectedPage * itemsPerPage
                )
                .map((upload) => (
                  <tr key={upload.id}>
                    <td>
                      <strong>{upload.title}</strong>
                    </td>
                    <td>{upload.uploader_name}</td>
                    <td>
                      <a
                        href={upload.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        📎 {upload.file_name}
                      </a>
                    </td>
                    <td>{new Date(upload.updated_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(upload.id, upload.file_name)
                        }
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="no-documents">
            <p>No rejected documents.</p>
          </div>
        )}
      </div>
      <Pagination
        currentPage={rejectedPage}
        totalPages={Math.ceil(rejectedUploads.length / itemsPerPage)}
        onPageChange={setRejectedPage}
      />
    </div>
  );
}

export default AdminPanel;