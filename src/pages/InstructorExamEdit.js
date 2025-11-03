import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

function InstructorExamEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [courses, setCourses] = useState([]); // State to store courses for dropdown
  const [form, setForm] = useState({
    title: "",
    courseId: "", // Replacing subject with courseId
    examDate: "",
    durationMinutes: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    // Fetch the exam data
    fetch(`${API_BASE_URL}/Question/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setExam(data);
        setForm({
          title: data.title,
          courseId: data.courseId, // Assign courseId from fetched exam data
          examDate: data.examDate.slice(0, 16), // Format for input[type=datetime-local]
          durationMinutes: data.durationMinutes
        });
      })
      .catch((err) => console.error("Failed to load exam", err));



    // Fetch courses assigned to the instructor
    
    const decoded = jwtDecode(token);
    const instructorId = decoded["UserId"] || decoded.userId;

    fetch(`${API_BASE_URL}/course/by-instructor/${instructorId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCourses(data)) // Set courses for dropdown
      .catch((err) => console.error("Failed to fetch courses", err));
  }, [id]);


    useEffect(() => {
    console.log("📦  form updated:", form);
  }, [form]);
  
    useEffect(() => {
    console.log("📦  course updated:", courses);
  }, [courses]); 

     useEffect(() => {
    console.log("📦  exam updated:", exam);
  }, [exam]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: parseInt(id),
      title: form.title,
      courseId: form.courseId, // Include courseId
      examDate: form.examDate,
      durationMinutes: parseInt(form.durationMinutes)
    };

    const token = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/Exam/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
     },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("✅ Exam updated successfully");
      navigate("/instructor/exams");
    } else {
      alert("❌ Failed to update exam");
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="page-title">Edit Exam</h1>
            </div>

            {exam ? (
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                  <label>Title</label>
                  <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                  <label>Course</label>
                  <select name="courseId" className="form-control" value={form.courseId} onChange={handleChange} required>
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.courseId} value={course.courseId}>
                        {course.name} ({course.semester} - {course.programme})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label>Exam Date</label>
                  <input type="datetime-local" name="examDate" className="form-control" value={form.examDate} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                  <label>Duration (minutes)</label>
                  <input type="number" name="durationMinutes" className="form-control" value={form.durationMinutes} onChange={handleChange} required />
                </div>

                <button className="btn btn-success" type="submit">Update Exam</button>
              </form>
            ) : (
              <p>Loading exam...</p>
            )}
          </div>
        </div>
         
      </div>
    </div>
  );
}

export default InstructorExamEdit;
