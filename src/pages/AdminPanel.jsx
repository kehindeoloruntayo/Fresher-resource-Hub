import "./AdminPanel.css";

function AdminPanel() {
  const dummyData = [
    { id: 1, title: "Calculus Notes", uploader: "Alice", status: "Pending" },
    { id: 2, title: "Physics Slides", uploader: "Bob", status: "Pending" },
  ];

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <p>Approve or delete uploaded documents.</p>

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
          {dummyData.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.title}</td>
              <td>{doc.uploader}</td>
              <td>{doc.status}</td>
              <td>
                <button className="approve-btn">Approve</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPanel;