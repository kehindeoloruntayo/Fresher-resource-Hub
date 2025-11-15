import "./Upload.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Upload() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        setMessage("❌ File size too large. Maximum size is 50MB.");
        e.target.value = ""; // Clear the file input
        setFormData(prev => ({
          ...prev,
          file: null
        }));
        return;
      }

      // Validate file type
      const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.zip'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setMessage("❌ Invalid file type. Allowed: PDF, PPT, DOC, TXT, ZIP");
        e.target.value = ""; // Clear the file input
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
    
    // Clear any previous error messages when a valid file is selected
    if (file && message.includes("❌")) {
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      setMessage("Please select a file");
      return;
    }

    // Double-check file size before upload (client-side validation)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (formData.file.size > maxSize) {
      setMessage("❌ File size too large. Maximum size is 50MB.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const userData = sessionStorage.getItem("user");
      if (!userData) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userData);
      const isAdmin = sessionStorage.getItem("admin") === "true";

      console.log("User data:", user);
      console.log("Is admin:", isAdmin);

      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      console.log("Attempting to upload:", fileName);
      console.log("File size:", (formData.file.size / 1024 / 1024).toFixed(2), "MB");

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, formData.file);

      if (uploadError) {
        console.error("Storage error details:", uploadError);
        
        // Check if it's a size limit error from Supabase
        if (uploadError.message.includes('size') || uploadError.message.includes('large')) {
          throw new Error("File is too large. Maximum size is 50MB.");
        }
        
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      console.log("Upload successful, URL:", urlData.publicUrl);

      const status = isAdmin ? 'approved' : 'pending';

      const { error: dbError } = await supabase
        .from('uploads')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            file_name: formData.file.name,
            file_url: urlData.publicUrl,
            file_size: formData.file.size,
            file_type: formData.file.type,
            uploader_email: user.Email,
            uploader_name: user.FullName,
            status: status
          }
        ]);

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (isAdmin) {
        setMessage(`✅ File uploaded and auto-approved by ${user.FullName}!`);
        
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
        description: "",
        file: null
      });
      
      document.querySelector('input[type="file"]').value = "";

    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const isAdmin = sessionStorage.getItem("admin") === "true";
  const userData = sessionStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  console.log("Upload component - Admin status:", isAdmin);
  console.log("Upload component - User data:", user);

  return (
    <div className="upload-container">
      <h1>Upload Your Documents</h1>
      
      {isAdmin && user && (
        <div className="admin-upload-notice">
          <p>
            <strong>👑 Admin Mode:</strong> Uploading as <strong>{user.FullName}</strong>
          </p>
          <p className="admin-hint">
            Files uploaded by admins are automatically approved and visible to all users.
          </p>
        </div>
      )}
      
      <p>Share slides or question papers with the Fresher Hub community.</p>

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
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Short description of your document" 
              required 
              maxLength="1000"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Choose File *</label>
            <input 
              type="file" 
              accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip" 
              onChange={handleFileChange}
              required 
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
            disabled={uploading || !formData.file}
          >
            {uploading ? "📤 Uploading..." : `📤 Upload Document ${isAdmin ? '👑' : ''}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Upload;