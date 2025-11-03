import React, { useEffect, useState, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import ConfirmationPopup from "../components/ConfirmationPopup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Modal, Collapse } from "react-bootstrap";
import CalendarViewsAdminLiveClass from "../components/events/CalendarViewsAdminLiveClass";
import { FaCalendar, FaUsers, FaBookOpen, FaClock, FaChevronDown, FaChevronUp } from "react-icons/fa";
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

function InstructorLiveClassManage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // tabs
  const [activeTab, setActiveTab] = useState("batch");

  // collapse states
  const [openBatchGroups, setOpenBatchGroups] = useState({});
  const [openSubjectGroups, setOpenSubjectGroups] = useState({});

  // "Are all expanded?" state for current tab
  const [allOpen, setAllOpen] = useState(true);

  // form state
  const [form, setForm] = useState({
    className: "",
    liveDate: "",
    startTime: "",
    endTime: "",
    meetingLink: "",
    examinationID: "",
    batchName: "",
  });

  // auth data
  const token = localStorage.getItem("jwt");
  const decoded = jwtDecode(token);
  const instructorId = decoded["UserId"] || decoded.userId || decoded.nameid;

  // helper DELETE API
  const DELETE_API = (id) =>
    API_BASE_URL
      ? `${API_BASE_URL}/LiveClass/Delete/${id}`
      : `https://localhost:7099/api/LiveClass/Delete/${id}`;

  // -------- group helpers (pure) --------
  const groupByBatchSemester = (data) => {
    const grouped = {};
    data.forEach((cls) => {
      const key = `${cls.batchName} `;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(cls);
    });
    return grouped;
  };

  const groupBySubject = (data) => {
    const grouped = {};
    data.forEach((cls) => {
      const courseInfo = assignedCourses.find(
        (c) => c.examinationID === cls.examinationID
      );
      let key = cls.className; // fallback
      if (courseInfo) {
        key = `Subject: ${courseInfo.paperCode} - ${courseInfo.paperName} (${courseInfo.semester} batch / ${
          courseInfo.batchName || "N/A"
        })`;
      }
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(cls);
    });
    return grouped;
  };

  // memoize groups so we don't recompute on every render unnecessarily
  const batchGroups = useMemo(() => groupByBatchSemester(classes), [classes]);
  const subjectGroups = useMemo(() => groupBySubject(classes), [classes, assignedCourses]);

  // fetch data
  useEffect(() => {
    console.clear();
    console.log("📥 Instructor ID:", instructorId);
    fetchClasses();
    fetchAssignedCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  // after classes or assignedCourses update, initialize expand/collapse maps
  useEffect(() => {
    // Build default open maps = all true
    const newBatchOpen = {};
    Object.keys(batchGroups).forEach((key) => {
      newBatchOpen[key] = true;
    });

    const newSubjectOpen = {};
    Object.keys(subjectGroups).forEach((key) => {
      newSubjectOpen[key] = true;
    });

    setOpenBatchGroups(newBatchOpen);
    setOpenSubjectGroups(newSubjectOpen);

    // reset global allOpen to true because we just expanded them
    setAllOpen(true);
  }, [batchGroups, subjectGroups]);

  const fetchClasses = () => {
    fetch(`${API_BASE_URL}/LiveClass/Instructor/${instructorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Classes fetched:", data);
        setClasses(data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch classes:", err);
        toast.error("❌ Failed to fetch classes");
      })
      .finally(() => setLoading(false));
  };

  const fetchAssignedCourses = () => {
    fetch(`${API_BASE_URL}/course/by-instructor/${instructorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Assigned courses fetched:", data);
        setAssignedCourses(data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch assigned courses:", err);
        toast.error("❌ Failed to fetch assigned courses");
      });
  };

  // toggle all for current tab
  const toggleAll = () => {
    if (activeTab === "batch") {
      // flip everything in batchGroups
      const newVal = !allOpen;
      const updated = {};
      Object.keys(batchGroups).forEach((key) => {
        updated[key] = newVal;
      });
      setOpenBatchGroups(updated);
      setAllOpen(newVal);
    } else if (activeTab === "subject") {
      const newVal = !allOpen;
      const updated = {};
      Object.keys(subjectGroups).forEach((key) => {
        updated[key] = newVal;
      });
      setOpenSubjectGroups(updated);
      setAllOpen(newVal);
    }
  };

  const handleCourseChange = (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) {
      setForm((prevForm) => ({
        ...prevForm,
        examinationID: "",
        batchName: "",
      }));
      return;
    }

    const selectedId = parseInt(selectedValue);
    const selectedCourse = assignedCourses.find(
      (c) => c.examinationID === selectedId
    );

    if (selectedCourse) {
      setForm((prevForm) => ({
        ...prevForm,
        examinationID: selectedId,
        batchName: selectedCourse.batchName || "",
      }));
    }

    if (errors.courseId) {
      setErrors({ ...errors, courseId: "" });
    }
  };

  const handleSubmit = async () => {
    const normalizeTime = (time) => {
      if (!time || typeof time !== "string") return "00:00:00";
      const parts = time.split(":");
      if (parts.length === 2) return `${time}:00`;
      return time;
    };

    const normalizedStart = normalizeTime(form.startTime);
    const normalizedEnd = normalizeTime(form.endTime);

    if (
      !form.liveDate ||
      !form.startTime ||
      !form.endTime ||
      !form.examinationID
    ) {
      toast.warning("⚠️ Please fill in all required fields.");
      return;
    }

    const examinationID = parseInt(form.examinationID);
    if (isNaN(examinationID)) {
      toast.error("❌ Invalid course selection.");
      return;
    }

    const startDateString = `${form.liveDate} ${normalizedStart}`;
    const endDateString = `${form.liveDate} ${normalizedEnd}`;
    const start = new Date(startDateString);
    const end = new Date(endDateString);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("❌ Invalid date or time.");
      return;
    }

    if (end <= start) {
      toast.warning("⚠️ End time must be after start time.");
      return;
    }

    const payload = {
      ...form,
      instructorId: parseInt(instructorId),
      examinationID,
      liveDate: start.toISOString(),
      startTime: normalizedStart,
      endTime: normalizedEnd,
      status: "Scheduled",
    };

    const url = editingId
      ? `${API_BASE_URL}/LiveClass/Update/${editingId}`
      : `${API_BASE_URL}/LiveClass/Create`;

    const method = editingId ? "PUT" : "POST";

    console.log("📤 Payload being submitted:", payload);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resultText = await res.text();
      console.log("📥 Server response:", resultText);

      if (!res.ok) {
        toast.error(`❌ Failed: ${resultText}`);
        return;
      }

      toast.success(
        editingId
          ? "✅ Class Updated successfully!"
          : "✅ Class Created successfully!"
      );
      setForm({
        className: "",
        liveDate: "",
        startTime: "",
        endTime: "",
        meetingLink: "",
        examinationID: "",
        batchName: "",
      });

      setEditingId(null);
      fetchClasses();
      setShowModal(false);
    } catch (err) {
      console.error("❌ Error while submitting:", err);
      toast.error("❌ Error while submitting class");
    }
  };

  const handleEdit = (cls) => {
    console.log("✏️ Editing class:", cls);
    setForm({
      className: cls.className,
      liveDate: new Date(cls.liveDate).toLocaleDateString("en-CA"),
      startTime: cls.startTime,
      endTime: cls.endTime,
      meetingLink: cls.meetingLink,
      examinationID: cls.examinationID,
      batchName: cls.batchName,
    });
    setEditingId(cls.liveClassId);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const endpoint = DELETE_API(deleteId);

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok || res.status === 204) {
        setClasses((prev) => prev.filter((c) => c.liveClassId !== deleteId));
        toast.success("✅ Class Deleted successfully.");
      } else {
        const errText = await res.text().catch(() => "");
        toast.error(`❌ Failed to delete class. ${errText || ""}`);
      }
    } catch (err) {
      console.error("❌ Error deleting class:", err);
      toast.error("❌ Error deleting class.");
    } finally {
      setShowDeletePopup(false);
      setDeleteId(null);
    }
  };

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

  const calendarEvents = classes.map((cls) => ({
    id: cls.liveClassId,
    title: cls.className,
    start: `${cls.liveDate.split("T")[0]}T${cls.startTime}`,
    end: `${cls.liveDate.split("T")[0]}T${cls.endTime}`,
    extendedProps: {
      instructor: cls.instructorName,
      course: cls.courseName,
      status: getClassStatus(cls),
      meetingLink: cls.meetingLink,
    },
  }));

  const getBadgeColor = (status) => {
    if (status === "Live Now") return "bg-success";
    if (status === "Scheduled") return "bg-warning";
    if (status === "Completed") return "bg-danger";
    return "bg-secondary";
  };

  const handleUploadRecording = async (liveClassId) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "video/*";
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          `${API_BASE_URL}/LiveClass/UploadLiveClass?id=${liveClassId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          toast.success("✅ Recording uploaded successfully!");
          fetchClasses();
        } else {
          const errText = await response.text();
          toast.error(`❌ Upload failed: ${errText}`);
        }
      } catch (err) {
        console.error("❌ Upload error:", err);
        toast.error("❌ Error uploading file.");
      }
    };
    fileInput.click();
  };

  const renderClassCard = (cls) => {
    const status = getClassStatus(cls);
    const [year, month, day] = cls.liveDate.split("T")[0].split("-");
    const [startHour, startMinute] = cls.startTime.split(":").map(Number);
    const [endHour, endMinute] = cls.endTime.split(":").map(Number);
    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);

    const courseInfo = assignedCourses.find(
      (c) => c.examinationID === cls.examinationID
    );

    const subjectLine = courseInfo
      ? `${courseInfo.paperCode} - ${courseInfo.paperName} ( Batch / ${
          courseInfo.batchName || "N/A"
        })`
      : "Subject info not found";

    return (
      <div
        key={cls.liveClassId}
        className="card border-0 mb-3 d-flex flex-column"
        style={{
          background: "linear-gradient(135deg, #f0f0ff, #ffffff)",
          borderRadius: "20px",
          minHeight: "200px",
          height: "95%",
        }}
      >
        <div className="card-body d-flex flex-column p-3">
          <h5 className="text-dark fw-bold mb-2 d-flex align-items-center justify-content-between">
            <span>
              <i className="fa fa-video-camera mr-2 text-primary"></i>{" "}
              {cls.className}
            </span>

            <button
              type="button"
              title="Delete Live Class"
              className="btn btn-sm btn-outline-danger"
              style={{ borderRadius: 12, minWidth: 36 }}
              onClick={() => {
                setDeleteId(cls.liveClassId);
                setShowDeletePopup(true);
              }}
            >
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          </h5>

          <div className="mb-2 text-muted small">
            <i className="fa fa-book text-secondary me-1"></i>{" "}
            <strong>Subject:</strong> {subjectLine}
          </div>

          <div className="text-muted small mb-1">
            <i className="fa fa-calendar-alt me-1 text-secondary"></i>{" "}
            <strong>Date:</strong> {startDateTime.toLocaleDateString("en-GB")}
          </div>

          <div className="text-muted small mb-1">
            <i className="fa fa-clock me-1 text-secondary"></i>{" "}
            <strong>Time:</strong> {formatTime(cls.startTime)} to{" "}
            {formatTime(cls.endTime)}
          </div>

          {status !== "Completed" && (
            <div className="text-muted small mb-2">
              <i className="fa fa-hourglass-half me-1 text-secondary"></i>{" "}
              <CountdownTimer startDateTime={startDateTime} />
            </div>
          )}

          <div className="text-muted small mb-1">
            <i className="fa fa-info-circle me-1 text-secondary"></i>{" "}
            <strong>Status:</strong>{" "}
            <span className={`badge ${getBadgeColor(status)} px-2 py-1`}>
              {status}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-2 pt-2">
            {status !== "Completed" ? (
              <>
                {cls.meetingLink && status !== "Completed" && (
                  <button
                    type="button"
                    className="btn btn-sm mr-2 btn-success"
                    onClick={() => window.open(cls.meetingLink, "_blank")}
                  >
                    <i className="fa fa-sign-in-alt me-1"></i> Join
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm mr-2 btn-info"
                  onClick={() => handleEdit(cls)}
                >
                  <i className="fa fa-edit me-1"></i> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-sm mr-2 btn-danger"
                  onClick={() => {
                    setDeleteId(cls.liveClassId);
                    setShowDeletePopup(true);
                  }}
                >
                  <i className="fa fa-trash me-1"></i> Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-warning"
                onClick={() => handleUploadRecording(cls.liveClassId)}
              >
                <i className="fa fa-upload me-1"></i> Upload Recording
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <style>{`
        @keyframes jiggle {
          0% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          75% { transform: translateX(-2px); }
          100% { transform: translateX(0); }
        }
        .jiggle-effect {
          animation: jiggle 0.5s infinite;
        }
        .btn.btn-outline-danger i.fa-trash { pointer-events: none; }
      `}</style>

      <HeaderTop />
      <LeftSidebar role="Instructor" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <i className="fa-solid fa-video-camera"></i> Manage Live
                  Classes
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  View, manage, and schedule live classes
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : classes.length === 0 ? (
            <div className="text-center py-4">No classes available.</div>
          ) : (
            <div></div>
          )}

          <div className="container-fluid mb-3">
            <div className="d-flex justify-content-between">
              {(activeTab === "batch" || activeTab === "subject") && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={toggleAll}
                  title={allOpen ? "Collapse all" : "Expand all"}
                  aria-label={allOpen ? "Collapse all" : "Expand all"}
                  style={{ marginLeft: "10px" }}
                >
                  {allOpen ? (
                    <i className="fa-solid fa-minimize" />
                  ) : (
                    <i className="fa-solid fa-maximize" />
                  )}
                </button>
              )}

              <Button variant="primary" onClick={() => setShowModal(true)}>
                + Add New Live Class
              </Button>
            </div>
          </div>

          <div className="container-fluid">
            <div className="d-flex justify-content-center gap-3 mt-3 mb-3 flex-wrap tab-buttons-container">
              

              <button
                className={`tab-btn ${activeTab === "batch" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("batch");
                  // sync allOpen to reflect batch state
                  const vals = Object.values(openBatchGroups);
                  const everyOpen = vals.length === 0 ? true : vals.every(Boolean);
                  setAllOpen(everyOpen);
                }}
              >
                <FaUsers className="me-1" style={{ marginRight: "10px" }} />{" "}
                Batch wise
              </button>

              <button
                className={`tab-btn ${activeTab === "subject" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("subject");
                  const vals = Object.values(openSubjectGroups);
                  const everyOpen =
                    vals.length === 0 ? true : vals.every(Boolean);
                  setAllOpen(everyOpen);
                }}
              >
                <FaBookOpen className="me-1" style={{ marginRight: "10px" }} />{" "}
                Subject wise
              </button>

              <button
                className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
                onClick={() => setActiveTab("upcoming")}
              >
                <FaClock className="me-1" style={{ marginRight: "10px" }} />{" "}
                Upcoming
              </button>

              <button
                className={`tab-btn ${activeTab === "calendar" ? "active" : ""}`}
                onClick={() => setActiveTab("calendar")}
              >
                <FaCalendar /> Calendar View
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <>
                {/* Batch wise */}
                {activeTab === "batch" &&
                  Object.entries(batchGroups).map(([key, group]) => (
                    <div key={key} className="mb-3 ">
                      <div
                        className="semester-toggle-btn p-2 cursor-pointer d-flex justify-content-between align-items-center"
                        onClick={() =>
                          setOpenBatchGroups((prev) => {
                            const next = {
                              ...prev,
                              [key]: !prev[key],
                            };
                            // update allOpen if any closed
                            const vals = Object.values(next);
                            const allTrue =
                              vals.length === 0 ? true : vals.every(Boolean);
                            setAllOpen(allTrue);
                            return next;
                          })
                        }
                        style={{ fontWeight: "600" }}
                      >
                        <span>
                          {key} ({group.length} classes)
                        </span>
                        {openBatchGroups[key] ? (
                          <FaChevronUp style={{ marginRight: "10px" }} />
                        ) : (
                          <FaChevronDown style={{ marginRight: "10px" }} />
                        )}
                      </div>

                      <Collapse in={openBatchGroups[key]}>
                        <div className="p-3">
                          <div className="row">
                            {group.map((cls) => (
                              <div
                                key={cls.liveClassId}
                                className="col-lg-4 col-md-6 col-12"
                              >
                                {renderClassCard(cls)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  ))}

                {/* Subject wise */}
                {activeTab === "subject" &&
                  Object.entries(subjectGroups).map(([key, group]) => (
                    <div key={key} className="mb-3">
                      <div
                        className="semester-toggle-btn p-2 cursor-pointer d-flex justify-content-between align-items-center"
                        onClick={() =>
                          setOpenSubjectGroups((prev) => {
                            const next = {
                              ...prev,
                              [key]: !prev[key],
                            };
                            const vals = Object.values(next);
                            const allTrue =
                              vals.length === 0 ? true : vals.every(Boolean);
                            setAllOpen(allTrue);
                            return next;
                          })
                        }
                        style={{ fontWeight: "600" }}
                      >
                        <span>
                          {key} ({group.length} classes)
                        </span>
                        {openSubjectGroups[key] ? (
                          <FaChevronUp style={{ marginRight: "10px" }} />
                        ) : (
                          <FaChevronDown style={{ marginRight: "10px" }} />
                        )}
                      </div>
                      <Collapse in={openSubjectGroups[key]}>
                        <div className="p-3">
                          <div className="row">
                            {group.map((cls) => (
                              <div
                                key={cls.liveClassId}
                                className="col-lg-4 col-md-6 col-12"
                                style={{ marginBottom: "5px" }}
                              >
                                {renderClassCard(cls)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  ))}

                {/* Upcoming */}
                {activeTab === "upcoming" && (
                  <>
                    {classes.filter((cls) =>
                      ["Scheduled", "Live Now"].includes(getClassStatus(cls))
                    ).length === 0 ? (
                      <p>No upcoming classes.</p>
                    ) : (
                      <div className="row">
                        {classes
                          .filter((cls) =>
                            ["Scheduled", "Live Now"].includes(
                              getClassStatus(cls)
                            )
                          )
                          .map((cls) => (
                            <div
                              key={cls.liveClassId}
                              className="col-lg-4 col-md-6 col-12"
                            >
                              {renderClassCard(cls)}
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === "calendar" && (
              <CalendarViewsAdminLiveClass
                events={calendarEvents}
                active={activeTab === "calendar"}
              />
            )}
          </div>

           
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingId(null);
        }}
      >
        <Modal.Header>
          <Modal.Title>{editingId ? "Edit" : "Add New"} Live Class</Modal.Title>
          <button
            type="button"
            className="close"
            onClick={() => {
              setShowModal(false);
              setEditingId(null);
            }}
          >
            <span>&times;</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3 mb-3">
            <div className="col-md-12">
              <input
                type="text"
                className="form-control"
                placeholder="Class Name"
                value={form.className}
                onChange={(e) =>
                  setForm({ ...form, className: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <input
                type="date"
                className="form-control"
                value={form.liveDate}
                onChange={(e) => setForm({ ...form, liveDate: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <input
                type="time"
                className="form-control"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
              />
            </div>
            <div className="col-md-6 mt-2">
              <input
                type="time"
                className="form-control"
                value={form.endTime}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
              />
            </div>
            <div className="col-md-6 mt-2">
              <input
                type="text"
                className="form-control"
                placeholder="Meeting Link"
                value={form.meetingLink}
                onChange={(e) =>
                  setForm({ ...form, meetingLink: e.target.value })
                }
              />
            </div>
            <div className="col-md-12 mt-2">
              <select
                className="form-control"
                value={form.examinationID}
                onChange={handleCourseChange}
              >
                <option value="">Select Subject</option>
                {assignedCourses.map((course, i) => (
                  <option key={i} value={course.examinationID}>
                    {course.paperCode}-{course.paperName} ( Batch -{" "}
                    {course.batchName || "N/A"} / {course.class || "N/A"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setEditingId(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            {editingId ? "Update" : "Add"} Class
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmationPopup
        show={showDeletePopup}
        message="Are you sure you want to delete this class?"
        onConfirm={handleDelete}
        onCancel={() => setShowDeletePopup(false)}
      />
    </div>
  );
}

function formatTime(timeStr) {
  const [hour, minute] = timeStr?.split(":") || ["00", "00"];
  const h = parseInt(hour);
  const period = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 === 0 ? 12 : h % 12;
  return `${formattedHour}:${minute} ${period}`;
}

export default InstructorLiveClassManage;
