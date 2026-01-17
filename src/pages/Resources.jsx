

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ResourceCard from "../components/ResourceCard";
import Pagination from "../components/Pagination";
import DarkModeToggle from "../components/DarkModeToggle";
import "./EnhancedResources.css";

function EnhancedResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedFileType, setSelectedFileType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Available filter options
  const departments = [
    "All",
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
    "Other",
  ];

  const levels = [
    "All",
    "100 Level",
    "200 Level",
    "300 Level",
    "400 Level",
    "500 Level",
    "600 Level",
  ];

  const fileTypes = ["All", "PDF", "PPT", "DOC", "TXT", "ZIP"];
  const statuses = ["All", "approved", "pending", "rejected"];

  useEffect(() => {
    checkUserAndFetchResources();
  }, []);

  const checkUserAndFetchResources = async () => {
    try {
      const userData = sessionStorage.getItem("user");
      
      if (userData) {
        const user = JSON.parse(userData);
        const { data: userRole } = await supabase
          .from("Registered")
          .select("role")
          .eq("Email", user.Email)
          .single();

        setIsAdmin(userRole?.role === "admin");
      }

      await fetchResources();
    } catch (error) {
      console.error("Error in initialization:", error);
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      let query = supabase
        .from("uploads")
        .select("*")
        .order("created_at", { ascending: false });

      // Non-admin users only see approved resources
      if (!isAdmin) {
        query = query.eq("status", "approved");
      }

      const { data, error } = await query;

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileTypeDisplay = (fileName) => {
    if (!fileName) return "";
    const ext = fileName.split(".").pop().toLowerCase();
    const typeMap = {
      pdf: "PDF",
      ppt: "PPT",
      pptx: "PPT",
      doc: "DOC",
      docx: "DOC",
      txt: "TXT",
      zip: "ZIP",
    };
    return typeMap[ext] || ext.toUpperCase();
  };

  // Apply all filters and sorting
  const filteredAndSortedResources = useMemo(() => {
    let result = [...resources];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (resource) =>
          resource.title?.toLowerCase().includes(term) ||
          resource.course_code?.toLowerCase().includes(term) ||
          resource.uploader_name?.toLowerCase().includes(term) ||
          resource.department?.toLowerCase().includes(term) ||
          resource.level?.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (selectedDepartment !== "All") {
      result = result.filter((r) => r.department === selectedDepartment);
    }

    // Level filter
    if (selectedLevel !== "All") {
      result = result.filter((r) => r.level === selectedLevel);
    }

    // File type filter
    if (selectedFileType !== "All") {
      result = result.filter(
        (r) => getFileTypeDisplay(r.file_name) === selectedFileType
      );
    }

    // Status filter (admin only)
    if (isAdmin && selectedStatus !== "All") {
      result = result.filter((r) => r.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "size-desc":
          return (b.file_size || 0) - (a.file_size || 0);
        case "size-asc":
          return (a.file_size || 0) - (b.file_size || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [
    resources,
    searchTerm,
    selectedDepartment,
    selectedLevel,
    selectedFileType,
    selectedStatus,
    sortBy,
    isAdmin,
  ]);

  // Paginated results
  const paginatedResources = filteredAndSortedResources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedResources.length / itemsPerPage);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("All");
    setSelectedLevel("All");
    setSelectedFileType("All");
    setSelectedStatus("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedDepartment !== "All" ||
    selectedLevel !== "All" ||
    selectedFileType !== "All" ||
    (isAdmin && selectedStatus !== "All");

  const handleDownload = (resource) => {
    const link = document.createElement("a");
    link.href = resource.file_url;
    link.download = resource.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track download count
    supabase
      .from("uploads")
      .update({
        download_count: (resource.download_count || 0) + 1,
      })
      .eq("id", resource.id)
      .then(() => {
        // Refresh resources to show updated count
        fetchResources();
      });
  };

  if (loading) {
    return (
      <div className="resources-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-page">
      <DarkModeToggle />

      {/* Header */}
      <header className="resources-header">
        <div className="header-content">
          <h1 className="page-title">📚 Resource Library</h1>
          <p className="page-subtitle">
            Browse and download study materials shared by the community
          </p>
        </div>
        {sessionStorage.getItem("user") && (
          <button
            className="upload-cta-btn"
            onClick={() => navigate("/upload")}
          >
            📤 Upload Resource
          </button>
        )}
      </header>

      {/* Filters Section */}
      <section className="filters-section">
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by title, course code, or uploader..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="filters-grid">
          <div className="filter-control">
            <label className="filter-label">🏛️ Department</label>
            <select
              className="filter-select"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label className="filter-label">🎓 Level</label>
            <select
              className="filter-select"
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setCurrentPage(1);
              }}
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label className="filter-label">📄 File Type</label>
            <select
              className="filter-select"
              value={selectedFileType}
              onChange={(e) => {
                setSelectedFileType(e.target.value);
                setCurrentPage(1);
              }}
            >
              {fileTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div className="filter-control">
              <label className="filter-label">🔍 Status</label>
              <select
                className="filter-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-control">
            <label className="filter-label">⚡ Sort By</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="active-filters">
            <span className="active-filters-label">Active Filters:</span>
            <div className="filter-badges">
              {searchTerm && (
                <span className="filter-badge">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")}>×</button>
                </span>
              )}
              {selectedDepartment !== "All" && (
                <span className="filter-badge">
                  Dept: {selectedDepartment}
                  <button onClick={() => setSelectedDepartment("All")}>×</button>
                </span>
              )}
              {selectedLevel !== "All" && (
                <span className="filter-badge">
                  Level: {selectedLevel}
                  <button onClick={() => setSelectedLevel("All")}>×</button>
                </span>
              )}
              {selectedFileType !== "All" && (
                <span className="filter-badge">
                  Type: {selectedFileType}
                  <button onClick={() => setSelectedFileType("All")}>×</button>
                </span>
              )}
              {isAdmin && selectedStatus !== "All" && (
                <span className="filter-badge">
                  Status: {selectedStatus}
                  <button onClick={() => setSelectedStatus("All")}>×</button>
                </span>
              )}
            </div>
            <button className="clear-all-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        )}
      </section>

      {/* Results Summary */}
      <div className="results-summary">
        <p className="results-text">
          Showing <strong>{paginatedResources.length}</strong> of{" "}
          <strong>{filteredAndSortedResources.length}</strong> resources
          {filteredAndSortedResources.length !== resources.length && (
            <span className="filtered-text"> (filtered from {resources.length} total)</span>
          )}
        </p>
      </div>

      {/* Resources Grid */}
      {filteredAndSortedResources.length > 0 ? (
        <>
          <div className="resources-grid">
            {paginatedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onDownload={handleDownload}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        /* No Results */
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3 className="no-results-title">No resources found</h3>
          <p className="no-results-text">
            {hasActiveFilters
              ? "No resources match your current filters. Try adjusting your search criteria."
              : "No resources available yet. Be the first to upload!"}
          </p>
          <div className="no-results-actions">
            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
            {sessionStorage.getItem("user") && (
              <button
                className="upload-btn"
                onClick={() => navigate("/upload")}
              >
                Upload First Resource
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedResources;