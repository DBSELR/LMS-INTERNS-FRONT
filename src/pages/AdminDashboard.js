// File: src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";


function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    students: 0,
    professors: 0,
    programmes: 0,
    books: 0,
    exams: 0,
    assignments: 0,
    liveClasses: 0,
    tasks: 0,
    leaves: 0,
  });
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const name = decoded["Username"] || decoded.name || "Admin";
      setAdminName(name);

      if (role !== "Admin" && role !== "Business_Executive") {
        setLoading(false);
        navigate("/unauthorized");
        return;
      }

      const fetchSummary = async () => {
        try {
          const token = localStorage.getItem("jwt");
          const res = await fetch(`${API_BASE_URL}/AdminSummary/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          setSummary({
            students: data.students || 0,
            professors: data.professors || 0,
            programmes: data.programmes || 0,
            books: data.books || 0,
            exams: data.exams || 0,
            assignments: data.assignments || 0,
            liveClasses: data.liveClasses || 0,
            tasks: data.tasks || 0,
            leaves: data.leaves || 0,
          });
          console.log(data);
        } catch (err) {
          console.error("Failed to fetch dashboard summary", err);
        } finally {
          setLoading(false);
        }
      };

      fetchSummary();
    } catch (err) {
      console.error("Token decode error", err);
      setLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   if (summary) fetchSummary();
  // }, [summary]);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader" />
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />
      
      <div className="section-wrapper">
      <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            {/* Welcome Header */}
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                Welcome back, <strong>{adminName}</strong> 👋
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">
                Here’s a quick snapshot of your Admin LMS dashboard.
              </p>
            </div>



            {/* Dashboard Cards */}
            <div className="row ">
              {[
                {
                  label: "Faculty",
                  value: summary.professors,
                  icon: "fa-male",
                  link: "/professors",
                },
                {
                  label: "Students",
                  value: summary.students,
                  icon: "fa-user-graduate",
                  link: "/students",
                },
                {
                  label: "Board",
                  value: summary.programmes,
                  icon: "fa-list-alt",
                  link: "/AdminDashboardTabs",
                },
                {
                  label: "Discussions",
                  value: summary.programmes,
                  icon: "fa-list",
                  link: "/adddiscussions",
                },
                {
                  label: "Library Books",
                  value: summary.books,
                  icon: "fa-book",
                  link: "/library",
                },
                // {
                //   label: "Examinations",
                //   value: summary.exams,
                //   icon: "fa-pencil-square-o",
                //   link: "/admin-exams",
                // },
                // {
                //   label: "Assignments",
                //   value: summary.assignments,
                //   icon: "fa-pencil-square-o",
                //   link: "/admin-manage-assignments",
                // },
                {
                  label: "Live Classes",
                  value: summary.liveClasses,
                  icon: "fa-video-camera",
                  link: "/instructor/live-classes",
                },
                {
                  label: "Tasks",
                  value: summary.tasks,
                  icon: "fa-tasks",
                  link: "/taskboard",
                },
              ].map((item, idx) => (

      <div className="col-12 col-sm-6 col-lg-3 mb-3" key={idx}>
      <div
        className="welcome-card dashboard-card animate-welcome text-center"
        role="button"
        tabIndex={0}
        onClick={() => navigate(item.link)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(item.link)}
        // className="compact-card text-center shadow-sm"
        title={`Go to ${item.label}`}
        aria-label={`Open ${item.label}`}
      >
        <i className={`fa ${item.icon}  dashboard-icon text-primary`} aria-hidden="true" />
        <div className="dashboard-label text-dark fw-1000">{item.label}</div>
        <div className="dashboard-count text-dark fw-bold">{item.value}</div>
      </div>
               </div>
                // </div>
              ))}
            </div>
          </div>
        </div>
         
      </div>
      </div>

    </div>
  );
}

export default AdminDashboard;
