// import "./Upload.css";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// function Upload() {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     file: null
//   });
//   const [uploading, setUploading] = useState(false);
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
    
//     if (file) {
//       // Validate file size (50MB limit)
//       const maxSize = 50 * 1024 * 1024; // 50MB in bytes
//       if (file.size > maxSize) {
//         setMessage("❌ File size too large. Maximum size is 50MB.");
//         e.target.value = ""; // Clear the file input
//         setFormData(prev => ({
//           ...prev,
//           file: null
//         }));
//         return;
//       }

//       // Validate file type
//       const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.zip'];
//       const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
//       if (!allowedTypes.includes(fileExtension)) {
//         setMessage("❌ Invalid file type. Allowed: PDF, PPT, DOC, TXT, ZIP");
//         e.target.value = ""; // Clear the file input
//         setFormData(prev => ({
//           ...prev,
//           file: null
//         }));
//         return;
//       }
//     }

//     setFormData(prev => ({
//       ...prev,
//       file: file
//     }));
    
//     // Clear any previous error messages when a valid file is selected
//     if (file && message.includes("❌")) {
//       setMessage("");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!formData.file) {
//       setMessage("Please select a file");
//       return;
//     }

//     // Double-check file size before upload (client-side validation)
//     const maxSize = 50 * 1024 * 1024; // 50MB in bytes
//     if (formData.file.size > maxSize) {
//       setMessage("❌ File size too large. Maximum size is 50MB.");
//       return;
//     }

//     setUploading(true);
//     setMessage("");

//     try {
//       const userData = sessionStorage.getItem("user");
//       if (!userData) {
//         navigate("/login");
//         return;
//       }

//       const user = JSON.parse(userData);
//       const isAdmin = sessionStorage.getItem("admin") === "true";

//       console.log("User data:", user);
//       console.log("Is admin:", isAdmin);

//       const fileExt = formData.file.name.split('.').pop();
//       const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
//       console.log("Attempting to upload:", fileName);
//       console.log("File size:", (formData.file.size / 1024 / 1024).toFixed(2), "MB");

//       const { error: uploadError } = await supabase.storage
//         .from('documents')
//         .upload(fileName, formData.file);

//       if (uploadError) {
//         console.error("Storage error details:", uploadError);
        
//         // Check if it's a size limit error from Supabase
//         if (uploadError.message.includes('size') || uploadError.message.includes('large')) {
//           throw new Error("File is too large. Maximum size is 50MB.");
//         }
        
//         throw new Error(`Storage upload failed: ${uploadError.message}`);
//       }

//       const { data: urlData } = supabase.storage
//         .from('documents')
//         .getPublicUrl(fileName);

//       console.log("Upload successful, URL:", urlData.publicUrl);

//       const status = isAdmin ? 'approved' : 'pending';

//       const { error: dbError } = await supabase
//         .from('uploads')
//         .insert([
//           {
//             title: formData.title,
//             description: formData.description,
//             file_name: formData.file.name,
//             file_url: urlData.publicUrl,
//             file_size: formData.file.size,
//             file_type: formData.file.type,
//             uploader_email: user.Email,
//             uploader_name: user.FullName,
//             status: status
//           }
//         ]);

//       if (dbError) {
//         console.error("Database error:", dbError);
//         throw new Error(`Database error: ${dbError.message}`);
//       }

//       if (isAdmin) {
//         setMessage(`✅ File uploaded and auto-approved by ${user.FullName}!`);
        
//         setTimeout(() => {
//           navigate("/admin");
//         }, 2000);
//       } else {
//         setMessage("✅ File uploaded successfully! Waiting for admin approval.");
//         setTimeout(() => {
//           navigate("/dashboard");
//         }, 2000);
//       }
      
//       setFormData({
//         title: "",
//         description: "",
//         file: null
//       });
      
//       document.querySelector('input[type="file"]').value = "";

//     } catch (error) {
//       console.error("Upload error:", error);
//       setMessage(`❌ Upload failed: ${error.message}`);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const isAdmin = sessionStorage.getItem("admin") === "true";
//   const userData = sessionStorage.getItem("user");
//   const user = userData ? JSON.parse(userData) : null;

