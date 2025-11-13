import "./Upload.css";

function Upload() {
  return (
    <div className="upload-container">
      <h1>Upload Your Documents</h1>
      <p>Share slides or question papers with the Fresher Hub community.</p>

      <div className="upload-box">
        <form className="upload-form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" placeholder="Document title" required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Short description" required></textarea>
          </div>

          <div className="form-group">
            <label>Choose File</label>
            <input type="file" accept=".pdf,.ppt,.pptx" required />
          </div>

          <button type="submit" className="upload-btn">Upload</button>
        </form>
      </div>
    </div>
  );
}

export default Upload;