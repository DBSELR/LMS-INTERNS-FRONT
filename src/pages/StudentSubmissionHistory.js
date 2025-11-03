import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function StudentSubmissionHistory() {
  const [activeTab, setActiveTab] = useState("theory");
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      console.warn("No JWT token found");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const id = decoded["UserId"] || decoded.userId || decoded.nameid;
      setUserId(id);

      const fetchAssignment = fetch(
        `${API_BASE_URL}/AssignmentSubmission/submitted/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((res) => res.json());

      const fetchTheory = fetch(
        `${API_BASE_URL}/ExamSubmissions/Submissions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((res) => res.json());

      Promise.all([fetchAssignment, fetchTheory])
        .then(([assignmentData, examData]) => {
          setAssignmentSubmissions(assignmentData);
          setExamSubmissions(examData);
        })
        .catch((err) => {
          console.error("Error fetching submissions:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error("JWT Decode Error:", err);
      setLoading(false);
    }
  }, []);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      <div className="section-wrapper">
          <div className="page admin-dashboard">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i class="fa-solid fa-bar-chart"></i> My Submissions
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">
                View your assignment and exam submissions
              </p>
            </div>

            {/* Tabs with unit-tab styling */}
            <div className="unit-tabs mb-4">
              <button
                className={`unit-tab ${activeTab === "theory" ? "active" : ""}`}
                onClick={() => setActiveTab("theory")}
              >
                Assignments
              </button>
              <button
                className={`unit-tab ${activeTab === "assignments" ? "active" : ""}`}
                onClick={() => setActiveTab("assignments")}
              >
                Theory Exams 
              </button>
              
            </div>

            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white font-weight-bold">
                  Theory Exam Submissions
                </div>
                <div className="card-body p-0">
                  {assignmentSubmissions.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <h5>No assignment submissions found.</h5>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-bordered mb-0 text-center">
                        <thead className="bg-light text-dark" style={{ fontWeight: "600" }}>
                          <tr>
                            <th>Title</th>
                            <th>Submitted On</th>
                            <th>Total Marks</th>
                            <th>Pass Marks</th>
                            <th>Obtained Marks</th>
                            <th>Feedback</th>
                            <th>File</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignmentSubmissions.map((s) => (
                            <tr key={`${s.examid}-${s.studentId}`}>
                              <td>{s.Title}</td>
                              <td>{new Date(s.SubmissionDate).toLocaleString()}</td>
                              <td>{s.totmrk ?? "-"}</td>
                              <td>{s.passmrk ?? "-"}</td>
                              <td>{s.Grade ?? "-"}</td>
                              <td>{s.Feedback ?? "-"}</td>
                              <td>
                                {s.FilePath ? (
                                  <a
                                    href={`http://localhost:5129${s.FilePath}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm btn-outline-primary"
                                  >
                                    View
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Theory Exams Tab */}
            {activeTab === "theory" && (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white font-weight-bold">
                  Assignment Submissions
                </div>
                <div className="card-body p-0">
                  {examSubmissions.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <h5>No theory exams submitted.</h5>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-striped align-middle mb-0 text-center">
                        <thead className="thead-light">
                          <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Pass Marks</th>
                            <th>Score</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examSubmissions.map((s, i) => (
                            <tr key={i}>
                              <td>{s.examTitle}</td>
                              <td>{new Date(s.examDate).toLocaleString()}</td>
                              <td>{s.passmrk}</td>
                              <td>{s.score} / {s.totmrk}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    s.result?.toLowerCase() === "pass"
                                      ? "badge-success"
                                      : "badge-danger"
                                  }`}
                                >
                                  {s.result}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

         
      </div>
      </div>
    </div>
  );
}

export default StudentSubmissionHistory;
