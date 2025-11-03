import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const decoded = jwtDecode(token);
      const id = decoded["UserId"] || decoded.userId;
      setStudentId(id);
      fetchAssignments(id);
    }
  }, []);

  const fetchAssignments = async (studentId) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Submission/GetStudentAssignments/${studentId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    }
  };

  const handleSubmit = async (assignmentId) => {
    const content = prompt("Enter your submission content or link:");
    if (!content) return;

    try {
      const token = localStorage.getItem("jwt");
      await fetch(`${API_BASE_URL}/Submission/CreateSubmission`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          assignmentId,
          studentId,
          submissionContent: content
        })
      });
      alert("Submission successful.");
      fetchAssignments(studentId);
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Assignments</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active">Assignments</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="card">
              <div className="card-body">
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Due Date</th>
                      <th>Max Grade</th>
                      <th>Status</th>
                      <th>Grade</th>
                      <th>Feedback</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.assignmentId}>
                        <td>{a.title}</td>
                        <td>{a.assignmentType}</td>
                        <td>{new Date(a.dueDate).toLocaleDateString()}</td>
                        <td>{a.maxGrade}</td>
                        <td>{a.isSubmitted ? "Submitted" : "Pending"}</td>
                        <td>{a.grade !== undefined ? a.grade : "Pending"}</td>
                        <td>{a.feedback || "Pending"}</td>
                        <td>
                          {!a.isSubmitted && (
                            <button className="btn btn-sm btn-primary" onClick={() => handleSubmit(a.assignmentId)}>
                              Submit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!assignments.length && (
                      <tr><td colSpan="8" className="text-center">No assignments found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default StudentAssignments;
