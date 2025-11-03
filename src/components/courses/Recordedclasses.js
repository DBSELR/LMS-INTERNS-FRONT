// File: src/components/Recordedclasses.jsx
// ✅ Recorded Classes – subject-wise (collapsible), styled like InstructorLiveClassManage

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderTop from "../HeaderTop";
import RightSidebar from "../RightSidebar";
import LeftSidebar from "../LeftSidebar";
import Footer from "../Footer";
import API_BASE_URL from "../../config";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Modal, Button, Form, Collapse } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

/* ===== Local helpers ===== */
function resolveUrl(u, base) {
  if (!u) return null;
  const clean = String(u).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(clean)) return clean; // absolute URL
  if (!base) return clean.startsWith("/") ? clean : `/${clean}`;
  return `${base}${clean.startsWith("/") ? "" : "/"}${clean}`;
}

function formatDateISOToDisplay(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    const [y, m, day] = String(iso).split("T")[0].split("-");
    if (y && m && day) return `${day.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    return String(iso);
  }
  return d.toLocaleDateString("en-GB");
}

function formatTime(hhmm) {
  if (!hhmm) return "-";
  const [hour, minute] = hhmm.split(":");
  const h = parseInt(hour || "0", 10);
  const period = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 === 0 ? 12 : h % 12;
  return `${formattedHour}:${(minute || "00").padStart(2, "0")} ${period}`;
}

const Recordedclasses = () => {
  const navigate = useNavigate();

  // ===== Auth / Instructor =====
  const token = localStorage.getItem("jwt");
  const decoded = token ? jwtDecode(token) : {};
  const instructorId = decoded["UserId"] || decoded.userId || decoded.nameid || null;

  // ===== State =====
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [openSubjectGroups, setOpenSubjectGroups] = useState({}); // subject-wise collapses

  // Video modal
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeVideoSrc, setActiveVideoSrc] = useState(null);
  const [activeTitle, setActiveTitle] = useState("");

  // ===== Fetch data =====
  useEffect(() => {
    if (!instructorId) {
      toast.error("No instructor found in token.");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/LiveClass/Instructor/${instructorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error((await res.text()) || "Failed to fetch classes");
        const classData = await res.json();

        const rc = await fetch(
          `${API_BASE_URL}/course/by-instructor/${instructorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!rc.ok) throw new Error((await rc.text()) || "Failed to fetch assigned courses");
        const courseData = await rc.json();

        setClasses(Array.isArray(classData) ? classData : []);
        setAssignedCourses(Array.isArray(courseData) ? courseData : []);
      } catch (err) {
        console.error("❌ Recorded page fetch error:", err);
        toast.error(`Failed to load recorded classes. ${err?.message || ""}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

  // ===== Helpers to enrich =====
  // Map examinationID -> course details (paperCode, paperName, batchName, semester)
  const courseByExamId = useMemo(() => {
    const map = new Map();
    for (const c of assignedCourses) map.set(c.examinationID, c);
    return map;
  }, [assignedCourses]);

  // Attach course & normalize recording field
  const withCourseInfo = useMemo(() => {
    return classes.map((cls) => ({
      ...cls,
      _course: courseByExamId.get(cls.examinationID),
      _recording: cls.fileUrl || cls.fileurl || cls.recordingUrl || cls.RecordingUrl || null,
    }));
  }, [classes, courseByExamId]);

  // Recordings only
  const onlyRecorded = useMemo(
    () => withCourseInfo.filter((x) => !!x._recording),
    [withCourseInfo]
  );

  // Distinct batches (for filter)
  const batchOptions = useMemo(() => {
    const set = new Set();
    for (const x of withCourseInfo) {
      const b = x._course?.batchName || x.batchName || "N/A";
      set.add(b);
    }
    return ["ALL", ...Array.from(set)];
  }, [withCourseInfo]);

  // Global filters (search + batch) applied BEFORE grouping
  const filteredRecorded = useMemo(() => {
    const q = search.trim().toLowerCase();
    return onlyRecorded.filter((x) => {
      const batchName = x._course?.batchName || x.batchName || "N/A";
      if (batchFilter !== "ALL" && batchName !== batchFilter) return false;

      if (!q) return true;
      const text =
        [
          x.className,
          x._course?.paperCode,
          x._course?.paperName,
          batchName,
          x._course?.semester,
          x.meetingLink,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() || "";
      return text.includes(q);
    });
  }, [onlyRecorded, search, batchFilter]);

  // ===== Group by Subject (Subject-wise sections) =====
  const subjectGroups = useMemo(() => {
    const groups = {};
    for (const cls of filteredRecorded) {
      const c = cls._course;
      // Build a stable subject key per examinationID
      const subjectKey = c
        ? `${c.examinationID}`
        : `unknown-${cls.examinationID || cls.liveClassId}`;

      const subjectTitle = c
        ? `Subject: ${c.paperCode || ""} - ${c.paperName || ""} (${
            c.semester ? `Sem ${c.semester}` : "Sem N/A"
          } / ${c.batchName || "Batch N/A"})`
        : `Subject: ${cls.className}`;

      if (!groups[subjectKey]) {
        groups[subjectKey] = { title: subjectTitle, items: [] };
      }
      groups[subjectKey].items.push(cls);
    }
    return groups;
  }, [filteredRecorded]);

  // ===== Actions =====
  const openPlayer = (src, title) => {
    setActiveVideoSrc(src);
    setActiveTitle(title || "Recording");
    setShowPlayer(true);
  };
  const closePlayer = () => {
    setShowPlayer(false);
    setActiveVideoSrc(null);
  };

  /* ===== Styles matching InstructorLiveClassManage ===== */
  const styles = {
    card: {
      background: "linear-gradient(135deg, #f0f0ff, #ffffff)",
      borderRadius: "20px",
      minHeight: "200px",
      height: "95%",
      border: "0",
    },
    filterCard: { borderRadius: 16 },
    control: {
      height: 42,
      borderRadius: 12,
    },
    headerToggle: {
      fontWeight: 600,
      borderRadius: 12,
      background: "#fff",
      border: "1px solid #eee",
    },
  };

  const headerBadge = (text) => (
    <span className="badge bg-info text-dark px-2 py-1 ms-2" style={{ fontWeight: 600 }}>
      {text}
    </span>
  );

  return (
    <div id="main_content" className="font-muli theme-blush">
      <style>{`
        .recording-card h6 { font-weight: 700; }
        .recording-card .meta { color: #6c757d; font-size: 0.9rem; }
        .recording-card .btn-icon { min-width: 36px; border-radius: 12px; }

        /* Filter look to match LiveClass page */
        .filters-wrap .form-label { font-weight: 600; color: #495057; }
        .filters-wrap .form-control, .filters-wrap .form-select {
          height: 42px; border-radius: 12px; border: 1px solid #e9ecef;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
        }

        /* Subject header (collapsible) */
        .subject-header {
          padding: 10px 14px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #eee;
          background: #fff;
          border-radius: 12px;
        }
        .subject-header:hover { background: #f8f9fa; }
      `}</style>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              {/* Hero */}
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <div className="d-flex justify-content-between align-items-center mb-0">
                  <div style={{ width: "100px" }}></div>
                  <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                    <i className="fa-solid fa-video-camera"></i> Recorded Classes
                  </h2>
                  <button
                    onClick={() => navigate(-1)}
                    className="btn btn-outline-primary mt-3 mt-md-0"
                  >
                    <i className="fa fa-arrow-left mr-1"></i> Back
                  </button>
                </div>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Watch your completed live class recordings
                </p>
              </div>

              {/* Filters (look & spacing like InstructorLiveClassManage) */}
              <div className="card shadow-sm border-0 mb-3 filters-wrap" style={styles.filterCard}>
                <div className="card-body">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-7">
                      <label className="form-label mb-1">Search</label>
                      <input
                        type="text"
                        className="form-control"
                        style={styles.control}
                        placeholder="Search by class name, subject, batch..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject-wise sections */}
              {loading ? (
                <div className="text-center py-5">Loading…</div>
              ) : Object.keys(subjectGroups).length === 0 ? (
                <div className="text-center py-5 text-muted">No recordings found.</div>
              ) : (
                <div className="mb-4">
                  {Object.entries(subjectGroups).map(([subjectKey, group]) => {
                    const isOpen = !!openSubjectGroups[subjectKey];
                    const count = group.items.length;

                    return (
                      <div key={subjectKey} className="mb-3">
                        <div
                          className="subject-header"
                          style={styles.headerToggle}
                          onClick={() =>
                            setOpenSubjectGroups((prev) => ({
                              ...prev,
                              [subjectKey]: !prev[subjectKey],
                            }))
                          }
                        >
                          <span>
                            {group.title} {headerBadge(`${count} recording${count > 1 ? "s" : ""}`)}
                          </span>
                          {isOpen ? (
                            <FaChevronUp style={{ marginRight: 10 }} />
                          ) : (
                            <FaChevronDown style={{ marginRight: 10 }} />
                          )}
                        </div>

                        <Collapse in={isOpen}>
                          <div className="p-3">
                            <div className="row">
                              {group.items.map((cls) => {
                                const c = cls._course;
                                const subjectLine = c
                                  ? `${c.paperCode || ""} ${c.paperName || ""} ${
                                      c.semester ? `• Sem ${c.semester}` : ""
                                    } ${c.batchName ? `• ${c.batchName}` : ""}`
                                  : cls.className;

                                const playSrc = resolveUrl(cls._recording, API_BASE_URL);

                                return (
                                  <div
                                    key={cls.liveClassId}
                                    className="col-xl-4 col-lg-4 col-md-6 col-12 mb-3"
                                  >
                                    <div
                                      className="card recording-card shadow-sm d-flex flex-column"
                                      style={styles.card}
                                    >
                                      <div className="card-body d-flex flex-column p-3">
                                        <h5 className="text-dark fw-bold mb-2 d-flex align-items-center justify-content-between">
                                          <span>
                                            <i className="fa fa-video-camera mr-2 text-primary"></i>{" "}
                                            {cls.className}
                                          </span>
                                        </h5>

                                        <div className="meta mb-2">
                                          <i className="fa fa-book text-secondary me-1"></i>{" "}
                                          <strong>Subject:</strong> {subjectLine || "—"}
                                        </div>

                                        <div className="meta mb-1">
                                          <i className="fa fa-calendar-alt me-1 text-secondary"></i>{" "}
                                          <strong>Date:</strong> {formatDateISOToDisplay(cls.liveDate)}
                                        </div>

                                        <div className="meta mb-2">
                                          <i className="fa fa-clock me-1 text-secondary"></i>{" "}
                                          <strong>Time:</strong> {formatTime(cls.startTime)} to{" "}
                                          {formatTime(cls.endTime)}
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 pt-2 mt-auto">
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => openPlayer(playSrc, cls.className)}
                                            disabled={!playSrc}
                                          >
                                            <i className="fa fa-play me-1" /> Play
                                          </button>
                                          {/* Download intentionally removed as per your ask */}
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>

           
        </div>
      </div>

      {/* Player Modal */}
      <Modal show={showPlayer} onHide={closePlayer} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{activeTitle || "Recording"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeVideoSrc ? (
            <video
              key={activeVideoSrc}
              src={activeVideoSrc}
              controls
              style={{ width: "100%", borderRadius: 12 }}
            />
          ) : (
            <div className="text-muted">No source.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePlayer}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Recordedclasses;
