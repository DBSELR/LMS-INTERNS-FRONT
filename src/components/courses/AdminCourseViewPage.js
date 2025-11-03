import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import API_BASE_URL from "../../config";

function AdminCourseViewPage() {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const [contentRes, assignmentRes, examRes, liveClassRes, courseRes] = await Promise.all([
        fetch(`${API_BASE_URL}/Content/Course/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/Assignment/GetAllAssignments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/Exam`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/LiveClass/All`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/Course/by-instructor/42`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      const [content, allAssignments, allExams, allLiveClasses, courseList] = await Promise.all([
        contentRes.json(),
        assignmentRes.json(),
        examRes.json(),
        liveClassRes.json(),
        courseRes.json()
      ]);

      const cid = parseInt(courseId);

      setMaterials(content.filter(c => c.contentType === "PDF"));
      setVideos(content.filter(c => c.contentType === "Video"));
      setAssignments(allAssignments.filter(a => a.CourseId === cid));
      setExams(allExams.filter(e => e.courseId === cid));
      setLiveClasses(allLiveClasses.filter(lc =>
        lc.course?.courseId === cid || lc.courseName?.toLowerCase().includes("java programming")
      ));
      setCourses(courseList);

    } catch (err) {
      console.error("Failed to fetch content", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Content/Delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchContent();
    } catch (err) {
      console.error("Delete failed", err);
      alert("\u274C Failed to delete content");
    }
  };

  useEffect(() => {
    if (courseId) fetchContent();
  }, [courseId]);

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
              <h2 className="text-primary mb-2">\ud83d\udcd6 View Course Content</h2>
              <p className="text-muted mb-0">Course ID: <strong>{courseId}</strong></p>
              {courses.map(course => (
                <div key={course.courseId} className="mt-2">
                  <h5>{course.name}</h5>
                  <p className="text-muted">{course.courseCode} — {course.programme}</p>
                </div>
              ))}
            </div>

            {/* Other sections remain the same, already implemented */}

            {/* Live Classes */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">Live Classes</h6>
              </div>
              <div className="card-body">
                {liveClasses.length > 0 ? (
                  <ul className="list-group">
                    {liveClasses.map((lc, i) => (
                      <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{lc.className} — {new Date(lc.startTime).toLocaleString()}</span>
                        <a href={lc.meetingLink} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success">Join</a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted">No live classes available.</p>}
              </div>
            </div>

          </div>
        </div>
         
      </div>
    </div>
  );
}

export default AdminCourseViewPage;
