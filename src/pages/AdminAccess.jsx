import React, { useEffect, useState } from "react";
import "./AdminAccess.css";

export default function AdminAccess() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // SUPER ADMINS (only these emails can remove admins)
  const SUPER_ADMINS = ["owner@yourapp.com", "superboss@yourapp.com"];

  const currentAdminEmail = "owner@yourapp.com"; 
  // Replace this with logged-in user email from your auth

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Fetch users error:", err));
  }, []);

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const addAdmin = () => {
    if (!newAdminEmail.trim()) return;

    fetch("/api/admin/add", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email: newAdminEmail }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Admin added");
        setNewAdminEmail("");
      });
  };

  const removeAdmin = (email) => {
    if (!SUPER_ADMINS.includes(currentAdminEmail)) {
      alert("Only super admins can remove admins.");
      return;
    }

    fetch("/api/admin/remove", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then(() => alert("Admin removed"));
  };

  const toggleUpload = (email, disable) => {
    fetch("/api/admin/toggle-upload", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, disable }),
    })
      .then((res) => res.json())
      .then(() => alert("Upload permissions updated"));
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">Admin Control Center</h1>

      <div className="admin-section">
        <h2>Add New Admin</h2>

        <input
          type="email"
          className="admin-input"
          placeholder="Enter user email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
        />

        <button className="admin-btn" onClick={addAdmin}>
          Add Admin
        </button>
      </div>

      <div className="admin-section">
        <h2>Search Users</h2>

        <input
          type="text"
          className="admin-input"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Uploads</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.email}>
                <td>{u.email}</td>
                <td>
                  {u.role === "admin" ? (
                    <span className="badge admin-badge">Admin</span>
                  ) : (
                    <span className="badge user-badge">User</span>
                  )}
                </td>

                <td>
                  {u.uploadDisabled ? (
                    <span className="badge disabled-badge">Disabled</span>
                  ) : (
                    <span className="badge enabled-badge">Enabled</span>
                  )}
                </td>

                <td className="actions">
                  {u.role === "admin" && (
                    <button
                      className="danger-btn"
                      onClick={() => removeAdmin(u.email)}
                    >
                      Remove Admin
                    </button>
                  )}

                  {u.uploadDisabled ? (
                    <button
                      className="secondary-btn"
                      onClick={() => toggleUpload(u.email, false)}
                    >
                      Enable Uploads
                    </button>
                  ) : (
                    <button
                      className="secondary-btn"
                      onClick={() => toggleUpload(u.email, true)}
                    >
                      Disable Uploads
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}