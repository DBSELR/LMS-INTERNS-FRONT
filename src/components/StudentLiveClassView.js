// File: StudentLiveClassView.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { Collapse } from "react-bootstrap";
import { FaChevronDown, FaChevronUp, FaUsers, FaCalendar } from "react-icons/fa";
import CalendarViewLiveClasses from "./events/CalendarViewLiveClasses";
import API_BASE_URL from "../config";

const CountdownTimer = ({ startDateTime }) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let diff = Math.max(0, Math.floor((startDateTime - now) / 1000));
      const days = Math.floor(diff / (3600 * 24));
      diff %= 3600 * 24;
      const hours = Math.floor(diff / 3600);
      diff %= 3600;
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft(`${days}d-${hours}h-${minutes}m-${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startDateTime]);

  return (
    <span className="badge px-2 py-1 bg-secondary ms-2" style={{ marginLeft: "15px" }}>
      Starts in: {timeLeft}
    </span>
  );
};

const StudentLiveClassView = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openGroup, setOpenGroup] = useState({});
  const [allOpen, setAllOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("batch");

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const id = decoded["UserId"] || decoded.userId || decoded.nameid;

      fetch(`${API_BASE_URL}/LiveClass/Student/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch live classes");
          return res.json();
        })
        .then((data) => {
          console.log("📦 Fetched live classes:", data);
           data.forEach(cls => {
    if (cls.fileurl) {
      console.log(`📺 Has recording: [${cls.className}] ➝ ${cls.fileurl}`);
    }
  });
          setClasses(Array.isArray(data) ? data.filter((cls) => cls !== null) : []);
        })
        .catch((err) => {
          console.error("Fetch error", err);
          setClasses([]);
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error("JWT decode error", error);
      setLoading(false);
    }
  }, []);

  const groupedClasses = classes.reduce((acc, cls) => {
    const groupKey = `${cls.batchName || "No Course"} - ${cls.semester || "No Semester"}`;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(cls);
    return acc;
  }, {});
  

  useEffect(() => {
    const initialState = {};
    Object.keys(groupedClasses).forEach((_, index) => {
      initialState[index] = true;
    });
    setOpenGroup(initialState);
  }, [classes]);

  const getClassStatus = (cls) => {
    const now = new Date();
    const [year, month, day] = cls.liveDate.split("T")[0].split("-");
    const [startHour, startMinute] = cls.startTime.split(":").map(Number);
    const [endHour, endMinute] = cls.endTime.split(":").map(Number);
    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);
    const joinStartTime = new Date(startDateTime.getTime() - 10 * 60 * 1000);

    if (now < joinStartTime) return "Scheduled";
    else if (now >= joinStartTime && now <= endDateTime) return "Live Now";
    else return "Completed";
  };

  const canJoin = (cls) => getClassStatus(cls) === "Live Now";

  const toggleAll = () => {
    const newState = {};
    Object.keys(groupedClasses).forEach((_, index) => {
      newState[index] = !allOpen;
    });
    setOpenGroup(newState);
    setAllOpen(!allOpen);
  };

  const getBadgeColor = (status) => {
    if (status === "Live Now") return "bg-success";
    if (status === "Scheduled") return "bg-warning";
    if (status === "Completed") return "bg-danger";
    return "bg-secondary";
  };

  const calendarEvents = classes.map((cls) => {
    const status = getClassStatus(cls);
    let startTime = cls.startTime?.trim();
    let endTime = cls.endTime?.trim();
    if (startTime && startTime.split(":").length === 2) startTime = `${startTime}:00`;
    if (endTime && endTime.split(":").length === 2) endTime = `${endTime}:00`;
    const startDate = `${cls.liveDate.split("T")[0]}T${startTime}`;
    const endDate = `${cls.liveDate.split("T")[0]}T${endTime}`;

    return {
      id: cls.liveClassId,
      title: cls.className,
      start: startDate,
      end: endDate,
      extendedProps: {
        instructor: cls.instructorName,
        subject: `${cls.papercode}-${cls.papername}`,
        meetingLink: cls.meetingLink,
        status,
      },
    };
  });

  return (
    <div id="main_content" className="font-muli theme-blush">
      {/* Modal for Recorded Video */}
      {showVideoModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Recorded Class</h5>
                <button type="button" className="btn-close" onClick={() => setShowVideoModal(false)}></button>
              </div>
            <div className="modal-body">
  <p className="text-muted">📺 URL: {selectedVideoUrl}</p>
  <video width="100%" height="auto" controls onError={(e) => console.error("❌ Video load error:", e)}>
    <source
  src={selectedVideoUrl}
  type={
    selectedVideoUrl.toLowerCase().includes(".mp4")
      ? "video/mp4"
      : "video/webm"
  }
/>

    Your browser does not support the video tag.
  </video>
</div>

            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      <div className="section-wrapper">
            <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i className="fa-solid fa-video"></i> Scheduled Live Classes
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">View and manage your scheduled live classes</p>
            </div>

            <div className="unit-tabs mb-4">
              <button className={`unit-tab ${activeTab === "batch" ? "active" : ""}`} onClick={() => setActiveTab("batch")}>
                <FaUsers /> List View
              </button>
              <button className={`unit-tab ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}>
                <FaCalendar /> Calendar View
              </button>
            </div>

            {activeTab === "batch" && (
              <>
                {Object.keys(groupedClasses).length > 0 && (
                  <div className="text-right mb-3">
                    <button className="btn btn-sm btn-outline-primary" onClick={toggleAll}>
                      {allOpen ? "Close All" : "Open All"}
                    </button>
                  </div>
                )}

                {Object.entries(groupedClasses).length > 0 ? (
                  Object.entries(groupedClasses).map(([groupName, classList], index) => (
                    <div key={groupName} className="mb-4">
                      <button
                        className="semester-toggle-btn"
                        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        onClick={() => setOpenGroup((prev) => ({ ...prev, [index]: !prev[index] }))}
                      >
                        <span>{groupName} ({classList.length} Classes)</span>
                        {openGroup[index] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>

                      <Collapse in={!!openGroup[index]}>
                        <div className="mt-3">
                          <div className="row">
                            {classList.map((cls) => {
                              const status = getClassStatus(cls);
                              const [year, month, day] = cls.liveDate.split("T")[0].split("-");
                              const [startHour, startMinute] = cls.startTime.split(":").map(Number);
                              const startDateTime = new Date(year, month - 1, day, startHour, startMinute);

                              return (
                                <div className="col-lg-4 col-md-6 mb-4" key={cls.liveClassId}>
                                  <div className="card shadow-sm h-100">
                                    <div className="card-body d-flex flex-column">
                                      <h5 className="text-primary">{cls.className}</h5>
                                      <p className="text-muted mb-1"><strong>Instructor:</strong> {cls.instructorName || "-"}</p>
                                      <p className="text-muted mb-1"><strong>Subject:</strong> {cls.papercode}-{cls.papername}</p>
                                      <p className="text-muted mb-3">
                                        <strong>Date & Time:</strong>{" "}
                                        {startDateTime.toLocaleString("en-GB", {
                                          day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true
                                        }).replace(",", "")}
                                      </p>

                                      <div className="mt-auto d-flex flex-column align-items-start">
                                        <div className="d-flex flex-wrap align-items-center">
                                          <span className={`badge px-3 py-2 me-2 ${getBadgeColor(status)} ${status === "Live Now" ? "jiggle-effect" : ""}`}>
                                            {status}
                                          </span>
                                          {status !== "Completed" && <CountdownTimer startDateTime={startDateTime} />}
                                        </div>

                                        {cls.meetingLink && canJoin(cls) && (
                                          <button className="btn btn-sm btn-success mt-2" onClick={() => window.open(cls.meetingLink, "_blank")}>
                                            <i className="fa fa-play-circle mr-1"></i> Join
                                          </button>
                                        )}

                                        {cls.fileurl && (
                                          <button
  className="btn btn-sm btn-info mt-2"
  onClick={() => {
   const fullUrl = cls.fileurl.startsWith("/")
  ? `http://localhost:5129${cls.fileurl}`
  : cls.fileurl;

console.log("🎬 Opening recording:", fullUrl);
setSelectedVideoUrl(fullUrl);

    setShowVideoModal(true);
  }}
>
  <i className="fa fa-video-camera me-1"></i> View Recorded
</button>

                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-5"><h5>No live classes found.</h5></div>
                )}
              </>
            )}

            {activeTab === "calendar" && (
              <CalendarViewLiveClasses events={calendarEvents} active={activeTab === "calendar"} />
            )}
          </div>
        </div>
         
      </div>
      </div>
    </div>
  );
};

export default StudentLiveClassView;
