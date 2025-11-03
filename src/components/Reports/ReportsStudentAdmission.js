// File: pages/ReportsStudentAdmission.jsx
import React, { useEffect, useState } from "react";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import API_BASE_URL from "../../config";

function ReportsStudentAdmission() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [programme, setProgramme] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const filtered = data.filter((u) => u.role === "Student");
      setStudents(filtered);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      !search ||
      s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(search.toLowerCase());

    const matchProgramme =
      !programme ||
      s.programme?.toLowerCase().includes(programme.toLowerCase().trim());

    const matchSemester =
      !semester ||
      s.semester?.toLowerCase().includes(semester.toLowerCase().trim());

    return matchSearch && matchProgramme && matchSemester;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleExport = () => {
    const headers = ["Username", "First Name", "Last Name", "Email", "Programme", "Semester", "Status"];
    const rows = filtered.map((s) => [
      s.username,
      s.firstName,
      s.lastName,
      s.email,
      s.programme,
      s.semester,
      s.status
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_admission_report.csv");
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
              <h2 className="text-primary mb-1 dashboard-hero-title">Student Admission Report</h2>
              <p className="text-muted mb-0 dashboard-hero-sub">Filter and export student admissions by programme and semester.</p>
            </div>

            {/* Filters */}
            <div className="row mb-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Programme"
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>
            </div>

            {/* Export */}
            <div className="mb-3 text-right">
              <button className="btn btn-sm btn-success" onClick={handleExport}>
                Download CSV
              </button>
            </div>

            {/* Table */}
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">Admissions</div>
              <div className="card-body p-0">
                {currentData.length ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Course</th>
                          <th>Semester</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.map((s, idx) => (
                          <tr key={idx}>
                            <td>{s.username}</td>
                            <td>{s.firstName}</td>
                            <td>{s.lastName}</td>
                            <td>{s.email}</td>
                            <td>{s.programme}</td>
                            <td>{s.semester}</td>
                            <td>{s.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-4">No students found.</div>
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

export default ReportsStudentAdmission;
