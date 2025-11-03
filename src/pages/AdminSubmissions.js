import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import ExamReview from "../components/exams/ExamReview";
import API_BASE_URL from "../config";

function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [reviewId, setReviewId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/ExamSubmissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching submissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(sub =>
    sub.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    sub.examTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubmissions.length / recordsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
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

            {/* Page Title */}
            <div className="jumbotron bg-light p-4 rounded shadow-sm d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="text-primary mb-2">Exam Submissions</h2>
                <p className="text-muted mb-0">View, review, and manage submitted exams.</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder=" Search by student or exam title..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Submissions Grid Cards */}
            {paginatedSubmissions.length > 0 ? (
              <div className="row">
                {paginatedSubmissions.map((sub) => (
                  <div className="col-lg-4 col-md-6 mb-4" key={sub.id}>
                    <div className="card h-100 shadow-sm">
                      <div className="card-body d-flex flex-column">
                        <h6 className="text-primary">{sub.examTitle}</h6>
                        <p className="small text-muted mb-1">
                          <strong>Student:</strong> {sub.studentName}
                        </p>
                        <p className="small text-muted mb-1">
                          <strong>Submitted On:</strong> {new Date(sub.submissionDate).toLocaleString()}
                        </p>
                        <p className="small text-muted mb-3">
                          <strong>Score:</strong> {sub.score ?? "-"} 
                          {" "} | {" "}
                          <span className={`badge ml-1 ${sub.isGraded ? "badge-success" : "badge-warning"}`}>
                            {sub.isGraded ? "Graded" : "Pending"}
                          </span>
                        </p>

                        <div className="mt-auto">
                          <button
                            className="btn btn-sm btn-outline-primary w-100"
                            onClick={() => setReviewId(sub.id)}
                          >
                            <i className="fa fa-eye mr-1"></i> Review Submission
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <h5>No submissions found.</h5>
              </div>
            )}

            {/* Pagination */}
            {paginatedSubmissions.length > 0 && (
              <div className="card-footer d-flex justify-content-center mt-4">
                <button
                  className="btn btn-outline-primary btn-sm mr-2"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="mx-3 align-self-center">{currentPage} / {totalPages}</span>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}

          </div>
        </div>

         
      </div>

      {/* Review Modal */}
      {reviewId && (
        <ExamReview
          submissionId={reviewId}
          onClose={() => setReviewId(null)}
        />
      )}
    </div>
  );
}

export default AdminSubmissions;
