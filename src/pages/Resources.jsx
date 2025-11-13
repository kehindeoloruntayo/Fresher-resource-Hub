import React, { useState } from "react";
import "./Resources.css";

function Resources() {
  const [category, setCategory] = useState("All");
  const [fileType, setFileType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const resources = [
    { id: 1, title: "Physics Notes", category: "Science", type: "PDF", author: "John", date: "Nov 10", file: "physics.pdf" },
    { id: 2, title: "Commerce Slides", category: "Commerce", type: "PPT", author: "Mary", date: "Nov 9", file: "commerce.ppt" },
    { id: 3, title: "Chemistry Paper", category: "Science", type: "PDF", author: "Jane", date: "Nov 11", file: "chemistry.pdf" },
    { id: 4, title: "Business Notes", category: "Commerce", type: "PDF", author: "Alex", date: "Nov 12", file: "business.pdf" },
    { id: 5, title: "Biology Revision", category: "Science", type: "PPT", author: "Tayo", date: "Nov 13", file: "bio.ppt" },
    { id: 6, title: "Economics Theory", category: "Commerce", type: "PDF", author: "Peace", date: "Nov 13", file: "eco.pdf" },
    { id: 1, title: "Introduction To Computer", category: "Science", type: "PDF", author: "Deji", date: "Nov 13", file: "programming.pdf" },
  ];

  // Filtering logic
  const filteredResources = resources.filter((r) => {
    const categoryMatch = category === "All" || r.category === category;
    const typeMatch = fileType === "All" || r.type === fileType;
    const searchMatch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && typeMatch && searchMatch;
  });

  const displayed = filteredResources.slice(0, visibleCount);

  return React.createElement(
    "div",
    { className: "resources-container" },
    [
      // --- Filter Section ---
      React.createElement(
        "div",
        { key: "filters", className: "filter-section" },
        [
          React.createElement("h1", { key: "title", className: "page-title" }, "Available Resources"),
          React.createElement(
            "input",
            {
              key: "search",
              type: "text",
              placeholder: "Search by title, author, or category...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "search-input",
            }
          ),
          React.createElement(
            "div",
            { key: "dropdowns", className: "dropdowns" },
            [
              React.createElement(
                "select",
                {
                  key: "category",
                  value: category,
                  onChange: (e) => setCategory(e.target.value),
                },
                [
                  React.createElement("option", { key: "all" }, "All"),
                  React.createElement("option", { key: "science" }, "Science"),
                  React.createElement("option", { key: "commerce" }, "Commerce"),
                ]
              ),
              React.createElement(
                "select",
                {
                  key: "type",
                  value: fileType,
                  onChange: (e) => setFileType(e.target.value),
                },
                [
                  React.createElement("option", { key: "all" }, "All"),
                  React.createElement("option", { key: "pdf" }, "PDF"),
                  React.createElement("option", { key: "ppt" }, "PPT"),
                ]
              ),
            ]
          ),
        ]
      ),

      // --- Resource Cards ---
      React.createElement(
        "div",
        { key: "grid", className: "resources-grid" },
        displayed.map((res) =>
          React.createElement(
            "div",
            {
              key: res.id,
              className: "resource-card",
              onClick: () => setSelectedDoc(res),
            },
            [
              React.createElement("h3", { key: "title" }, res.title),
              React.createElement("p", { key: "cat" }, `Category: ${res.category}`),
              React.createElement("p", { key: "type" }, `Type: ${res.type}`),
              React.createElement("p", { key: "author" }, `By ${res.author}`),
              React.createElement("p", { key: "date" }, `Uploaded: ${res.date}`),
            ]
          )
        )
      ),

      // --- Load More Button ---
      visibleCount < filteredResources.length
        ? React.createElement(
            "button",
            {
              key: "loadMore",
              className: "load-more",
              onClick: () => setVisibleCount((prev) => prev + 4),
            },
            "Load More"
          )
        : null,

      // --- Modal Preview ---
      selectedDoc
        ? React.createElement(
            "div",
            { key: "modal", className: "modal-overlay", onClick: () => setSelectedDoc(null) },
            React.createElement(
              "div",
              { className: "modal-content", onClick: (e) => e.stopPropagation() },
              [
                React.createElement("h2", { key: "modTitle" }, selectedDoc.title),
                React.createElement("p", { key: "modCat" }, `Category: ${selectedDoc.category}`),
                React.createElement("p", { key: "modType" }, `File Type: ${selectedDoc.type}`),
                React.createElement("p", { key: "modAuth" }, `Uploaded by: ${selectedDoc.author}`),
                React.createElement("p", { key: "modDate" }, `Date: ${selectedDoc.date}`),
                React.createElement(
                  "a",
                  {
                    key: "download",
                    href: `/${selectedDoc.file}`,
                    download: true,
                    className: "download-btn",
                  },
                  "Download"
                ),
                React.createElement(
                  "button",
                  { key: "close", className: "close-btn", onClick: () => setSelectedDoc(null) },
                  "Close"
                ),
              ]
            )
          )
        : null,
    ]
  );
}

export default Resources;