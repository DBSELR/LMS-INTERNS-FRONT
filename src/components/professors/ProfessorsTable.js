import React, { useState } from "react";
import ConfirmationPopup from "../ConfirmationPopup"; // ✅ Import the popup
import API_BASE_URL from "../../config";

const ProfessorsTable = ({
  professors,
  onView,
  onEdit,
  onDelete,
  onAssignCourses,
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleDeleteClick = (userId) => {
    setPendingDeleteId(userId);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      onDelete(pendingDeleteId);
      setShowDeletePopup(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <>
      <div className="row">
        {professors.map((prof) => (
          <div key={prof.userId} className="col-lg-4 col-md-6 mb-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body d-flex flex-column align-items-center text-center">
                <div className="mb-3">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt="Professor Avatar"
                    className="rounded-circle shadow-sm"
                    width="100"
                    height="100"
                  />
                </div>
                <h5 className="font-weight-bold mb-1">{prof.fullName}</h5>
                <p className="text-muted small mb-2">{prof.department}</p>

                <ul className="list-unstyled text-muted small mb-3">
                  <li>
                    <i className="fa fa-envelope text-primary mr-1"></i>{" "}
                    {prof.email}
                  </li>
                  <li>
                    <i className="fa fa-phone text-success mr-1"></i>{" "}
                    {prof.phoneNumber}
                  </li>
                  <li>
                    <i className="fa fa-calendar text-info mr-1"></i> Joined:{" "}
                    {new Date(prof.accountCreated).toLocaleDateString()}
                  </li>
                </ul>

                <span
                  className={`badge px-3 py-2 ${
                    prof.isActive ? "badge-success" : "badge-danger"
                  }`}
                >
                  {prof.isActive ? "Active" : "Inactive"}
                </span>

                {/* Assigned Courses Display */}
                <div className="mt-3 text-start w-100">
                  <p className="mb-1 fw-bold">Assigned Courses:</p>
                  {prof.assignedCourses && prof.assignedCourses.length > 0 ? (
                    <ul className="list-unstyled mb-0 small">
                      {prof.assignedCourses.map((course) => (
                        <li key={course.examinationId}>
                          {course.paperCode} - {course.paperName}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No courses assigned.</p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary mr-2 rounded-pill"
                    onClick={() => onView(prof)}
                  >
                    <i className="fa fa-eye mr-1"></i> View
                  </button>
                  <button
                    className="btn btn-sm btn-outline-info mr-2 rounded-pill"
                    onClick={() => onEdit(prof)}
                  >
                    <i className="fa fa-edit mr-1"></i> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-warning mr-2 rounded-pill"
                    onClick={() =>
                      onAssignCourses(
                        prof,
                        prof.assignedCourses?.map((c) => c.examinationId) || []
                      )
                    }
                  >
                    <i className="fa fa-book mr-1"></i> Assign Courses
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill"
                    onClick={() => handleDeleteClick(prof.userId)}
                  >
                    <i className="fa fa-trash mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Popup */}
      <ConfirmationPopup
        show={showDeletePopup}
        message="Are you sure you want to delete this professor?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeletePopup(false)}
        toastMessage="Professor deleted successfully!"
      />
    </>
  );
};

export default ProfessorsTable;