//   console.log("Upload component - Admin status:", isAdmin);
//   console.log("Upload component - User data:", user);

//   return (
//     <div className="upload-container">
//       <h1>Upload Your Documents</h1>
      
//       {isAdmin && user && (
//         <div className="admin-upload-notice">
//           <p>
//             <strong>👑 Admin Mode:</strong> Uploading as <strong>{user.FullName}</strong>
//           </p>
//           <p className="admin-hint">
//             Files uploaded by admins are automatically approved and visible to all users.
//           </p>
//         </div>
//       )}
      
//       <p>Share slides or question papers with the Fresher Hub community.</p>

//       {message && (
//         <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
//           {message}
//           {(isAdmin && message.includes("✅")) && (
//             <div className="redirect-notice">
//               Redirecting to admin panel...
//             </div>
//           )}
//           {(!isAdmin && message.includes("✅")) && (
//             <div className="redirect-notice">
//               Redirecting to dashboard...
//             </div>
//           )}
//         </div>
//       )}

//       <div className="upload-box">
//         <form className="upload-form" onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Title *</label>
//             <input 
//               type="text" 
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               placeholder="Document title" 
//               required 
//               maxLength="255"
//             />
//           </div>

//           <div className="form-group">
//             <label>Description *</label>
//             <textarea 
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               placeholder="Short description of your document" 
//               required 
//               maxLength="1000"
//               rows="4"
//             />
//           </div>

//           <div className="form-group">
//             <label>Choose File *</label>
//             <input 
//               type="file" 
//               accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip" 
//               onChange={handleFileChange}
//               required 
//             />
//             {formData.file && (
//               <div className="file-info">
//                 <p><strong>Selected:</strong> {formData.file.name}</p>
//                 <p><strong>Size:</strong> {(formData.file.size / 1024 / 1024).toFixed(2)} MB / 50 MB max</p>
//                 <p><strong>Type:</strong> {formData.file.type || formData.file.name.split('.').pop().toUpperCase()}</p>
//               </div>
//             )}
//             <small className="file-hint">
//               Supported formats: PDF, PPT, DOC, TXT, ZIP (Max: 50MB)
//             </small>
//           </div>

//           <button 
//             type="submit" 
//             className="upload-btn" 
//             disabled={uploading || !formData.file}
//           >
//             {uploading ? "📤 Uploading..." : `📤 Upload Document ${isAdmin ? '👑' : ''}`}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Upload;




// hdjksaghhjs

