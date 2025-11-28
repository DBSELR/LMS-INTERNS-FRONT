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
  console.log("=== CollegeDashboard: Component initialized ===");
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
    contentReadPercentPerBatch: 0,
    liveClassAttendancePercentPerBatch: 0,
  });

  useEffect(() => {
  let isMounted = true;
  const ac = new AbortController();

  (async () => {
    console.log("=== CollegeDashboard: Starting data fetch ===");
    
    const token = localStorage.getItem("jwt");
    console.log("Token retrieved from localStorage:", token ? "Token exists" : "No token found");
    
    if (!token) { 
      console.log("No JWT token found, stopping execution");
      if (isMounted) setLoading(false); 
      return; 
    }

    // decode safely
    let decoded;
    try { 
      decoded = jwtDecode(token); 
      console.log("JWT decoded successfully:", decoded);
    } catch (error) { 
      console.error("JWT decode failed:", error);
      if (isMounted) setLoading(false); 
      return; 
    }

    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded.role || "";
    const name = decoded["Username"] || decoded.name || "College";
    const instructorId = decoded?.UserId ?? decoded?.id ?? 0;

    console.log("Extracted from JWT:", { role, name, instructorId });

    if (isMounted) setInstructorName(name);
    
    if (role !== "College") {
      console.log(`Role check failed. Expected: 'College', Found: '${role}'`);
      if (isMounted) setLoading(false); 
      return; 
    }
    
    if (!instructorId) {
      console.log("No instructorId found in JWT");
      if (isMounted) setLoading(false); 
      return; 
    }

    const headers = { Authorization: `Bearer ${token}` };
    console.log("Request headers prepared:", headers);

    try {
      const apiUrl = `${API_BASE_URL}/InstructorSummary/collegedashboard/${instructorId}`;
      console.log("Making API request to:", apiUrl);
      
      const res = await fetch(
        apiUrl,
        { method: "GET", headers, signal: ac.signal }
      );

      console.log("API response received:", {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      });

      if (!isMounted || ac.signal.aborted) {
        console.log("Component unmounted or request aborted before processing response");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        console.log("Raw API response data:", data);
        
        if (!isMounted || ac.signal.aborted) {
          console.log("Component unmounted or request aborted after parsing JSON");
          return;
        }

        const summaryData = {
          studentCount: Number(data.studentCount || data.StudentCount) || 0,
          professorCount: Number(data.professorCount || data.ProfessorCount) || 0,
          courseCount: Number(data.courseCount || data.CourseCount) || 0,
          bookCount: Number(data.bookCount || data.BookCount) || 0,
          liveClassCount: Number(data.liveClassCount || data.LiveClassCount) || 0,
          taskCount: Number(data.taskCount || data.TaskCount) || 0,
          examCount: Number(data.examCount || data.ExamCount) || 0,
           contentReadPercentPerBatch:
              data.contentReadPercentPerBatch !== undefined &&
              data.contentReadPercentPerBatch !== null
                ? Number(data.contentReadPercentPerBatch)
                : 0,
                liveClassAttendancePercentPerBatch:
    data.liveClassAttendancePercentPerBatch !== undefined &&
    data.liveClassAttendancePercentPerBatch !== null
      ? Number(data.liveClassAttendancePercentPerBatch)
      : data.LiveClassAttendancePercentPerBatch !== undefined &&
        data.LiveClassAttendancePercentPerBatch !== null
      ? Number(data.LiveClassAttendancePercentPerBatch)
      : 0,
        };
        
        console.log("Processed summary data:", summaryData);
        setSummary(summaryData);
      } else {
        const errorText = await res.text();
        console.error("API request failed:", {
          status: res.status,
          statusText: res.statusText,
          responseText: errorText
        });
      }
    } catch (err) {
      // Ignore fetch aborts; rethrow/log others
      if (err && (err.name === "AbortError" || err.code === 20)) {
        console.log("Request was aborted (this is normal during component unmount)");
      } else {
        console.error("Dashboard fetch error:", {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
    } finally {
      console.log("Setting loading to false");
      if (isMounted) setLoading(false);
    }
  })();

  return () => {
    console.log("=== CollegeDashboard: Cleanup function called ===");
    isMounted = false;
    ac.abort();
  };
}, []);


  console.log("=== CollegeDashboard: Component render ===");
  console.log("Current summary state:", summary);
  console.log("Loading state:", loading);
  console.log("Instructor name:", instructorName);

  // Cards wired to proc fields
  const cards = [
    { label: "Students", value: summary.studentCount, icon: "fa-users", link: "/students" },
    { label: "Professors", value: summary.professorCount, icon: "fa-user-tie", link: "/professors" },
    { label: "Courses", value: summary.courseCount, icon: "fa-book", link: "/my-courseware" },
    { label: "Live Classes", value: summary.liveClassCount, icon: "fa-video-camera", link: "/instructor/live-classes" },
    { label: "Tasks", value: summary.taskCount, icon: "fa-tasks", link: "/taskboard" },
    { label: "Exams (MT/DT)", value: summary.examCount, icon: "fa-file-alt", link: "/exams" },
    { label: "Library Books", value: summary.bookCount, icon: "fa-book-open", link: "/library" },
    { label: "Content Read %",  value: `${summary.contentReadPercentPerBatch.toFixed?.(2) || "0.00"}%`, icon: "fa-line-chart", link: "/content-read-analytics" },
    {
        label: "Live Class Attendance %",
        value: `${summary.liveClassAttendancePercentPerBatch.toFixed?.(2) || "0.00"}%`,
        icon: "fa-bar-chart",
        link: "/live-class-attendance-analytics", // you can change this route as needed
      },
 
  ];

  console.log("Dashboard cards:", cards);

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
