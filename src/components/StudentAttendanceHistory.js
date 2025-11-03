import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

const localizer = momentLocalizer(moment);

function StudentAttendanceHistory() {
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState({ total: 0, present: 0, byExam: {} });

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      console.log("✅ Decoded JWT:", decoded);

      const studentId = decoded["UserId"] || decoded.userId || decoded.nameid;

      fetch(`${API_BASE_URL}/Attendance/bystudent/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("📥 Fetched attendance data:", data);

          if (Array.isArray(data) && data.length > 0) {
            setAttendance(data);

          const mappedEvents = data.map((record, idx) => {
  const liveDate = moment(record.liveDate).toDate();
  const className = record.className || "Unknown";
  const status = (record.attendanceStatus || "Unknown").trim();
  const colorFromApi = record.color || "#6c757d";
  const type = record.tYPE || "N/A";
  const paperName = record.paperName || "Unknown Paper";

  return {
    id: idx,
    title: `${className} (${type})`, // still available, just not used in UI
    paperName, // 👈 Add this
    start: liveDate,
    end: liveDate,
    allDay: true,
    status,
    colorFromApi: type === "LiveClass" ? colorFromApi : null,
  };
});



            console.log("🗓️ Mapped events:", mappedEvents);
              setEvents(mappedEvents);

            const total = data.length;
            const present = data.filter(
              (r) => (r.attendanceStatus || "").trim().toLowerCase() === "present"
            ).length;
 console.log("📊 R summary:", data);
            const byExam = {};
            for (const r of data) {
              const exam = `${r.paperName ?? "Unknown"}`;
              if (!byExam[exam]) byExam[exam] = { total: 0, present: 0 };
              byExam[exam].total++;
              if ((r.attendanceStatus || "").trim().toLowerCase() === "present") {
                byExam[exam].present++;
              }
            }

            console.log("📊 Attendance summary:", { total, present, byExam });
            setSummary({ total, present, byExam });

          }
        })
        .catch((err) => {
          console.error("❌ Failed to fetch attendance", err);
        });
    } catch (error) {
      console.error("❌ JWT decode error", error);
    }
  }, []);

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: "#ffffff",
        padding: "2px 4px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        border: "none",
        boxShadow: "none",
      },
    };
  };

  const getDotColor = (status) => {
    if (status.toLowerCase() === "present") return "#28a745";
    if (status.toLowerCase() === "absent") return "#dc3545";
    return "#6c757d";
  };

  const getTextColor = (event) => {
    return event.colorFromApi ? event.colorFromApi : "#000";
  };

  const getPercentage = (part, whole) =>
    whole === 0 ? "0%" : `${((part / whole) * 100).toFixed(1)}%`;

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar activePage="attendance" />

      <div className="section-wrapper">
           <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i class="fa-solid fa-check-circle"></i> Student Progress
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">
                View All your Progress
              </p>
            </div>

            {/* Attendance Summary */}
            <div className="card shadow-sm mb-4">
              <div className="card-body" style={{ maxHeight: 200, overflowY: "auto" }}>
                <h6 className="text-dark font-weight-bold mb-3">📊 Attendance Summary</h6>
                <p>
                  <strong>Overall:</strong> {getPercentage(summary.present, summary.total)} (
                  {summary.present}/{summary.total})
                </p>
                <ul className="mb-0 pl-3">
                  {Object.entries(summary.byExam).map(([exam, { total, present }]) => (
                    <li key={exam}>
                      <strong>{exam}:</strong> {getPercentage(present, total)} ({present}/{total})
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Calendar */}
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white d-flex align-items-center">
                <i className="fa fa-calendar-o mr-2"></i>
                <h6 className="mb-0">Calendar</h6>
              </div>
              <div className="card-body" style={{ overflowX: "auto" }}>
                <div style={{ height: 800 }}>
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={["month"]}
                    eventPropGetter={eventStyleGetter}
                    style={{ height: "100%" }}
                    popup={true}
                    dayLayoutAlgorithm="no-overlap"
                    date={currentDate}
                    onNavigate={(date) => setCurrentDate(date)}
                    components={{
                      month: {
                        event: ({ event }) => (
                          <div
                            title={event.paperName}
                            style={{
                              fontSize: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: getTextColor(event),
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: getDotColor(event.status),
                                marginRight: 4,
                              }}
                            ></span>
                            {event.paperName}
                          </div>
                        ),
                      },
                    }}
                    showMultiDayTimes={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
         
      </div>
      </div>
    </div>
  );
}

export default StudentAttendanceHistory;
