import "./Pending.css";

function Pending() {
  const uploads = [
    { id: 1, title: "Linear Algebra Notes", date: "2025-11-10", status: "Pending" },
    { id: 2, title: "Intro to Biology Slides", date: "2025-11-11", status: "Approved" },
  ];

  return (
    <div className="pending-container">
      <h1>My Uploads Status</h1>
      <p>Track the approval status of your uploaded documents.</p>

      <table className="pending-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date Uploaded</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.date}</td>
              <td>
                <span
                  className={`status-badge ${
                    item.status === "Approved" ? "approved" : "pending"
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Pending;