import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import QuestionFormModal from "../components/questions/QuestionFormModal";
import { Collapse } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import API_BASE_URL from "../config";

function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openGroup, setOpenGroup] = useState({});

  const token = localStorage.getItem("jwt");
  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
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
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/Question`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) return;
        await fetch(`${API_BASE_URL}/Question/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchQuestions();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setSelectedQuestion(null);
    fetchQuestions();
  };

  const filteredQuestions = questions.filter(q =>
    q.questionText?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Group by programmeName + courseName
  const groupedQuestions = filteredQuestions.reduce((acc, q) => {
    const groupKey = `${q.programmeName || "Uncategorized"} - ${q.courseName || "No Course"}`;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(q);
    return acc;
  }, {});

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
            {/* Jumbotron */}
            <div className="welcome-card animate-welcome p-4 mb-4 ">
              <div>
                <h2 className="text-primary mb-2">Question Bank</h2>
                <p className="text-muted mb-0">Organize your questions creatively and easily.</p>
              </div>
              {role !== "Student" && role !== "Admin" && (
                <button className="btn btn-primary" onClick={() => { setSelectedQuestion(null); setShowModal(true); }}>
                  <i className="fa fa-plus mr-1"></i> Add Question
                </button>
              )}
            </div>

            {/* Search */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Grouped Questions */}
            {Object.keys(groupedQuestions).length > 0 ? (
              Object.entries(groupedQuestions).map(([groupName, questionsInGroup], index) => (
                <div key={groupName} className="mb-4">
                  <button
                    className="w-100 text-white text-left px-3 py-2 d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: "#1c1c1c", border: "none", borderRadius: "25px", fontWeight: "bold" }}
                    onClick={() => setOpenGroup(prev => ({ ...prev, [index]: !prev[index] }))}
                  >
                    <span>{groupName} ({questionsInGroup.length} Questions)</span>
                    {openGroup[index] ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  <Collapse in={!!openGroup[index]}>
                    <div className="mt-3">
                      <div className="row">
                        {questionsInGroup.map((q) => (
                          <div className="col-lg-4 col-md-6 mb-4" key={q.id}>
                            <div className="card shadow-sm h-100">
                              <div className="card-body d-flex flex-column">
                                <h6 className="text-primary mb-2">{q.questionText}</h6>
                                <small className="text-muted mb-2">Topic: <strong>{q.topic || "N/A"}</strong></small>
                                <ul className="list-unstyled small mb-3">
                                  <li><strong>A:</strong> {q.optionA}</li>
                                  <li><strong>B:</strong> {q.optionB}</li>
                                  <li><strong>C:</strong> {q.optionC}</li>
                                  <li><strong>D:</strong> {q.optionD}</li>
                                </ul>
                                <div className="mb-3">
                                  <span className="badge badge-success">Correct: {q.correctOption}</span>
                                </div>
                                <div className="mt-auto d-flex justify-content-between">
                                  <button className="btn btn-sm btn-outline-info" onClick={() => handleEdit(q)}>
                                    <i className="fa fa-edit"></i> Edit
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(q.id || q.questionId)}>
                                    <i className="fa fa-trash"></i> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Collapse>
                </div>
              ))
            ) : (
              <div className="text-center py-5 text-muted">
                <h5>No questions found.</h5>
              </div>
            )}

          </div>
        </div>

         

        {/* Question Form Modal */}
        {showModal && (
          <QuestionFormModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onSave={handleSave}
            question={selectedQuestion}
          />
        )}
      </div>
    </div>
  );
}

export default AdminQuestions;
