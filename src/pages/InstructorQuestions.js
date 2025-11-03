import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import QuestionFormModal from "../components/questions/QuestionFormModal";
import API_BASE_URL from "../config";

function InstructorQuestions() {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const recordsPerPage = 6;

  const token = localStorage.getItem("jwt");
  let instructorId = null;
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      instructorId = decoded["UserId"] || decoded.userId || decoded.nameid;
      role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
    } catch (err) {
      console.error("JWT decode error", err);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/Question`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch questions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || isNaN(id)) {
      alert("Invalid question ID.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await fetch(`${API_BASE_URL}/Question/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        fetchQuestions();
      } catch (err) {
        alert("Cannot delete. It may be used in an exam.");
        console.error("Delete failed", err);
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    fetchQuestions();
  };

  const filteredQuestions = questions.filter((q) =>
    q.createdBy === Number(instructorId) &&
    q.questionText?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuestions.length / recordsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (role !== "Instructor") {
    return <div className="p-5 text-center text-danger">Access Denied.</div>;
  }

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4 d-flex justify-content-between align-items-center">
              <div>
                <h2 className="text-primary mb-2">Your Question Bank.....</h2>
                <p className="text-muted mb-0">Create and manage your questions.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <i className="fa fa-plus mr-1"></i> Add Questions
              </button>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search questions..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {paginatedQuestions.length > 0 ? (
              <div className="row">
                {paginatedQuestions.map((q) => {
                  const isTheory = !q.optionA && !q.optionB && !q.optionC && !q.optionD;
                  return (
                    <div className="col-lg-4 col-md-6 mb-4" key={q.id || q.questionId}>
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                          <h6 className="text-primary mb-2">{q.questionText}</h6>

                          {!isTheory && (
                            <ul className="list-unstyled small mb-3">
                              <li><strong>A:</strong> {q.optionA}</li>
                              <li><strong>B:</strong> {q.optionB}</li>
                              <li><strong>C:</strong> {q.optionC}</li>
                              <li><strong>D:</strong> {q.optionD}</li>
                            </ul>
                          )}

                          {!isTheory && (
                            <div className="mb-2">
                              <span className="badge badge-success">Correct: {q.correctOption}</span>
                              <span className="badge badge-secondary ml-2">Difficulty: {q.difficultyLevel}</span>
                            </div>
                          )}

                          <small className="text-muted">
                            Subject: {q.subject} | Topic: {q.topic} <br/>
                            Programme: {q.programmeName || "-"} | Course: {q.courseName || "-"} | Semester: {q.semesterId || "-"}
                          </small>

                          <div className="mt-auto d-flex justify-content-end">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(q.id || q.questionId)}>
                              <i className="fa fa-trash"></i> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <h5>No questions found.</h5>
              </div>
            )}

            {paginatedQuestions.length > 0 && (
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

         

        {showModal && (
          <QuestionFormModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onSave={handleSave}
            question={null}
          />
        )}
      </div>
    </div>
  );
}

export default InstructorQuestions;
