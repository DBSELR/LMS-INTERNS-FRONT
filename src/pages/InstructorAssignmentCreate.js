import React, { useState, useEffect } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

function InstructorAssignmentCreate() {
  const [assignment, setAssignment] = useState({
  title: "",
  description: "",
  dueDate: "",
  maxGrade: 0,
  assignmentType: "",
  examinationId: "",
  semester: "",
  batchName: "",
  createdBy: 0,
});
  const [file, setFile] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    const decoded = jwtDecode(token);
    const instructorId = decoded["UserId"] || decoded.userId || decoded.nameid;

    if (instructorId) {
      setAssignment((prev) => ({ ...prev, createdBy: parseInt(instructorId, 10) }));
      fetchCourses(instructorId);
    }
  }, []);

  const fetchCourses = async (instructorId) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/professor/assigned-courses/${instructorId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch courses: ${response.statusText}`);
      const data = await response.json();
      setCourses(data);
      console.log("cour" ,data);
    } catch (err) {
      console.error("Error fetching courses: ", err);
      alert("❌ Failed to fetch courses.");
    }
  };

  const handleAssignmentChange = (e) => {
  const { name, value } = e.target;

  // If user selected course (examinationId)
  if (name === "examinationId") {
    const selectedId = parseInt(value);
    const selectedCourse = courses.find(c => c.ExaminationId === selectedId);

    console.log("📌 Selected course ID:", selectedId);
    console.log("📘 Matched Course Object:", selectedCourse);

    if (selectedCourse) {
      setAssignment((prev) => ({
        ...prev,
        examinationId: selectedId,
        semester: selectedCourse.semester || "",
        batchName: selectedCourse.batchName || "",
      }));
    } else {
      console.warn("⚠️ Course not found for ID:", selectedId);
    }
  } else {
    setAssignment((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();

   

    const formData = new FormData();
    formData.append("title", assignment.title);
    formData.append("description", assignment.description);
    formData.append("dueDate", assignment.dueDate);
    formData.append("maxGrade", assignment.maxGrade);
    formData.append("assignmentType", assignment.assignmentType);
    formData.append("courseId", assignment.examinationId);
    formData.append("createdBy", assignment.createdBy);
console.log("assg:",assignment)
console.log("cous:",courses)
   console.log("title", assignment.title);
    console.log("description", assignment.description);
    console.log("dueDate", assignment.dueDate);
    console.log("maxGrade", assignment.maxGrade);
    console.log("assignmentType", assignment.assignmentType);
    console.log("courseId", assignment.examinationId);
    console.log("createdBy", assignment.createdBy);

 const selectedCourse = courses.find(course => course.ExaminationId === Number(assignment.examinationId));
    if (!selectedCourse) return alert("Please select a valid course.");



    if (file) formData.append("file", file);

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/assignment/create-with-file`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create assignment");
      alert("✅ Assignment created successfully");
      setAssignment({
        title: "",
        description: "",
        dueDate: "",
        maxGrade: 0,
        assignmentType: "",
        examinationId: 0,
        createdBy: assignment.createdBy,
      });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error creating assignment");
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="page">
        <div className="section-body container-fluid mt-4">
          <div className="card">
            <div className="card-header">
              <h4>Create New Assignment</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-group">
                  <label>Title</label>
                  <input className="form-control" name="title" value={assignment.title} onChange={handleAssignmentChange} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" name="description" value={assignment.description} onChange={handleAssignmentChange} rows="4" required></textarea>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select
  className="form-control"
  name="examinationId"
  value={assignment.examinationId}
  onChange={handleAssignmentChange}
  required
>
  <option value="">Select Course</option>
  {courses.map((course) => (
    <option key={course.ExaminationId} value={course.ExaminationId}>
      {course.PaperCode}-{course.PaperName} ({course.Semester}/{course.BatchName || "N/A"})
    </option>
  ))}
</select>

                </div>
                <div className="form-group">
                  <label>Max Grade</label>
                  <input className="form-control" type="number" name="maxGrade" value={assignment.maxGrade} onChange={handleAssignmentChange} required />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input className="form-control" type="datetime-local" name="dueDate" value={assignment.dueDate} onChange={handleAssignmentChange} required />
                </div>
                <div className="form-group">
                  <label>Assignment Type</label>
                  <input className="form-control" name="assignmentType" value={assignment.assignmentType} onChange={handleAssignmentChange} required />
                </div>
                <div className="form-group">
                  <label>Optional File Upload</label>
                  <input type="file" className="form-control-file" onChange={(e) => setFile(e.target.files[0])} />
                </div>
                <button type="submit" className="btn btn-primary">Create Assignment</button>
              </form>
            </div>
          </div>
        </div>
         
      </div>
    </div>
  );
}

export default InstructorAssignmentCreate;
