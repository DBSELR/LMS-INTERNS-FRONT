import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import CalendarViewsAdminLiveClass from "../components/events/CalendarViewsAdminLiveClass";
import { Collapse } from "react-bootstrap";
import { FaChevronDown, FaChevronUp, FaList, FaCalendar } from "react-icons/fa";
import API_BASE_URL from "../config";

const AdminLiveClassDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openGroup, setOpenGroup] = useState({});
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/LiveClass/All`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data from API:", data);
        if (Array.isArray(data)) {
          const filteredData = data.filter((cls) => cls !== null);
          setClasses(filteredData);
          console.log("Filtered classes:", filteredData);
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch live classes:", error);
        setClasses([]);
      })
      .finally(() => setLoading(false));
  }, []);

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

  const filtered = classes.filter((cls) =>
    (cls?.className || "").toLowerCase().includes(search.toLowerCase()) ||
    (cls?.instructorName || "").toLowerCase().includes(search.toLowerCase()) ||
    (cls?.courseName || "").toLowerCase().includes(search.toLowerCase()) ||
    (cls?.semester || "").toLowerCase().includes(search.toLowerCase())
  );

  const groupedClasses = filtered.reduce((acc, cls) => {
    const groupKey = `${cls.courseName || "No Course"} - ${cls.semester || "No Semester"}`;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(cls);
    return acc;
  }, {});

const calendarEvents = classes.map((cls) => ({
  id: cls.liveClassId,
  title: cls.className,
  start: `${cls.liveDate.split("T")[0]}T${cls.startTime}`, // no :00
  end: `${cls.liveDate.split("T")[0]}T${cls.endTime}`,
  extendedProps: {
    instructor: cls.instructorName,
    course: cls.courseName,
    semester: cls.semester,
    status: getClassStatus(cls),
    meetingLink: cls.meetingLink,
  },
}));


  console.log("Calendar events prepared:", calendarEvents);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {/* Styles omitted for brevity — keep your styles here as before */}

      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
         <div className="page admin-dashboard">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
           <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                  <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                           <i class="fa-solid fa-video-camera"></i> Manage Live Classes
                          </h2>
                          <p className="text-muted mb-0 dashboard-hero-sub">
                            View, manage, and schedule live classes
                          </p>
                        </div>

            <div className="tab-buttons-container">
              <button
                className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
                onClick={() => setActiveTab("list")}
              >
                <FaList /> List View
              </button>
              <button
                className={`tab-btn ${activeTab === "calendar" ? "active" : ""}`}
                onClick={() => setActiveTab("calendar")}
              >
                <FaCalendar /> Calendar View
              </button>
            </div>

            {activeTab === "list" && (
              <>
                <div className="card shadow-sm mb-4">
                  <div className="card-body d-flex justify-content-between flex-wrap align-items-center">
                    <input
                      type="text"
                      className="form-control w-50 mb-2 mb-md-0"
                      placeholder="Search by Class, Instructor, Course, Semester..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {Object.keys(groupedClasses).length > 0 ? (
                  Object.entries(groupedClasses).map(([groupName, classList], index) => (
                    <div key={groupName} className="mb-4">
                      <button
                        className="w-100 text-black text-left px-3 py-2 d-flex justify-content-between align-items-center semester-toggle-btn"
                        style={{ fontWeight: "bold" }}
                        onClick={() =>
                          setOpenGroup((prev) => ({ ...prev, [index]: !prev[index] }))
                        }
                      >
                        <span>{groupName} ({classList.length} Classes)</span>
                        {openGroup[index] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>

                      <Collapse in={!!openGroup[index]}>
                        <div className="mt-3">
                          <div className="row">
                            {classList.map((cls) => {
                              const status = getClassStatus(cls);
                              return (
                                <div className="col-lg-4 col-md-6 mb-4" key={cls.liveClassId}>
                                  <div className="card shadow-sm h-100 border-0">
                                    <div className="card-body d-flex flex-column">
                                      <h5 className="text-primary font-weight-bold mb-2">{cls.className}</h5>
                                      <p className="text-muted mb-1"><strong>Instructor:</strong> {cls.instructorName}</p>
                                      <p className="text-muted mb-1"><strong>Subject:</strong> {cls.paperCode}-{cls.paperName} ({cls.semester}/{cls.batchName})</p>
                                      <p className="text-muted mb-3">
                                        <strong>Date:</strong>{" "}
                                        {(() => {
                                          const d = new Date(cls.liveDate);
                                          return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                        })()}{" | "}
                                        {(() => {
                                          const [h, m] = cls.startTime.split(':').map(Number);
                                          const formattedHour = h % 12 === 0 ? 12 : h % 12;
                                          const period = h >= 12 ? "PM" : "AM";
                                          return `${formattedHour}:${m} ${period}`;
                                        })()}{" To "}
                                        {(() => {
                                          const [h, m] = cls.endTime.split(':').map(Number);
                                          const formattedHour = h % 12 === 0 ? 12 : h % 12;
                                          const period = h >= 12 ? "PM" : "AM";
                                          return `${formattedHour}:${m} ${period}`;
                                        })()}
                                      </p>
                                      <div className="mt-auto d-flex justify-content-between align-items-center">
                                        <span className={`badge px-3 py-2 ${status === "Scheduled" ? "badge-primary" : status === "Live Now" ? "badge-success jiggle-effect" : "bg-secondary"}`}>
                                          {status}
                                        </span>
                                        {status === "Live Now" ? (
                                          <button
                                            className="btn btn-sm btn-outline-primary rounded-pill"
                                            onClick={() => {
                                              if (cls.meetingLink && cls.meetingLink !== "link") {
                                                window.open(cls.meetingLink, "_blank");
                                              } else {
                                                alert("Meeting link not available.");
                                              }
                                            }}
                                          >
                                            <i className="fa fa-play-circle mr-1"></i> Join
                                          </button>
                                        ) : status === "Completed" ? (
                                          <span className="text-muted">Class completed</span>
                                        ) : (
                                          <span className="text-muted">Not yet available</span>
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
                  <div className="text-center text-muted py-5">
                    <h5>No live classes found.</h5>
                  </div>
                )}
              </>
            )}

            {activeTab === "calendar" && (
              <CalendarViewsAdminLiveClass events={calendarEvents} active={activeTab === "calendar"} />
            )}
          </div>
        </div>
         
      </div>
      </div>
    </div>
  );
};

export default AdminLiveClassDashboard;