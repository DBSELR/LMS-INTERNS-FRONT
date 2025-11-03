import React, { useState, useEffect } from "react";
import { toast } from "react-toastify"; // ✅ Import toast
import API_BASE_URL from "../../config";

const AssignCoursesModal = ({ professorId, onClose, onAssign, assignedCourseIds = [] }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!loading && assignedCourseIds.length > 0) {
      console.log("✅ Pre-checking assignedCourseIds:", assignedCourseIds);
      setSelectedCourses(assignedCourseIds);
    }
  }, [loading, assignedCourseIds]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/course/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      console.log(" Courses Fetched:", data);
      setCourses(data);
    } catch (err) {
      setError("Error fetching courses. Please try again later.");
      toast.error("❌ Error fetching courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (examinationId) => {
    setSelectedCourses((prev) =>
      prev.includes(examinationId)
        ? prev.filter((id) => id !== examinationId)
        : [...prev, examinationId]
    );
  };

  const handleAssignCourses = async () => {
    if (!professorId) {
      toast.error("⚠️ Professor ID is missing.");
      return;
    }
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${API_BASE_URL}/professor/assign-course/${professorId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseIds: selectedCourses }),
        }
      );
      if (!response.ok) throw new Error("Assignment failed");

      toast.success("✅ Courses assigned successfully!");
      onAssign && onAssign();
      onClose();
    } catch (err) {
      setError("Failed to assign courses. Please try again.");
      toast.error("❌ Failed to assign courses.");
    }
  };

  useEffect(() => {
    console.log("Selected (checked) courses:", selectedCourses);
  }, [selectedCourses]);

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Assign Courses</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {loading ? (
              <p>Loading Subjects...</p>
            ) : (
              <>
                <h5>Select Subject to assign:</h5>
                {error && <div className="alert alert-danger">{error}</div>}
                {courses.map((course) => (
                  <div key={course.examinationId} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`course-${course.examinationId}`}
                      checked={selectedCourses.includes(course.examinationId)}
                      onChange={() => handleCourseSelect(course.examinationId)}
                    />
                    <label className="form-check-label" htmlFor={`course-${course.examinationId}`}>
                      {course.paperCode} ({course.paperName})
                    </label>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAssignCourses}
              disabled={selectedCourses.length === 0}
            >
              Assign Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCoursesModal;
