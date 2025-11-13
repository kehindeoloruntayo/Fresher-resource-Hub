import "./AdminPanel.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AdminPanel() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  const dummyData = [
    { id: 1, title: "Calculus Notes", uploader: "Alice", status: "Pending" },
    { id: 2, title: "Physics Slides", uploader: "Bob", status: "Pending" },
    { id: 3, title: "Chemistry Lab Report", uploader: "Charlie", status: "Pending" },
  ];

  useEffect(() => {
    fetchAdminData();
    fetchDocuments();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Get admin data from localStorage
      const userData = localStorage.getItem("user");
      
      if (!userData) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userData);
      
      // Fetch latest admin data from database
      const { data, error } = await supabase
        .from("Registered")
        .select("FullName, Email, role")
        .eq("Email", user.Email)
        .single();

      if (error) throw error;

      if (data && data.role === "admin") {
        setAdminData(data);
      } else {
        // Not an admin, redirect to login
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    // TODO: Replace with actual database fetch
    // For now, using dummy data
    setDocuments(dummyData);
  };

  const handleApprove = async (documentId) => {
    try {
      // TODO: Implement actual approve functionality
      console.log("Approving document:", documentId);
      
      // Update local state for immediate UI feedback
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: "Approved" }
            : doc
        )
      );
      
      alert(`Document ${documentId} approved successfully!`);
    } catch (error) {
      console.error("Error approving document:", error);
      alert("Error approving document. Please try again.");
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      try {
        // TODO: Implement actual delete functionality
        console.log("Deleting document:", documentId);
        
        // Update local state for immediate UI feedback
        setDocuments(prevDocs => 
          prevDocs.filter(doc => doc.id !== documentId)
        );
        
        alert(`Document ${documentId} deleted successfully!`);
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Error deleting document. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    navigate("/login");
  };

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
      <div className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Approve or delete uploaded documents.</p>
        </div>
        <div className="admin-info">
          <p>Welcome back, <strong>{adminData.FullName}</strong>!</p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <p>You have <strong>{documents.length}</strong> documents pending approval.</p>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Uploader</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.title}</td>
              <td>{doc.uploader}</td>
              <td>
                <span className={`status-${doc.status.toLowerCase()}`}>
                  {doc.status}
                </span>
              </td>
              <td className="actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleApprove(doc.id)}
                  disabled={doc.status === "Approved"}
                >
                  {doc.status === "Approved" ? "Approved" : "Approve"}
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(doc.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {documents.length === 0 && (
        <div className="no-documents">
          <p>No documents pending approval. 🎉</p>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;