import "./Upload.css";
import { useState, useEffect } from "react";
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
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadDisabled, setUploadDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check current user and upload permissions
  useEffect(() => {
    checkUserPermissions();
  }, []);

  const checkUserPermissions = async () => {
    setLoading(true);
    try {
      // Get auth user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error("Auth error:", authError);
        navigate("/login");
        return;
      }

      // Fetch user from Registered table
      const { data: userData, error: userError } = await supabase
        .from('Registered')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        
        // User might not exist in Registered table, create entry
        const { error: insertError } = await supabase
          .from('Registered')
          .insert([
            {
              FullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              Email: authUser.email,
              role: 'user',
              auth_id: authUser.id,
              upload_disabled: false,
              created_at: new Date().toISOString()
            }
          ]);

        if (!insertError) {
          // Retry fetching
          const { data: newUserData } = await supabase
            .from('Registered')
            .select('*')
            .eq('auth_id', authUser.id)
            .single();
          
          setUserData(newUserData);
          setIsAdmin(newUserData.role === 'admin');
          setUploadDisabled(newUserData.upload_disabled || false);
        } else {
          setMessage("❌ Error setting up user profile");
        }
      } else {
        setUserData(userData);
        setIsAdmin(userData.role === 'admin');
        setUploadDisabled(userData.upload_disabled || false);
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
      // Check if uploads are disabled for this user
      if (uploadDisabled) {
        setMessage("❌ Your upload privileges have been disabled by an administrator.");
        e.target.value = "";
        setFormData(prev => ({
          ...prev,
          file: null
        }));
        return;
      }

      // Validate file size (50MB limit)
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

      // Validate file type
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
    
    // Clear any previous error messages when a valid file is selected
    if (file && message.includes("❌")) {
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if uploads are disabled
    if (uploadDisabled) {
      setMessage("❌ Your upload privileges have been disabled by an administrator.");
      return;
    }

    if (!formData.file) {
      setMessage("Please select a file");
      return;
    }

    // Double-check file size before upload (client-side validation)
    const maxSize = 50 * 1024 * 1024;
    if (formData.file.size > maxSize) {
      setMessage("❌ File size too large. Maximum size is 50MB.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Re-check user permissions before upload
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        navigate("/login");
        return;
      }

      // Get fresh user data to ensure permissions haven't changed
      const { data: freshUserData, error: userError } = await supabase
        .from('Registered')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (userError || !freshUserData) {
        throw new Error("User data not found");
      }

      // Check if uploads are still enabled
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

      const status = isUserAdmin ? 'approved' : 'pending';

      // Create the upload data object with only columns that exist in your table
      const uploadData = {
        title: formData.title,
        description: formData.description,
        file_name: formData.file.name,
        file_url: urlData.publicUrl,
        file_size: formData.file.size,
        file_type: formData.file.type,
        uploader_email: freshUserData.Email,
        uploader_name: freshUserData.FullName,
        status: status,
        created_at: new Date().toISOString()
      };

      // Remove any undefined values
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
        description: "",
        file: null
      });
      
      document.querySelector('input[type="file"]').value = "";

    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`❌ Upload failed: ${error.message}`);
      
      // Update local state if upload was disabled during the process
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

  // If user is not logged in or data not found
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
      <h1>Upload Your Documents</h1>
      
      {/* Upload disabled warning */}
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
      
      {/* Admin notice */}
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

      {/* Only show upload form if uploads are not disabled */}
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
              <label>Description *</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Short description of your document" 
                required 
                maxLength="1000"
                rows="4"
                disabled={uploading}
              />
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

      {/* User info footer */}
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

// kakhahjas


// import "./Upload.css";
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import toast from "react-hot-toast";

// function Upload() {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     file: null
//   });
//   const [uploading, setUploading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [uploadDisabled, setUploadDisabled] = useState(false);
//   const [user, setUser] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // Check user permissions on component mount
//   useEffect(() => {
//     checkUserPermissions();
//   }, []);

//   const checkUserPermissions = async () => {
//     try {
//       // Get current user from auth
//       const { data: { user: authUser } } = await supabase.auth.getUser();
      
//       if (!authUser) {
//         navigate("/login");
//         return;
//       }

//       // Get user data from Registered table
//       const { data: userData, error } = await supabase
//         .from('Registered')
//         .select('*')
//         .eq('auth_id', authUser.id)
//         .single();

//       if (error) {
//         console.error("Error fetching user data:", error);
//         toast.error("Error loading user profile");
//         navigate("/dashboard");
//         return;
//       }

//       if (userData) {
//         const completeUserData = {
//           ...userData,
//           role: userData.role || 'user',
//           upload_disabled: userData.upload_disabled || false
//         };

//         setUser(completeUserData);
//         setIsAdmin(completeUserData.role === 'admin');
//         setUploadDisabled(completeUserData.upload_disabled);

//         // Update session storage for backward compatibility
//         sessionStorage.setItem("user", JSON.stringify({
//           id: authUser.id,
//           FullName: completeUserData.FullName || authUser.user_metadata?.full_name || "User",
//           Email: authUser.email,
//           role: completeUserData.role
//         }));

//         if (completeUserData.role === 'admin') {
//           sessionStorage.setItem("admin", "true");
//         } else {
//           sessionStorage.removeItem("admin");
//         }

//         // Show message if uploads are disabled
//         if (completeUserData.upload_disabled) {
//           toast.error("Your upload privileges have been disabled by admin");
//         }
//       }
//     } catch (error) {
//       console.error("Error checking permissions:", error);
//       toast.error("Error loading user permissions");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
    
