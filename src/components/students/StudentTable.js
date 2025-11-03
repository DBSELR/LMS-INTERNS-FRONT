import React, { useState, useEffect } from "react";
import ConfirmationPopup from "../ConfirmationPopup";
import { jwtDecode } from "jwt-decode"; // ✅ Required for role decoding
import API_BASE_URL from "../../config";

const groupStudentsWithCourses = (students) => {
  const map = new Map();

  students.forEach((s) => {
    if (!map.has(s.userId)) {
      map.set(s.userId, {
        ...s,
        courses: [],
      });
    }

    const course = {
      courseId: s.courseId,
      name: s.courseName,
      semester: s.semester,
      programme: s.programme,
      group: s.group,
    };

    map.get(s.userId).courses.push(course);
  });

  return Array.from(map.values());
};

const StudentTable = ({ students, onEdit, onDelete, onView }) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
   const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");

  const groupedStudents = groupStudentsWithCourses(students);

  const handleDeleteClick = (id) => {
    setPendingDeleteId(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      onDelete(pendingDeleteId);
      setPendingDeleteId(null);
      setShowDeletePopup(false);
    }
  };

  const handleViewClick = (student) => {
    setSelectedStudent(student);
    setViewMode(true); // This triggers view-only mode
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setViewMode(false); // This triggers edit mode
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const resolvedRole =
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
        const name =
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
          decoded["Username"] ||
          decoded.name ||
          "User";

        setRole(resolvedRole);
        setUserName(name);
        console.log("Role :: ",resolvedRole)
      } catch (err) {
        console.error("Token decode failed", err);
      }
    }
  }, []);

  return (
    <>
      <div className="row">
        {groupedStudents.map((student) => (
          <div key={student.userId} className="col-lg-4 col-md-6 mb-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body d-flex flex-column align-items-center text-center">
                <div
                  className="avatar d-inline-block text-white rounded-circle mb-3"
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "#6c757d",
                    textAlign: "center",
                    lineHeight: "100px",
                    fontWeight: "bold",
                    fontSize: "36px",
                  }}
                >
                  {(student.firstName || student.username || "U")[0].toUpperCase()}
                </div>

                <h5 className="font-weight-bold mb-1">
                  {student.firstName || ""} {student.lastName || ""}
                  {!student.firstName && !student.lastName && student.username}
                </h5>

                <p className="text-muted small mb-1">
                  <strong>Username:</strong> {student.username || "N/A"}
                </p>
                <p className="text-muted small mb-1">
                  <strong>Programme:</strong>{" "}
                  {student.courses?.[0]?.programme || "N/A"}
                </p>
                <p className="text-muted small mb-1">
                  <strong>Group:</strong> {student.courses?.[0]?.group || "N/A"}
                </p>
                <p className="text-muted small mb-1">
                  <strong>Semester:</strong>{" "}
                  {student.courses?.[0]?.semester || "N/A"}
                </p>

                <ul className="list-unstyled text-muted small mb-3 mt-2">
                  <li>
                    <i className="fa fa-envelope text-primary mr-1"></i>{" "}
                    {student.email || "No Email"}
                  </li>
                  <li>
                    <i className="fa fa-phone text-success mr-1"></i>{" "}
                    {student.phoneNumber || "No Phone"}
                  </li>
                </ul>

                <span
                  className={`badge px-3 py-2 ${
                    student.status === "Active"
                      ? "badge-success"
                      : "badge-danger"
                  }`}
                >
                  {student.status || "Inactive"}
                </span>
                <div className="mt-3">
                 <button
  className="btn btn-sm btn-outline-primary mr-2"
  onClick={() => onView(student)} 
>
  <i className="fa fa-eye mr-1"></i> View
</button>

                  {(role === "Admin" ) && (
                <button
                  className="btn btn-sm btn-outline-info mr-2 rounded-pill"
                  onClick={() => onEdit(student)}
                >
                  <i className="fa fa-edit mr-1"></i> Edit
                </button>
              )}
               {(role === "Admin" ) && (
                  <button 
                    className="btn btn-sm btn-outline-danger rounded-pill"
                    onClick={() => handleDeleteClick(student.userId)}
                  >
                    <i className="fa fa-trash mr-1"></i> Delete
                  </button>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationPopup
        show={showDeletePopup}
        message="Are you sure you want to delete this student?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeletePopup(false)}
        toastMessage="Student deleted successfully!"
      />
    </>
  );
};

export default StudentTable;
