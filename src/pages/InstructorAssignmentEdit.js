import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function InstructorAssignmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxGrade: 0,
    assignmentType: "",
    courseId: 0,
    semester: "",
    programme: "",
  });

  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(`${API_BASE_URL}/assignment/${id}`, {
          method: "GET",
          headers: {
            
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setForm({
          title: data.Title,
          description: data.Description,
          dueDate: data.DueDate ? data.DueDate.slice(0, 16) : "",
          maxGrade: data.MaxGrade,
          assignmentType: data.AssignmentType,
          courseId: data.CourseId,
          semester: data.Semester,
          programme: data.Programme,
        });
        setFileUrl(data.FileUrl);
      } catch (err) {
        console.error("Failed to load assignment", err);
      } finally {
        setLoading(false);
      }
    };
    loadAssignment();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      AssignmentId: parseInt(id, 10),
      Title: form.title,
      Description: form.description,
      DueDate: form.dueDate,
      MaxGrade: Number(form.maxGrade),
      AssignmentType: form.assignmentType,
      CourseId: Number(form.courseId),
      Semester: form.semester,
      Programme: form.programme,
    };

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/assignment/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update assignment");
      alert("✅ Assignment updated successfully");
      navigate("/instructor/assignments");
    } catch (err) {
      console.error(err);
      alert("❌ Error updating assignment");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/assignment/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("✅ Assignment deleted successfully");
        navigate("/instructor/assignments");
      } else {
        alert("❌ Failed to delete assignment");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Error deleting assignment");
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="page">
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="page-title">Edit Assignment</h1>
            </div>

            {loading ? (
              <p>Loading assignment...</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label>Due Date</label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    className="form-control"
                    value={form.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Max Grade</label>
                  <input
                    type="number"
                    name="maxGrade"
                    className="form-control"
                    value={form.maxGrade}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Assignment Type</label>
                  <input
                    className="form-control"
                    name="assignmentType"
                    value={form.assignmentType}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Course ID</label>
                  <input
                    type="number"
                    name="courseId"
                    className="form-control"
                    value={form.courseId}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label>Semester</label>
                  <input className="form-control" value={form.semester} disabled />
                </div>

                <div className="mb-3">
                  <label>Programme</label>
                  <input className="form-control" value={form.programme} disabled />
                </div>

                {fileUrl && (
                  <div className="mb-3">
                    <label>Attached File</label>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">View File</a>
                  </div>
                )}

                <button className="btn btn-success" type="submit">
                  Update Assignment
                </button>
              </form>
            )}

            <button className="btn btn-danger mt-3" onClick={handleDelete}>
              Delete Assignment
            </button>
          </div>
        </div>
         
      </div>
    </div>
  );
}

export default InstructorAssignmentEdit;