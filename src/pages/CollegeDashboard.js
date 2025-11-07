// File: src/pages/InstructorDashboard.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function CollegeDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [instructorName, setInstructorName] = useState("College");

  // Summary fields based on sp_CollegeAdminSummary_GetDashboard
  const [summary, setSummary] = useState({
    studentCount: 0,
    professorCount: 0,
    courseCount: 0,
    bookCount: 0,
    liveClassCount: 0,
    taskCount: 0,
    examCount: 0,
  });

  useEffect(() => {
  let isMounted = true;
  const ac = new AbortController();

  (async () => {
    const token = localStorage.getItem("jwt");
    if (!token) { if (isMounted) setLoading(false); return; }

    // decode safely
    let decoded;
    try { decoded = jwtDecode(token); } catch { if (isMounted) setLoading(false); return; }

    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded.role || "";
    const name = decoded["Username"] || decoded.name || "College";
    const instructorId = decoded?.UserId ?? decoded?.id ?? 0;

    if (isMounted) setInstructorName(name);
    if (role !== "College" || !instructorId) { if (isMounted) setLoading(false); return; }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await fetch(
        `${API_BASE_URL}/InstructorSummary/collegedashboard/${instructorId}`,
        { method: "GET", headers, signal: ac.signal }
      );

      if (!isMounted || ac.signal.aborted) return;

      if (res.ok) {
        const data = await res.json();
        if (!isMounted || ac.signal.aborted) return;

        setSummary({
          studentCount: Number(data.StudentCount) || 0,
          professorCount: Number(data.ProfessorCount) || 0,
          courseCount: Number(data.CourseCount) || 0,
          bookCount: Number(data.BookCount) || 0,
          liveClassCount: Number(data.LiveClassCount) || 0,
          taskCount: Number(data.TaskCount) || 0,
          examCount: Number(data.ExamCount) || 0,
        });
      } else {
        // optional: log or toast; keep UI graceful
        // const text = await res.text();
        // console.warn("Dashboard fetch failed:", res.status, text);
      }
    } catch (err) {
      // Ignore fetch aborts; rethrow/log others
      if (err && (err.name === "AbortError" || err.code === 20)) {
        // silently ignore
      } else {
        console.error("Dashboard fetch error:", err);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  })();

  return () => {
    isMounted = false;
    ac.abort();
  };
}, []);


  // Cards wired to proc fields
  const cards = [
    { label: "Students", value: summary.studentCount, icon: "fa-users", link: "/manage-students" },
    { label: "Professors", value: summary.professorCount, icon: "fa-user-tie", link: "/professors" },
    { label: "Courses", value: summary.courseCount, icon: "fa-book", link: "/my-courseware" },
    { label: "Live Classes", value: summary.liveClassCount, icon: "fa-video-camera", link: "/instructor/live-classes" },
    { label: "Tasks", value: summary.taskCount, icon: "fa-tasks", link: "/taskboard" },
    { label: "Exams (MT/DT)", value: summary.examCount, icon: "fa-file-alt", link: "/exams" },
    { label: "Library Books", value: summary.bookCount, icon: "fa-book-open", link: "/library" },
  ];

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="College" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              {/* Hero */}
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  Welcome back, <strong>{instructorName}</strong> 👋
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Here’s a quick snapshot of your college dashboard
                </p>
              </div>

              {/* Cards */}
              <div className="row">
                {cards.map((item, idx) => (
                  <div className="col-12 col-sm-6 col-lg-3 mb-3" key={idx}>
                    <div
                      className="welcome-card dashboard-card animate-welcome text-center"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(item.link)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(item.link)}
                      style={{ cursor: "pointer" }}
                      aria-label={`Open ${item.label}`}
                      title={`Go to ${item.label}`}
                    >
                      <i className={`fa ${item.icon} dashboard-icon text-primary`} />
                      <div className="dashboard-label text-muted">{item.label}</div>
                      <div className="dashboard-count text-dark fw-bold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* If you want to reintroduce grading later, add it back here */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CollegeDashboard;
