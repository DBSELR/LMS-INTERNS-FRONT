import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";

function StudentQuestions() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { examid } = useParams();

  const { state } = useLocation();
  const examId = state?.examid;

  const recordsPerPage = 6;

  useEffect(() => {
    if (!examId) {
      console.error("❌ Missing exam ID");
      setLoading(false);
      return;
    }

    fetchQuestions(examId);
  }, [examId]);

  const fetchQuestions = async (examId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/Question/GetStudentExamWithQuestions/${examId}`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to fetch questions", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) =>
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
                <h2 className="text-primary mb-2">Exam Questions</h2>
                <p className="text-muted mb-0">
                  Answer all the questions below.
                </p>
              </div>
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
                {paginatedQuestions.map((q) => (
                  <div className="col-lg-4 col-md-6 mb-4" key={q.qid || q.id}>
                    <div className="card shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="text-primary mb-2">{q.questionText}</h6>
                        <ul className="list-unstyled small mb-3">
                          <li><strong>A:</strong> {q.optionA}</li>
                          <li><strong>B:</strong> {q.optionB}</li>
                          <li><strong>C:</strong> {q.optionC}</li>
                          <li><strong>D:</strong> {q.optionD}</li>
                        </ul>
                        <div className="mb-2">
                          <span className="badge badge-success">Correct: {q.correctOption}</span>{" "}
                          <span className="badge badge-secondary">Difficulty: {q.difficultyLevel}</span>
                        </div>
                        <small className="text-muted">
                          Topic: {q.topic} | Exam ID: {q.examid}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
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
         
      </div>
    </div>
  );
}

export default StudentQuestions;
