

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./AdminAccess.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminAccess() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    checkCurrentUser();
  }, []);

 
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAllUsers();
    }
  }, [currentUser]);

  const checkCurrentUser = async () => {
    try {
      
      const storedUser = sessionStorage.getItem("user");
      
      if (!storedUser) {
        console.error("No user found in sessionStorage");
        toast.error("Please login to access admin panel");
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);
     

     
      const { data: userData, error: userError } = await supabase
        .from('Registered')
        .select('*')
        .eq('Email', user.Email)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        
        
        const { error: insertError } = await supabase
          .from('Registered')
          .insert([
            {
              FullName: user.FullName || user.Email?.split('@')[0] || 'User',
              Email: user.Email,
              role: user.role || 'user',
              upload_disabled: false,
              created_at: new Date().toISOString()
            }
          ]);

        if (!insertError) {
          const { data: newUserData } = await supabase
            .from('Registered')
            .select('*')
            .eq('Email', user.Email)
            .single();
          
          setCurrentUser(newUserData);
        } else {
          toast.error("Error setting up user profile");
          navigate("/dashboard");
        }
      } else {
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error("Error in checkCurrentUser:", error);
      toast.error("Error loading user data");
      navigate("/login");
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Registered')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        
        if (error.message.includes('permission denied') || error.message.includes('policy')) {
          toast.error("Permission denied. You may not have admin privileges.");
          return;
        }
        
        throw error;
      }

      if (data) {
       
        const formattedUsers = data.map(user => ({
          ...user,
          role: user.role || 'user',
          upload_disabled: user.upload_disabled || false,
          created_at: user.created_at || new Date().toISOString()
        }));
        
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    setRefreshing(true);
    await fetchAllUsers();
    setRefreshing(false);
    toast.success("User list refreshed");
  };

  const filteredUsers = users.filter((user) =>
    (user.Email?.toLowerCase().includes(search.toLowerCase())) ||
    (user.FullName?.toLowerCase().includes(search.toLowerCase())) ||
    (user.role?.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleUploadPermission = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('Registered')
        .update({ upload_disabled: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

     
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, upload_disabled: !currentStatus }
          : user
      ));

      toast.success(
        `Uploads ${!currentStatus ? 'disabled' : 'enabled'} successfully`
      );
    } catch (error) {
      console.error("Error updating upload permission:", error);
      toast.error("Failed to update upload permission");
    }
  };

  const updateUserRole = async (userId, currentRole, newRole) => {
    if (currentRole === 'admin' && currentUser?.id === userId) {
      toast.error("You cannot remove your own admin privileges");
      return;
    }

    if (!confirm(`Are you sure you want to change this user's role from ${currentRole} to ${newRole}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('Registered')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));

      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const addAdminByEmail = async () => {
    const email = newAdminEmail.trim();
    
    if (!email) {
      toast.error("Please enter an email");
      return;
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
     
      const { data: userData, error: findError } = await supabase
        .from('Registered')
        .select('*')
        .eq('Email', email)
        .single();

      if (findError || !userData) {
        toast.error("User not found. Please make sure the user is registered.");
        return;
      }

      if (userData.role === 'admin') {
        toast.error("User is already an admin");
        return;
      }

     
      const { error: updateError } = await supabase
        .from('Registered')
        .update({ role: 'admin' })
        .eq('id', userData.id);

      if (updateError) throw updateError;

     
      setUsers(users.map(user => 
        user.id === userData.id 
          ? { ...user, role: 'admin' }
          : user
      ));

      setNewAdminEmail("");
      toast.success(`${email} is now an admin`);
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin: " + error.message);
    }
  };

  const demoteToUser = async (userId, userEmail) => {
    if (currentUser?.id === userId) {
      toast.error("You cannot demote yourself");
      return;
    }

    if (!confirm(`Are you sure you want to remove admin privileges from ${userEmail}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('Registered')
        .update({ role: 'user' })
        .eq('id', userId);

      if (error) throw error;

     
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: 'user' }
          : user
      ));

      toast.success("Admin privileges removed");
    } catch (error) {
      console.error("Error demoting admin:", error);
      toast.error("Failed to remove admin privileges");
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!confirm(`⚠️ WARNING: Are you sure you want to permanently delete user ${userEmail}?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
     
      const { error } = await supabase
        .from('Registered')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));

      toast.success("User deleted from database");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleLogout = () => {
   
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("admin");
    
   
    navigate("/login");
    window.location.reload(); 
  };

  if (!currentUser) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading user information...</p>
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h1>🚫 Access Denied</h1>
          <p>You don't have permission to access the admin panel.</p>
          <p>Your current role: <span className="role-badge">{currentUser.role}</span></p>
          <button 
            className="back-btn" 
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Admin Control Panel</h1>
        <div className="admin-info">
          <p>Welcome, <strong>{currentUser.FullName}</strong> ({currentUser.Email})</p>
          <div className="admin-actions">
            <button 
              className="refresh-btn" 
              onClick={refreshUsers}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <button 
              className="logout-btn" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Add Admin Section */}
      <div className="admin-section card">
        <h2>👑 Add New Admin</h2>
        <p className="section-description">Enter a user's email to grant them admin privileges</p>
        <div className="add-admin-form">
          <input
            type="email"
            className="admin-input"
            placeholder="Enter user email address"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAdminByEmail()}
          />
          <button 
            className="admin-btn primary" 
            onClick={addAdminByEmail}
            disabled={!newAdminEmail.trim()}
          >
            Grant Admin Access
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="admin-section card">
        <h2>🔍 Search Users</h2>
        <div className="search-container">
          <input
            type="text"
            className="admin-input search-input"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="stats">
            <span className="stat-item">
              Total Users: <strong style={{color: "white"}}>{users.length}</strong>
            </span>
            <span className="stat-item">
              Admins: <strong style={{color: "white"}}>{users.filter(u => u.role === 'admin').length}</strong>
            </span>
            <span className="stat-item">
              Uploads Disabled: <strong style={{color: "white"}}>{users.filter(u => u.upload_disabled).length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-section card table-section">
        <h2>👥 User Management</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Upload Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        {search ? "No users found matching your search" : "No users found"}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className={user.id === currentUser.id ? 'current-user' : ''}>
                        <td>
                          <div className="user-info">
                            <span className="user-name">{user.FullName}</span>
                            {user.id === currentUser.id && (
                              <span className="you-badge">You</span>
                            )}
                          </div>
                        </td>
                        <td className="user-email">{user.Email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                            {user.role === 'admin' && ' 👑'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.upload_disabled ? 'disabled' : 'enabled'}`}>
                            {user.upload_disabled ? '🚫 Disabled' : '✅ Enabled'}
                          </span>
                        </td>
                        <td className="join-date">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="actions">
                          <div className="action-buttons">
                            {/* Role Actions */}
                            {user.role === 'admin' ? (
                              <button
                                className="action-btn warning"
                                onClick={() => demoteToUser(user.id, user.Email)}
                                disabled={user.id === currentUser.id}
                                title={user.id === currentUser.id ? "Cannot remove your own admin role" : "Remove admin privileges"}
                              >
                                Demote to User
                              </button>
                            ) : (
                              <button
                                className="action-btn primary"
                                onClick={() => updateUserRole(user.id, user.role, 'admin')}
                                title="Make this user an admin"
                              >
                                Make Admin
                              </button>
                            )}

                            {/* Upload Permission Actions */}
                            {user.upload_disabled ? (
                              <button
                                className="action-btn success"
                                onClick={() => toggleUploadPermission(user.id, true)}
                                title="Enable uploads for this user"
                              >
                                Enable Upload
                              </button>
                            ) : (
                              <button
                                className="action-btn danger"
                                onClick={() => toggleUploadPermission(user.id, false)}
                                title="Disable uploads for this user"
                              >
                                Disable Upload
                              </button>
                            )}

                            {/* Delete button (optional - use with caution) */}
                            {user.id !== currentUser.id && (
                              <button
                                className="action-btn delete"
                                onClick={() => deleteUser(user.id, user.Email)}
                                title="Delete user from database"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length > 0 && (
              <div className="table-footer">
                <p>Showing {filteredUsers.length} of {users.length} users</p>
                {search && (
                  <button 
                    className="clear-search" 
                    onClick={() => setSearch("")}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Admin Guide */}
      <div className="admin-section card guide-section">
        <h2>📚 Admin Guide</h2>
        <div className="guide-content">
          <div className="guide-item">
            <h3>👑 Admin Privileges</h3>
            <p>Admins can view all users, manage roles, and control upload permissions.</p>
          </div>
          <div className="guide-item">
            <h3>🚫 Disable Uploads</h3>
            <p>Prevent specific users from uploading content while keeping their account active.</p>
          </div>
          <div className="guide-item">
            <h3>⚠️ Caution</h3>
            <p>Be careful when granting admin access or deleting users. These actions cannot be easily undone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}