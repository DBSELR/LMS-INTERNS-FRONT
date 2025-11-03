import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function AdminCourseDashboard() {
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [liveClassStatus, setLiveClassStatus] = useState("Loading...");
  const [coursewareCount, setCoursewareCount] = useState({ pdfs: 0, videos: 0 });

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/Assignment/GetAllAssignments`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setAssignmentCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setAssignmentCount(0));

    fetch(`${API_BASE_URL}/LiveClass/All`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const upcoming = data.find(cls => new Date(cls.startTime) > new Date());
          setLiveClassStatus(upcoming ? `Next: ${upcoming.className}` : "No Live Class Scheduled For Upcoming Week");
        } else {
          setLiveClassStatus("No Live Class Scheduled For Upcoming Week");
        }
      })
      .catch(() => setLiveClassStatus("No Live Class Scheduled"));

    fetch(`${API_BASE_URL}/Content`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const pdfs = data.filter(d => d.contentType === "PDF").length;
          const videos = data.filter(d => d.contentType === "Video").length;
          setCoursewareCount({ pdfs, videos });
        }
      })
      .catch(() => setCoursewareCount({ pdfs: 0, videos: 0 }));
  }, []);

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
              <h2 className="text-primary mb-2">Courseware</h2>
              <p className="text-muted mb-0">Web Technologies</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/admin/courses" className="no-underline">
                <div className="card shadow-sm p-4 hover:shadow-md transition rounded-lg bg-white">
                  <h5 className="font-bold text-primary mb-2">📘 Courseware</h5>
                  <p>{coursewareCount.pdfs} PDFs</p>
                  <p>{coursewareCount.videos} Videos</p>
                </div>
              </Link>

              <Link to="/admin/live-classes" className="no-underline">
                <div className="card shadow-sm p-4 hover:shadow-md transition rounded-lg bg-white">
                  <h5 className="font-bold text-primary mb-2">📡 Live Class</h5>
                  <p>{liveClassStatus}</p>
                </div>
              </Link>

              <Link to="/admin-assignments" className="no-underline">
                <div className="card shadow-sm p-4 hover:shadow-md transition rounded-lg bg-white">
                  <h5 className="font-bold text-primary mb-2">📝 Continuous Assessment</h5>
                  <p>{assignmentCount} Assignments</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default AdminCourseDashboard;
