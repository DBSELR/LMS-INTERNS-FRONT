import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import SemesterFormModal from "../components/Semesters/SemesterFormModal";
import API_BASE_URL from "../config";

function AdminSemesters() {
  const [semesters, setSemesters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/Semester/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setSemesters(data);
    } catch (err) {
      console.error("Failed to fetch semesters", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (semester) => {
    setSelectedSemester(semester);
    setShowModal(true);
  };

  const handleDeleteSemester = async (id) => {
    if (!window.confirm("Are you sure you want to delete this semester?")) return;
  
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/Semester/Delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
  
      toast.success("Semester deleted.");
      fetchSemesters();
    } catch (err) {
      toast.error(err.message.includes("assigned courses")
        ? "Cannot delete: courses exist in this semester."
        : err.message || "Failed to delete semester");
    }
  };
  

  const handleSave = () => {
    setShowModal(false);
    setSelectedSemester(null);
    fetchSemesters();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSemesters = semesters.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(semesters.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            {/* Header */}
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
              <h2 className="text-primary mb-2">Manage Semesters</h2>
              <p className="text-muted mb-0">Create, edit, and organize semester schedules efficiently.</p>
            </div>

            {/* Add Semester Button */}
            <div className="d-flex justify-content-end mb-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedSemester(null);
                  setShowModal(true);
                }}
              >
                <i className="fa fa-plus mr-1"></i> Add New Semester
              </button>
            </div>

            {/* Semester Cards */}
            <div className="row">
              {currentSemesters.length > 0 ? (
                currentSemesters.map((sem) => (
                  <div key={sem.semesterId} className="col-lg-4 col-md-6 mb-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title text-primary">{sem.semesterName}</h5>
                        <p className="card-text mb-1">
                          <strong>Start:</strong> {sem.startDate?.slice(0, 10)}
                        </p>
                        <p className="card-text mb-1">
                          <strong>End:</strong> {sem.endDate?.slice(0, 10)}
                        </p>
                        <p className="card-text mb-1">
                          <strong>Status:</strong>{" "}
                          <span className={`badge ${sem.status === "Active" ? "badge-success" : "badge-danger"}`}>
                            {sem.status}
                          </span>
                        </p>
                        <p className="card-text mb-3">
                          <strong>Fee Status:</strong>{" "}
                          <span className="badge badge-info">{sem.feeStatus}</span>
                        </p>

                        <div className="mt-auto d-flex flex-wrap justify-content-between">
                          <button
                            className="btn btn-sm btn-outline-info mb-2"
                            onClick={() => handleEdit(sem)}
                          >
                            <i className="fa fa-edit"></i> Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger mb-2"
                            onClick={() => handleDeleteSemester(sem.semesterId)}
                          >
                            <i className="fa fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center text-muted py-5">
                  <h5>No semesters available.</h5>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-4 d-flex justify-content-center">
                <ul className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                      onClick={() => handlePageChange(i + 1)}
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

         

        {/* Semester Modal */}
        {showModal && (
          <SemesterFormModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onSave={handleSave}
            semester={selectedSemester}
          />
        )}
      </div>
    </div>
  );
}

export default AdminSemesters;
