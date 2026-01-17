


import "./Upload.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import DarkModeToggle from "../components/DarkModeToggle";

function Upload() {
  const [formData, setFormData] = useState({
    title: "",
    courseCode: "",
    level: "",
    department: "",
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadDisabled, setUploadDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dropdown options
  const levels = [
    "100 Level",
    "200 Level",
    "300 Level",
    "400 Level",
    "500 Level",
    "600 Level"
  ];

  const departments = [
    "Accounting",
    "Biochemistry",
    "Business Administration",
    "Computer Science",
    "Cyber Security",
    "Economics",
    "English & Literary Studies",
    "Law",
    "Mass Communication",
    "Medical laboratory Science",
    "Microbiology",
    "Nursing Science",
    "Political Science",
    "Psychology",
    "Public Health",
    "Sociology",
    "Software Engineering",
    "Other"
  ];
  
  useEffect(() => {
    checkUserPermissions();
  }, []);

  const checkUserPermissions = async () => {
    setLoading(true);
    try {
      const storedUser = sessionStorage.getItem("user");
      
      if (!storedUser) {
        console.error("No user found in sessionStorage");
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      
      const { data: dbUserData, error: userError } = await supabase
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
          
          setUserData(newUserData);
          setIsAdmin(newUserData.role === 'admin');
          setUploadDisabled(newUserData.upload_disabled || false);
        } else {
          console.error("Insert error:", insertError);
          setMessage("❌ Error setting up user profile");
        }
      } else {
        setUserData(dbUserData);
        setIsAdmin(dbUserData.role === 'admin');
        setUploadDisabled(dbUserData.upload_disabled || false);
      }
    } catch (error) {
      console.error("Error checking user permissions:", error);
      setMessage("❌ Error loading user data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (uploadDisabled) {
        setMessage("❌ Your upload privileges have been disabled by an administrator.");
        e.target.value = "";
        setFormData(prev => ({
          ...prev,
          file: null
        }));
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setMessage("❌ File size too large. Maximum size is 50MB.");
        e.target.value = "";
        setFormData(prev => ({
          ...prev,
          file: null
        }));
        return;
      }

      const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.zip'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setMessage("❌ Invalid file type. Allowed: PDF, PPT, DOC, TXT, ZIP");
        e.target.value = "";
        setFormData(prev => ({
          ...prev,
          file: null
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      file: file
    }));
    
    if (file && message.includes("❌")) {
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadDisabled) {
      setMessage("❌ Your upload privileges have been disabled by an administrator.");
      return;
    }

    if (!formData.file) {
      setMessage("Please select a file");
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (formData.file.size > maxSize) {
      setMessage("❌ File size too large. Maximum size is 50MB.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const storedUser = sessionStorage.getItem("user");
      
      if (!storedUser) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const { data: freshUserData, error: userError } = await supabase
        .from('Registered')
        .select('*')
        .eq('Email', user.Email)
        .single();

      if (userError || !freshUserData) {
        throw new Error("User data not found");
      }

      if (freshUserData.upload_disabled) {
        setUploadDisabled(true);
        throw new Error("Your upload privileges have been disabled by an administrator.");
      }

      const isUserAdmin = freshUserData.role === 'admin';
      setIsAdmin(isUserAdmin);
      
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      console.log("Attempting to upload:", fileName);
      console.log("File size:", (formData.file.size / 1024 / 1024).toFixed(2), "MB");

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, formData.file);

      if (uploadError) {
        console.error("Storage error details:", uploadError);
        
        if (uploadError.message.includes('size') || uploadError.message.includes('large')) {
          throw new Error("File is too large. Maximum size is 50MB.");
        }
        
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      console.log("Upload successful, URL:", urlData.publicUrl);

      const status = isUserAdmin ? 'approved' : 'pending';

      // ✅ FIXED: Now includes the 'level' field
      const uploadData = {
        title: formData.title,
        course_code: formData.courseCode,
        level: formData.level,  // ✅ ADDED: This was missing!
        department: formData.department,
        file_name: formData.file.name,
        file_url: urlData.publicUrl,
        file_size: formData.file.size,
        file_type: formData.file.type,
        uploader_email: freshUserData.Email,
        uploader_name: freshUserData.FullName,
        status: status,
        created_at: new Date().toISOString()
      };

      // Remove undefined/null values
      Object.keys(uploadData).forEach(key => {
        if (uploadData[key] === undefined || uploadData[key] === null) {
          delete uploadData[key];
        }
      });

      console.log("Inserting upload data:", uploadData);

      const { error: dbError } = await supabase
        .from('uploads')
        .insert([uploadData]);

      if (dbError) {
        console.error("Database error details:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (isUserAdmin) {
        setMessage(`✅ File uploaded and auto-approved by ${freshUserData.FullName}!`);
        
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        setMessage("✅ File uploaded successfully! Waiting for admin approval.");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
      
      setFormData({
        title: "",
        courseCode: "",
        level: "",
        department: "",
        file: null
      });
      
      document.querySelector('input[type="file"]').value = "";

    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`❌ Upload failed: ${error.message}`);
      
      if (error.message.includes("upload privileges have been disabled")) {
        setUploadDisabled(true);
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="upload-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading upload page...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="upload-container">
        <div className="error-message">
          <h2>❌ User Not Found</h2>
          <p>Please log in to access the upload page.</p>
          <button 
            className="login-btn" 
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <DarkModeToggle />
      <h1>Upload Your Documents</h1>
      
      {uploadDisabled && (
        <div className="upload-disabled-warning">
          <h2>🚫 Uploads Disabled</h2>
          <p>
            Your upload privileges have been disabled by an administrator.
            <br />
            You can still view and download documents, but you cannot upload new ones.
          </p>
          <p className="contact-admin">
            If you believe this is a mistake, please contact an administrator.
          </p>
        </div>
      )}
      
      {isAdmin && userData && (
        <div className="admin-upload-notice">
          <p>
            <strong>👑 Admin Mode:</strong> Uploading as <strong>{userData.FullName}</strong>
          </p>
          <p className="admin-hint">
            Files uploaded by admins are automatically approved and visible to all users.
          </p>
        </div>
      )}
      
      <p>Share slides or question papers with the Resource Hub community.</p>

      {message && (
        <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
          {message}
          {(isAdmin && message.includes("✅")) && (
            <div className="redirect-notice">
              Redirecting to admin panel...
            </div>
          )}
          {(!isAdmin && message.includes("✅")) && (
            <div className="redirect-notice">
              Redirecting to dashboard...
            </div>
          )}
        </div>
      )}

      {!uploadDisabled ? (
        <div className="upload-box">
          <form className="upload-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Document title" 
                required 
                maxLength="255"
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label>Course Code *</label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                placeholder="e.g. CSC 301, PHY 204, ACC 411"
                required
                maxLength="20"
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label>Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                required
                disabled={uploading}
              >
                <option value="">Select level</option>
                {levels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                disabled={uploading}
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Choose File *</label>
              <input 
                type="file" 
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip" 
                onChange={handleFileChange}
                required 
                disabled={uploading}
              />
              {formData.file && (
                <div className="file-info">
                  <p><strong>Selected:</strong> {formData.file.name}</p>
                  <p><strong>Size:</strong> {(formData.file.size / 1024 / 1024).toFixed(2)} MB / 50 MB max</p>
                  <p><strong>Type:</strong> {formData.file.type || formData.file.name.split('.').pop().toUpperCase()}</p>
                </div>
              )}
              <small className="file-hint">
                Supported formats: PDF, PPT, DOC, TXT, ZIP (Max: 50MB)
              </small>
            </div>

            <button 
              type="submit" 
              className="upload-btn" 
              disabled={uploading || !formData.file || uploadDisabled}
            >
              {uploading ? "📤 Uploading..." : `📤 Upload Document ${isAdmin ? '👑' : ''}`}
            </button>
          </form>
        </div>
      ) : (
        <div className="upload-disabled-alternative">
          <div className="alternative-actions">
            <h3>What you can do instead:</h3>
            <ul>
              <li>📖 Browse existing documents in the dashboard</li>
              <li>⬇️ Download approved materials</li>
              <li>🔍 Search for specific documents</li>
              <li>📞 Contact an admin for assistance</li>
            </ul>
            <button 
              className="dashboard-btn" 
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="user-info-footer">
        <p>
          Uploading as: <strong>{userData.FullName}</strong> ({userData.Email})
          <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
            {isAdmin ? '👑 Admin' : 'User'}
          </span>
          <span className={`upload-status ${uploadDisabled ? 'disabled' : 'enabled'}`}>
            {uploadDisabled ? '🚫 Uploads Disabled' : '✅ Uploads Enabled'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Upload;