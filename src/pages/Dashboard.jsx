import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1>Your Dashboard</h1>
      <p>Welcome back! Here you can manage your uploads and view your files.</p>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Uploads</h3>
          <p>View and edit your uploaded materials.</p>
        </div>
        <div className="card">
          <h3>Downloads</h3>
          <p>See what other users have downloaded recently.</p>
        </div>
        <div className="card">
          <h3>Pending Approval</h3>
          <p>Files awaiting admin verification.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;