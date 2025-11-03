  import React, { useEffect, useState } from "react";
  import { jwtDecode } from "jwt-decode";
  import HeaderTop from "../components/HeaderTop";
  import RightSidebar from "../components/RightSidebar";
  import LeftSidebar from "../components/LeftSidebar";
  import Footer from "../components/Footer";
  import API_BASE_URL from "../config";

  function InstructorAssignmentGradeList() {
    const [submissions, setSubmissions] = useState([]);
    const [editing, setEditing] = useState(null);
    const [gradeData, setGradeData] = useState({ grade: "", feedback: "" });

    const fetchSubmissions = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) return;

      const decoded = jwtDecode(token);
      const instructorId = decoded["UserId"] || decoded.userId || decoded.nameid;

      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(
          `${API_BASE_URL}/AssignmentSubmission/all-submissions?instructorId=${instructorId}`,
          {
            method: "GET",
            headers: {
              
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        const formatted = data.map((s) => ({
          assignmentSubmissionId: s.AssignmentSubmissionId,
          submissionDate: s.SubmissionDate,
          grade: s.Grade,
          feedback: s.Feedback,
          status: s.Status,
          filePath: s.FilePath,
          studentId: s.StudentId,
          examid: s.examid,
          studentdetails : s.StudentDetails,
          pname : s.pname,
          totandpass : s.totmrkpassmrk,
          programme : s.ProgrammeName,
          assignmentTitle: s.AssignmentTitle,
        }));
        setSubmissions(formatted);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      }
    };

    useEffect(() => {
      fetchSubmissions();
    }, []);

    const handleGradeChange = (e) => {
      const { name, value } = e.target;
      setGradeData({ ...gradeData, [name]: value });
    };

    const submitGrade = async (submissionId) => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(`${API_BASE_URL}/assignmentsubmission/grade`, {
          method: "POST",
          headers: { "Content-Type": "application/json",
             "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            submissionId,
            grade: gradeData.grade,
            feedback: gradeData.feedback,
          }),
        });

        if (!res.ok) throw new Error("Failed to grade assignment");
        alert("Assignment Graded successfully");
        setEditing(null);
        setGradeData({ grade: "", feedback: "" });
        await fetchSubmissions();
      } catch (err) {
        console.error(err);
        alert("Failed to grade");
      }
    };

    return (
      <div id="main_content" className="font-muli theme-blush">
        <HeaderTop />
        <RightSidebar />
        <LeftSidebar role="Instructor" />

        <div className="section-wrapper">
          <div className="page admin-dashboard">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <div>
                  <h2 className="text-primary  pt-0 dashboard-hero-title">Students Assignment Submissions</h2>
                  <p className="text-muted mb-0 dashboard-hero-sub">Review and grade Assignments below.</p>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <h5>No submissions found.</h5>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="thead-light">
                      <tr>
                        <th>ID</th>
                        <th>Details</th>
                        <th>Programme</th>
                        <th>Subject</th>
                        <th>Total&Pass</th>
                        <th>Assignment</th>
                        <th>Date</th>
                        <th>File</th>
                        <th>Obtained Marks</th>
                        <th>Feedback</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s) => (
                        <tr key={s.assignmentSubmissionId}>
                          <td>{s.studentId}</td>
                          <td>{s.studentdetails}</td>
                           <td>{s.programme}</td>
                            <td>{s.pname}</td>
                            <td>{s.totandpass}</td>
                          <td>{s.assignmentTitle}</td>
                          <td>{new Date(s.submissionDate).toLocaleString()}</td>
                          <td>
                            <a
                              href={`http://localhost:5129${s.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download
                            </a>
                          </td>
                          <td>
                            {editing === s.assignmentSubmissionId ? (
                              <input
                                type="number"
                                name="grade"
                                value={gradeData.grade}
                                onChange={handleGradeChange}
                                className="form-control form-control-sm"
                              />
                            ) : (
                              s.grade ?? "-"
                            )}
                          </td>
                          <td>
                            {editing === s.assignmentSubmissionId ? (
                              <input
                                name="feedback"
                                value={gradeData.feedback}
                                onChange={handleGradeChange}
                                className="form-control form-control-sm"
                              />
                            ) : (
                              s.feedback || "-"
                            )}
                          </td>
                          <td>
                            {editing === s.assignmentSubmissionId ? (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => submitGrade(s.assignmentSubmissionId)}
                              >
                                Submit
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setEditing(s.assignmentSubmissionId);
                                  setGradeData({
                                    grade: s.grade ?? "",
                                    feedback: s.feedback ?? "",
                                  });
                                }}
                              >
                                Mark Update
                              </button>
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
           
        </div>
        </div>
      </div>
    );
  }

  export default InstructorAssignmentGradeList;
