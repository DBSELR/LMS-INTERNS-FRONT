import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function StudentAssignmentSubmittedList() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    const decoded = jwtDecode(token);
    const studentId = decoded["UserId"] || decoded.userId || decoded.nameid;

    fetch(`${API_BASE_URL}/AssignmentSubmission/submitted/${studentId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setSubmissions(data))
      .catch((err) => console.error("Failed to fetch submissions", err));
  }, []);

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="welcome-card animate-welcome mb-4">
              <div>
                <h2 className="text-primary mb-2">📄 Submitted Assignments</h2>
                <p className="text-muted mb-0">Your assignment submissions and feedback</p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center text-muted p-4 border rounded bg-light shadow-sm">
                No submissions yet.
              </div>
            ) : (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white font-weight-bold">
                  Your Submitted Assignments
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered mb-0 text-center">
                      <thead className="bg-light text-dark" style={{ fontWeight: "600" }}>
                        <tr>
                          <th>Assignment Title</th>
                          <th>Submitted On</th>
                          <th>Total Marks</th>
                          <th>Pass Marks</th>
                          <th>Obtained Marks</th>
                          <th>Feedback</th>
                          <th>File</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((s) => (
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
                </div>
              </div>
            )}
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default StudentAssignmentSubmittedList;