//     if (file) {
//       // Validate file size (50MB limit)
//       const maxSize = 50 * 1024 * 1024; // 50MB in bytes
//       if (file.size > maxSize) {
//         setMessage("❌ File size too large. Maximum size is 50MB.");
//         e.target.value = ""; // Clear the file input
//         setFormData(prev => ({
//           ...prev,
//           file: null
//         }));
//         return;
//       }

//       // Validate file type
//       const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.zip'];
//       const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
//       if (!allowedTypes.includes(fileExtension)) {
//         setMessage("❌ Invalid file type. Allowed: PDF, PPT, DOC, TXT, ZIP");
//         e.target.value = ""; // Clear the file input
//         setFormData(prev => ({
//           ...prev,
//           file: null
//         }));
//         return;
//       }
//     }

//     setFormData(prev => ({
//       ...prev,
//       file: file
//     }));
    
//     // Clear any previous error messages when a valid file is selected
//     if (file && message.includes("❌")) {
//       setMessage("");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Check if uploads are disabled for this user
//     if (uploadDisabled) {
//       setMessage("❌ Your upload privileges have been disabled by admin. Please contact support.");
//       toast.error("Uploads disabled by admin");
//       return;
//     }

//     if (!formData.file) {
//       setMessage("Please select a file");
//       toast.error("Please select a file");
//       return;
//     }

//     // Double-check file size before upload (client-side validation)
//     const maxSize = 50 * 1024 * 1024; // 50MB in bytes
//     if (formData.file.size > maxSize) {
//       setMessage("❌ File size too large. Maximum size is 50MB.");
//       toast.error("File too large (max 50MB)");
//       return;
//     }

//     setUploading(true);
//     setMessage("");

//     try {
//       // Re-check upload permissions before proceeding
//       if (user) {
//         const { data: currentUserData } = await supabase
//           .from('Registered')
//           .select('upload_disabled')
//           .eq('id', user.id)
//           .single();

//         if (currentUserData?.upload_disabled) {
//           setUploadDisabled(true);
//           throw new Error("Your upload privileges have been disabled by admin");
//         }
//       }

//       const fileExt = formData.file.name.split('.').pop();
//       const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
//       console.log("Attempting to upload:", fileName);
//       console.log("File size:", (formData.file.size / 1024 / 1024).toFixed(2), "MB");

//       const { error: uploadError } = await supabase.storage
//         .from('documents')
//         .upload(fileName, formData.file);

//       if (uploadError) {
//         console.error("Storage error details:", uploadError);
        
//         // Check if it's a size limit error from Supabase
//         if (uploadError.message.includes('size') || uploadError.message.includes('large')) {
//           throw new Error("File is too large. Maximum size is 50MB.");
//         }
        
//         throw new Error(`Storage upload failed: ${uploadError.message}`);
//       }

//       const { data: urlData } = supabase.storage
//         .from('documents')
//         .getPublicUrl(fileName);

//       console.log("Upload successful, URL:", urlData.publicUrl);

//       const status = isAdmin ? 'approved' : 'pending';

//       const { error: dbError } = await supabase
//         .from('uploads')
//         .insert([
//           {
//             title: formData.title,
//             description: formData.description,
//             file_name: formData.file.name,
//             file_url: urlData.publicUrl,
//             file_size: formData.file.size,
//             file_type: formData.file.type,
//             uploader_email: user?.Email || '',
//             uploader_name: user?.FullName || 'Unknown User',
//             uploader_id: user?.id,
//             status: status,
//             uploaded_at: new Date().toISOString()
//           }
//         ]);

//       if (dbError) {
//         console.error("Database error:", dbError);
//         throw new Error(`Database error: ${dbError.message}`);
//       }

//       if (isAdmin) {
//         setMessage(`✅ File uploaded and auto-approved by ${user?.FullName}!`);
//         toast.success("File uploaded and auto-approved!");
        
//         setTimeout(() => {
//           navigate("/admin");
//         }, 2000);
//       } else {
//         setMessage("✅ File uploaded successfully! Waiting for admin approval.");
//         toast.success("File uploaded! Awaiting admin approval.");
        
