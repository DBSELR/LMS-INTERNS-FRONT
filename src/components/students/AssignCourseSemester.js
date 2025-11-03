import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios"; // To make HTTP requests
import API_BASE_URL from "../../config";

function AssignCourseSemester({ userId }) {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const history = useHistory();

  // Fetch available courses and semesters when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    axios.get(`${API_BASE_URL}/admin/courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => setCourses(response.data))
      .catch(error => console.error("Error fetching courses:", error));

    axios.get(`${API_BASE_URL}/admin/semesters`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => setSemesters(response.data))
      .catch(error => console.error("Error fetching semesters:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      CourseIds: selectedCourses,
      SemesterId: selectedSemester,
    };

    axios.put(`${API_BASE_URL}/admin/assign-course-semester/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }, payload)
      .then(response => {
        alert(response.data.message);
        history.push("/students"); // Redirect to the students list page
      })
      .catch(error => {
        console.error("Error assigning courses:", error);
        alert("Failed to assign courses or semester");
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Select Courses:</label>
        <select multiple value={selectedCourses} onChange={(e) => setSelectedCourses(Array.from(e.target.selectedOptions, option => option.value))}>
          {courses.map((course) => (
            <option key={course.courseId} value={course.courseId}>{course.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Select Semester:</label>
        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
          {semesters.map((semester) => (
            <option key={semester.semesterId} value={semester.semesterId}>{semester.semesterName}</option>
          ))}
        </select>
      </div>

      <button type="submit">Assign Courses and Semester</button>
    </form>
  );
}

export default AssignCourseSemester;
