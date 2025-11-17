import React from "react";
import { useParams } from "react-router-dom";

export default function ResourceDetail() {
  const { id } = useParams();
  
  const resource = {
    id,
    title: `Sample Resource #${id}`,
    fileType: "pdf",
    uploader: "John Doe",
    course: "CSC101",
    description: "This is a sample resource detail. Replace with API data."
  };

  return (
    <section className="page resource-detail">
      <div className="container">
        <div className="card white">
          <div className="detail-head">
            <h1>{resource.title}</h1>
            <div className="muted">{resource.course} • by {resource.uploader}</div>
          </div>

          <div className="detail-body">
            <p>{resource.description}</p>
            <div className="detail-actions">
              <a className="btn btn-primary" href="#">Preview</a>
              <a className="btn btn-ghost" href="#" download>Download</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}