// File: src/pages/InstructorExaminations.jsx
import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function InstructorExaminations() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const instructorId = decoded["UserId"] || decoded.userId || decoded.nameid;
    if (!instructorId) return;

    fetch(`${API_BASE_URL}/Examination/ByInstructor/${instructorId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setExams)
      .catch(console.error)
      .finally(() => setLoading(false));
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
      <LeftSidebar role="Instructor" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <h3 className="mb-4 text-primary">Assigned Examinations</h3>
            <Table striped bordered hover>
              <thead className="thead-dark">
                <tr>
                  <th>Paper Code</th>
                  <th>Paper Name</th>
                  <th>Course</th>
                  <th>Group</th>
                  <th>Semester</th>
                  <th>Credits</th>
                  <th>Type</th>
                  <th>Elective</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.examinationId}>
                    <td>{exam.paperCode}</td>
                    <td>{exam.paperName}</td>
                    <td>{exam.courseName || "-"}</td>
                    <td>{exam.groupTitle || "-"}</td>
                    <td>{exam.semester}</td>
                    <td>{exam.credits}</td>
                    <td>{exam.paperType}</td>
                    <td>{exam.isElective ? "Yes" : "No"}</td>
                    <td>
                      <Link to={`/InstructorEnterMarks/${exam.examinationId}`} className="btn btn-sm btn-primary">
                        Enter Marks
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
         
      </div>
    </div>
  );
}

export default InstructorExaminations;
