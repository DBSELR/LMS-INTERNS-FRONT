// File: pages/ReportsFacultyDetails.jsx
import React, { useEffect, useState } from "react";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import API_BASE_URL from "../../config";

function ReportsFacultyDetails() {
  const [professors, setProfessors] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/professor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProfessors(data);
    } catch (err) {
      console.error("Failed to fetch professors", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = professors.filter((p) => {
    const matchSearch =
      !search ||
      p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      !status ||
      (status === "Active" && p.isActive) ||
      (status === "Inactive" && !p.isActive);

    return matchSearch && matchStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleExport = () => {
    const headers = ["Full Name", "Email", "Phone", "Office", "Status", "Rating", "Courses", "Research", "Education", "Account Created"];
    const rows = filtered.map((p) => [
      p.fullName,
      p.email,
      p.phoneNumber,
      p.officeLocation,
      p.employeeStatus,
      p.teachingRating ?? "-",
      p.assignedCourses?.map((c) => c.name).join("; ") ?? "-",
      p.researchInterests,
      p.educationalBackground,
      new Date(p.accountCreated).toLocaleDateString()
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "faculty_details_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      {/* <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" /> */}

    
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-1 rounded shadow-sm mb-2 welcome-card dashboard-hero">
              <h2 className="text-primary mb-1 dashboard-hero-title">Faculty Details Report</h2>
              <p className="text-muted mb-0 dashboard-hero-sub">Search and export faculty profiles and assigned courses.</p>
            </div>

            {/* Filters */}
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="col-md-3 text-right">
                <button className="btn btn-sm btn-success" onClick={handleExport}>Download CSV</button>
              </div>
            </div>

            {/* Table */}
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">Faculty List</div>
              <div className="card-body p-0">
                {currentData.length ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Office</th>
                          <th>Status</th>
                          <th>Rating</th>
                          <th>Courses</th>
                          <th>Research</th>
                          <th>Education</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.map((p, idx) => (
                          <tr key={idx}>
                            <td>{p.fullName}</td>
                            <td>{p.email}</td>
                            <td>{p.phoneNumber}</td>
                            <td>{p.officeLocation}</td>
                            <td>{p.employeeStatus}</td>
                            <td>{p.teachingRating ?? "-"}</td>
                            <td>{p.assignedCourses?.map((c) => c.name).join(", ") ?? "-"}</td>
                            <td>{p.researchInterests}</td>
                            <td>{p.educationalBackground}</td>
                            <td>{new Date(p.accountCreated).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-4">No faculty data found.</div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-4 d-flex justify-content-center">
                <ul className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="page-link">{i + 1}</span>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

          </div>
        </div>

         
      
    </div>
  );
}

export default ReportsFacultyDetails;
