// File: pages/InstructorMeetingsPage.jsx
import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

function InstructorMeetingsPage() {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    const decoded = jwtDecode(token);
    const userId = decoded.UserId || decoded.userId;

    const fetchMeetings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Meeting/Relevant/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setMeetings(data);
      } catch (err) {
        console.error("Meeting fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && <div className="page-loader-wrapper"><div className="loader" /></div>}
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
              <h2 className="text-primary">Scheduled Meetings</h2>
              <p className="text-muted">All upcoming or relevant academic meetings assigned to you.</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white"><h6>Upcoming Meetings</h6></div>
              <div className="card-body p-0">
                {meetings.length === 0 ? (
                  <div className="text-center py-4 text-muted">No upcoming meetings found.</div>
                ) : (
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Mode</th>
                        <th>Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map((m, idx) => (
                        <tr key={idx}>
                          <td>{m.title}</td>
                          <td>{new Date(m.scheduledAt).toLocaleString()}</td>
                          <td>{m.description}</td>
                          <td>
                            {m.meetingType === "Online" ? (
                              <a href={m.meetingLink} target="_blank" rel="noreferrer">Join</a>
                            ) : (
                              m.meetingLocation || "N/A"
                            )}
                          </td>
                          <td>
                            {[
                              m.targetProgramme,
                              m.targetSemester,
                              m.targetCourse
                            ].filter(Boolean).join(" / ") || "All"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        </div>
         
      </div>
    </div>
  );
}

export default InstructorMeetingsPage;