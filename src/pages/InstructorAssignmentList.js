import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function InstructorAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignmentsPerPage] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    const decoded = jwtDecode(token);
    const instructorId = decoded["UserId"] || decoded.userId || decoded.nameid;

    fetch(`${API_BASE_URL}/assignment/by-instructor/${instructorId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch assignments: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        const formatted = data.map((a) => ({
          assignmentId: a.AssignmentId,
          courseId: a.CourseId,
          title: a.Title,
          description: a.Description,
          dueDate: a.DueDate,
          maxGrade: a.MaxGrade,
          assignmentType: a.AssignmentType,
          createdDate: a.CreatedDate,
          updatedDate: a.UpdatedDate,
          createdBy: a.CreatedBy,
          programme: a.Programme,
          semester: a.Semester,
          fileUrl: a.FileUrl,
          course: {
            name: a.CourseName || "",
            courseCode: a.CourseCode || "",
          },
        }));
        setAssignments(formatted);
      })
      .catch((err) => {
        console.error("Error fetching assignments:", err);
        //alert("No Assignments found");
      });
  }, []);

  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setAssignments((prev) => prev.filter((e) => e.assignmentId !== assignmentId));
        alert("Assignment deleted successfully");
      } else {
        alert("Failed to delete assignment");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(" An error occurred while deleting.");
    }
  };

  const indexOfLast = currentPage * assignmentsPerPage;
  const indexOfFirst = indexOfLast - assignmentsPerPage;
  const currentAssignments = assignments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(assignments.length / assignmentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="text-primary mb-2">Manage Assignments</h2>
                <p className="text-muted mb-0">Create, edit and manage your assignments easily.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/instructor/assignments/create")}
              >
                <i className="fa fa-plus mr-1"></i> Create Assignment
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center text-muted py-5">
                <h5>No assignments found.</h5>
              </div>
            ) : (
              <div className="row">
                {currentAssignments.map((assignment) => (
                  <div className="col-lg-4 col-md-6 mb-4" key={assignment.assignmentId}>
                    <div className="card shadow-sm h-100 d-flex flex-column">
                      <div className="card-body d-flex flex-column">
                        <h6 className="text-primary">{assignment.title}</h6>
                        <p className="text-muted small mb-2">{assignment.description}</p>
                        <p className="small mb-1">
                          <strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                        <p className="small mb-1">
                          <strong>Max Grade:</strong> {assignment.maxGrade}
                        </p>
                        <p className="small mb-2">
                          <strong>Type:</strong> {assignment.assignmentType}
                        </p>
                        {/* <p className="small mb-3">
                          <strong>Course:</strong> {assignment.course.name} ({assignment.course.courseCode})
                        </p> */}
                        {assignment.fileUrl && (
                          <a
                            href={`http://localhost:5129${assignment.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-secondary mb-2"
                          >
                            View File
                          </a>
                        )}
                        <div className="mt-auto d-flex justify-content-between">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => navigate(`/instructor/assignments/edit/${assignment.assignmentId}`)}
                          >
                            <i className="fa fa-edit"></i> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(assignment.assignmentId)}
                          >
                            <i className="fa fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {assignments.length > 0 && totalPages > 1 && (
              <div className="card-footer d-flex justify-content-center mt-4">
                <button
                  className="btn btn-outline-primary btn-sm mr-2"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="align-self-center mx-2">{currentPage} / {totalPages}</span>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => paginate(currentPage + 1)}
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

export default InstructorAssignmentList;