//         setTimeout(() => {
//           navigate("/dashboard");
//         }, 2000);
//       }
      
//       // Reset form
//       setFormData({
//         title: "",
//         description: "",
//         file: null
//       });
      
//       document.querySelector('input[type="file"]').value = "";

//     } catch (error) {
//       console.error("Upload error:", error);
//       setMessage(`❌ Upload failed: ${error.message}`);
//       toast.error(error.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="upload-container">
//         <div className="loading-state">
//           <div className="spinner"></div>
//           <p>Loading upload permissions...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show disabled message if uploads are disabled
//   if (uploadDisabled) {
//     return (
//       <div className="upload-container">
//         <h1>Upload Your Documents</h1>
        
//         <div className="upload-disabled-message">
//           <div className="disabled-icon">🚫</div>
//           <h2>Uploads Disabled</h2>
//           <p>Your upload privileges have been temporarily disabled by the administrator.</p>
//           <p className="disabled-reason">
//             If you believe this is an error, please contact support or your system administrator.
//           </p>
          
//           <div className="action-buttons">
//             <button 
//               className="back-btn" 
//               onClick={() => navigate("/dashboard")}
//             >
//               Return to Dashboard
//             </button>
//             <button 
//               className="contact-btn" 
//               onClick={() => navigate("/contact")}
//             >
//               Contact Support
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="upload-container">
//       <h1>Upload Your Documents</h1>
      
//       {isAdmin && user && (
//         <div className="admin-upload-notice">
//           <p>
//             <strong>👑 Admin Mode:</strong> Uploading as <strong>{user.FullName}</strong>
//           </p>
//           <p className="admin-hint">
//             Files uploaded by admins are automatically approved and visible to all users.
//           </p>
//         </div>
//       )}
      
//       {!isAdmin && user && (
//         <div className="user-upload-notice">
//           <p>
//             <strong>📤 User Mode:</strong> Uploading as <strong>{user.FullName}</strong>
//           </p>
//           <p className="user-hint">
//             Files will be reviewed by an admin before becoming visible to other users.
//           </p>
//         </div>
//       )}
      
//       <p>Share slides or question papers with the Fresher Hub community.</p>

//       {message && (
//         <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
//           {message}
//           {(isAdmin && message.includes("✅")) && (
//             <div className="redirect-notice">
//               Redirecting to admin panel...
//             </div>
//           )}
//           {(!isAdmin && message.includes("✅")) && (
//             <div className="redirect-notice">
//               Redirecting to dashboard...
//             </div>
//           )}
//         </div>
//       )}

//       <div className="upload-box">
//         <form className="upload-form" onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Title *</label>
//             <input 
//               type="text" 
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               placeholder="Document title" 
//               required 
//               maxLength="255"
//             />
//           </div>

//           <div className="form-group">
//             <label>Description *</label>
//             <textarea 
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               placeholder="Short description of your document" 
//               required 
//               maxLength="1000"
//               rows="4"
//             />
//           </div>

//           <div className="form-group">
//             <label>Choose File *</label>
//             <input 
//               type="file" 
//               accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip" 
//               onChange={handleFileChange}
//               required 
//             />
//             {formData.file && (
//               <div className="file-info">
//                 <p><strong>Selected:</strong> {formData.file.name}</p>
//                 <p><strong>Size:</strong> {(formData.file.size / 1024 / 1024).toFixed(2)} MB / 50 MB max</p>
//                 <p><strong>Type:</strong> {formData.file.type || formData.file.name.split('.').pop().toUpperCase()}</p>
//               </div>
//             )}
//             <small className="file-hint">
//               Supported formats: PDF, PPT, DOC, TXT, ZIP (Max: 50MB)
//             </small>
//           </div>

//           <button 
//             type="submit" 
//             className={`upload-btn ${isAdmin ? 'admin-btn' : ''}`} 
//             disabled={uploading || !formData.file}
//           >
//             {uploading ? "📤 Uploading..." : `📤 Upload Document ${isAdmin ? '👑' : ''}`}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Upload;