// File: src/pages/StudentAssignmentSubmit.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function StudentAssignmentSubmit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    const decoded = jwtDecode(token);
    setStudentId(decoded["UserId"] || decoded.userId || decoded.nameid);

    fetch(`${API_BASE_URL}/assignment/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.updatedDate || typeof data.updatedDate !== 'string' || !Date.parse(data.updatedDate)) {
          data.updatedDate = null;
        }
        setAssignment(data);
      })
      .catch((err) => console.error("Failed to fetch assignment", err));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !studentId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/assignmentsubmission/submit?assignmentId=${id}&studentId=${studentId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!res.ok) throw new Error("Submission failed");
      alert("Assignment submitted successfully");
      navigate("/assignments");
    } catch (err) {
      console.error(err);
      alert("Already submitted");
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      <div className="page">
        <div className="section-body container-fluid mt-4">
          <div className="card">
            <div className="card-header">
              <h4>Submit Assignment</h4>
            </div>
            <div className="card-body">
              {assignment ? (
                <form onSubmit={handleSubmit}>
                  <p><strong>Title:</strong> {assignment.Title}</p>
                  <p><strong>Description:</strong> {assignment.Description}</p>
                  <p><strong>Due Date:</strong> {new Date(assignment.DueDate).toLocaleString()}</p>
                  {/* <p><strong>Updated Date:</strong> {assignment.updatedDate ? new Date(assignment.updatedDate).toLocaleString() : 'Not Updated'}</p> */}
                  {/* <p><strong>File:</strong> <a href={assignment.FileUrl} target="_blank" rel="noopener noreferrer">Download</a></p> */}

                  <div className="form-group">
                    <label>Upload File</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setFile(e.target.files[0])}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary mt-3">
                    Submit
                  </button>
                </form>
              ) : (
                <p>Loading assignment...</p>
              )}
            </div>
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default StudentAssignmentSubmit;
