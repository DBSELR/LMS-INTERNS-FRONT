import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function StudentAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignmentsPerPage] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const studentId = decoded["UserId"] || decoded.userId || decoded.nameid;

     fetch(`${API_BASE_URL}/assignment/by-student-programme/${studentId}`, {
        method: "GET",
       headers: {
         "Authorization": `Bearer ${token}`
       }
     })
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => setAssignments(data))
        .catch((err) => console.error("Failed to fetch assignments", err));
    } catch (error) {
      console.error("JWT decode error", error);
    }
  }, []);

  const indexOfLastAssignment = currentPage * assignmentsPerPage;
  const indexOfFirstAssignment = indexOfLastAssignment - assignmentsPerPage;
  const currentAssignments = assignments.slice(indexOfFirstAssignment, indexOfLastAssignment);
  const totalPages = Math.ceil(assignments.length / assignmentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
              <h2 className="text-primary mb-2">My Assignments</h2>
              <p className="text-muted mb-0">View and submit your pending assignments here.</p>
            </div>

            <div className="row">
              {currentAssignments.length === 0 ? (
                <div className="col-12 text-center text-muted py-5">
                  <h5>No assignments available.</h5>
                </div>
              ) : (
                currentAssignments.map((assignment) => (
                  <div key={assignment.AssignmentId} className="col-lg-6 col-md-12 mb-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-body d-flex flex-column">
                        <h5 className="text-primary">{assignment.Title}</h5>
                        <p className="text-muted">{assignment.Description}</p>
                        <div className="mb-2">
                          <strong>Due:</strong> {new Date(assignment.DueDate).toLocaleString()}
                        </div>
                        <div className="mb-2">
                          <strong>Max Grade:</strong> {assignment.MaxGrade}
                        </div>
                        {/* <div className="mb-2">
                          <strong>Course:</strong> {assignment.Course?.Name || "N/A"}
                        </div> */}
                        {assignment.FileUrl && (
                          <div className="mb-3">
                            <a
                              href={`http://localhost:5129${assignment.FileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-secondary"
                            >
                              View File
                            </a>
                          </div>
                        )}
                        <div className="mt-auto d-flex justify-content-end">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => navigate(`/student/assignments/submit/${assignment.AssignmentId}`)}
                          >
                            <i className="fa fa-upload mr-1"></i> Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {assignments.length > 0 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                      <button onClick={() => paginate(index + 1)} className="page-link">
                        {index + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
         
      </div>
    </div>
  );
}

export default StudentAssignmentList;
