import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../config";

function AssignCourses({ student, onSave, onClose }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(`${API_BASE_URL}/course/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        const assignedIds = student.studentCourses?.map(sc => sc.courseId) || [];
        const unassigned = data.filter(course => !assignedIds.includes(course.courseId));

        setCourses(unassigned);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [student]);

  const handleCheckboxChange = (courseId) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedCourseIds.length === 0) {
      alert("Please select at least one course to assign.");
      return;
    }

    const userId = student.userId || student.id;
    if (!userId) {
      alert("Invalid student data. Cannot assign.");
      return;
    }

    onSave(userId, selectedCourseIds);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Assign Courses to {student.firstName || student.username}
            </h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {loading ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <p>No unassigned courses available.</p>
            ) : (
              <div className="form-group">
                {courses.map((course) => (
                  <div key={course.courseId} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`course-${course.courseId}`}
                      checked={selectedCourseIds.includes(course.courseId)}
                      onChange={() => handleCheckboxChange(course.courseId)}
                    />
                    <label className="form-check-label" htmlFor={`course-${course.courseId}`}>
                      {course.name} ({course.courseCode})
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">Assign Selected</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignCourses;
