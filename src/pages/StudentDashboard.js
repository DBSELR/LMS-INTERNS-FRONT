// File: src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function StudentDashboard() {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState(null);
  const [summary, setSummary] = useState({
    subjects: 0,
    assignments: 0,
    attendance: 0,
    fees: 0,
    exams: 0,
    books: 0,
    tests: 0,
    liveClasses: 0,
    supportTickets: 0,
    studentName: "",
  });
  const [loading, setLoading] = useState(true);
  const [liveClassNotifications, setLiveClassNotifications] = useState([]);
  const [examNotifications, setExamNotifications] = useState([]);
  const [showFeeReminder, setShowFeeReminder] = useState(false);
  const [feeDueDate, setFeeDueDate] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/StudentSummary/dashboard/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSummary({
        subjects: data.subjects || 0,
        assignments: data.assignments || 0,
        attendance: data.attendance || 0,
        fees: data.fees || 0,
        exams: data.exams || 0,
        books: data.books || 0,
        tests: data.tests || 0,
        liveClasses: data.liveClasses || 0,
        supportTickets: data.supportTickets || 0,
        studentName: data.studentName || "Student",
      });
    } catch (err) {
      console.error("Summary fetch failed", err);
    }
  };

  const fetchLiveClasses = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/LiveClass/Student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const now = new Date();
        const liveNotifs = data
          .filter((cls) => {
            if (!cls || !cls.liveDate) return false;
            const [year, month, day] = cls.liveDate.split("T")[0].split("-");
            const [startHour, startMinute] = cls.startTime.split(":").map(Number);
            const [endHour, endMinute] = cls.endTime.split(":").map(Number);
            const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
            const endDateTime = new Date(year, month - 1, day, endHour, endMinute);
            const joinStartTime = new Date(startDateTime.getTime() - 10 * 60 * 1000);
            return now < joinStartTime || (now >= joinStartTime && now <= endDateTime);
          })
          .map((cls) => {
            const [year, month, day] = cls.liveDate.split("T")[0].split("-");
            const [startHour, startMinute] = cls.startTime.split(":").map(Number);
            const startDateTime = new Date(year, month - 1, day, startHour, startMinute);

            let status;
            if (now < new Date(startDateTime.getTime() - 10 * 60 * 1000)) {
              status = "Schedule";
            } else if (
              now >= new Date(startDateTime.getTime() - 10 * 60 * 1000) &&
              now <= new Date(cls.liveDate.split("T")[0] + "T" + cls.endTime)
            ) {
              status = "Live Now";
            } else {
              status = "Completed";
            }

            return {
              category: "Live Class",
              message: `${cls.className} with ${cls.instructorName || "-"}`,
              status: status,
              dateSent: startDateTime,
            };
          });

        setLiveClassNotifications(liveNotifs);
      }
    } catch (err) {
      console.error("Live classes fetch failed", err);
    }
  };

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/InstructorExam/StudentExam/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const now = new Date();
        const examNotifs = data
          .map((exam) => {
            const createdAt = new Date(exam.createdAt);
            const examDate = new Date(exam.examDate);
            const endDate = new Date(exam.examDate);
            endDate.setMinutes(endDate.getMinutes() + exam.durationMinutes);

            let status;
            if (exam.examType === "MA" || exam.examType === "DA") {
              status = now < createdAt ? "Upcoming" : now > examDate ? "Closed" : "Open";
            } else if (exam.examType === "MT" || exam.examType === "DT") {
              status = now < examDate ? "Upcoming" : now > endDate ? "Closed" : "Open";
            } else {
              status = "Unknown";
            }

            return {
              category: "Exam",
              message: `${exam.title}`,
              status,
              dateSent: examDate,
            };
          })
          .filter((exam) => exam.status !== "Closed");

        setExamNotifications(examNotifs);
      }
    } catch (err) {
      console.error("Exams fetch failed", err);
    }
  };

  // Determine if student has any dues; also compute nearest unpaid installment due date
  const fetchFeeStatus = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token || !studentId) return;

      // 1) Check dues summary
      const duesRes = await fetch(`${API_BASE_URL}/Fee/StudentDues/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const duesData = await duesRes.json();
      const dueAmount = Array.isArray(duesData) && duesData[0] ? Number(duesData[0].due || 0) : 0;
      const hasDue = dueAmount > 0;
      setShowFeeReminder(hasDue);

      if (!hasDue) {
        setFeeDueDate("");
        return;
      }

      // 2) Find nearest upcoming unpaid installment
      try {
        const instRes = await fetch(`${API_BASE_URL}/Fee/StudentFeeInstallments/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const instData = await instRes.json();
        if (Array.isArray(instData) && instData.length) {
          const unpaid = instData.filter((it) => String(it.remarks).toUpperCase() !== "PD");
          if (unpaid.length) {
            unpaid.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
            const first = unpaid.find((x) => x.dueDate) || unpaid[0];
            if (first && first.dueDate) {
              const d = new Date(first.dueDate);
              const formatted = d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
              setFeeDueDate(formatted);
            } else {
              setFeeDueDate("");
            }
          } else {
            setFeeDueDate("");
          }
        } else {
          setFeeDueDate("");
        }
      } catch {
        setFeeDueDate("");
      }
    } catch (err) {
      console.error("Fee status fetch failed", err);
      setShowFeeReminder(false);
      setFeeDueDate("");
    }
  };

  const formatDateCustom = (dateObj) =>
    dateObj
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      .replace(/ /g, " ") +
    " - " +
    dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setLoading(false);
      return;
    }
    const decoded = jwtDecode(token);
    const id = decoded["UserId"] || decoded.userId;
    setStudentId(id);
  }, []);

  useEffect(() => {
    if (studentId) {
      const fetchAll = async () => {
        setLoading(true);
        try {
          await Promise.all([fetchSummary(), fetchLiveClasses(), fetchExams(), fetchFeeStatus()]);
        } catch (err) {
          console.error("Dashboard data load error", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAll();
      const interval = setInterval(fetchAll, 30000);
      return () => clearInterval(interval);
    }
  }, [studentId]);

  const cards = [
    { label: "My Subjects", value: summary.subjects, icon: "fa-book", link: "/my-courseware" },
    { label: "Live Classes", value: summary.liveClasses, icon: "fa-video-camera", link: "/student/live-classes" },
    // { label: "Examinations", value: summary.exams, icon: "fa-file", link: "/student-examinations" },
    // { label: "Assignments", value: summary.assignments, icon: "fa-file-text", link: "/student-submissions" },
    { label: "Library Books", value: summary.books, icon: "fa-book", link: "/studentlibrary" },
    { label: "Fees", value: summary.fees, icon: "fa-credit-card", link: "/fees/student" },
    { label: "Support Tickets", value: summary.supportTickets, icon: "fa-headphones", link: "/student/support-tickets" },
  ];

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader" />
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      {/* Align structure/classes with AdminDashboard */}
      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              {/* Hero (same look as AdminDashboard) */}
              {/* <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  Welcome back, <strong>{summary.studentName || "Student"}</strong> 👋
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Here’s a quick snapshot of your LMS.
                </p>
              </div> */}

              {/* Notifications card (kept; visuals harmonized by existing theme) */}
              <div className="row mt-2">
                <div className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white d-flex align-items-center">
                      <i className="fa fa-bell mr-2" />
                      <h6 className="mb-0">Latest Notifications</h6>
                      <button
                        className="btn btn-sm btn-light ml-auto"
                        onClick={() => setShowModal(true)}
                      >
                        View All
                      </button>
                    </div>
                    <div
                      className="card-body p-2 position-relative"
                      style={{ height: "140px", overflow: "hidden", background: "#f9f9f9" }}
                    >
                      
                      {([...liveClassNotifications, ...examNotifications].sort(
                        (a, b) => new Date(b.dateSent) - new Date(a.dateSent)
                      ).length > 0) ? (
                        <div className="scrolling-container">
                          {[...liveClassNotifications, ...examNotifications]
                            .sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent))
                            .map((note, index) => {
                              const isLive = note.status === "Live Now" || note.status === "Open";
                              const isSchedule = note.status === "Schedule" || note.status === "Upcoming";
                              return (
                                <span key={index} className={`notif-item ${isLive ? "live-anim" : ""}`}>
                                  <i
                                    className={`fa ${
                                      note.category === "Exam" ? "fa-file" : "fa-video-camera"
                                    } text-primary mr-1`}
                                  />
                                  <strong>{note.category}</strong> — {note.message}{" "}
                                  {isLive && (
                                    <span className="badge badge-success ml-1 live-badge">
                                      {note.status}
                                    </span>
                                  )}
                                  {isSchedule && (
                                    <span className="badge badge-warning ml-1">
                                      {note.status}
                                    </span>
                                  )}
                                  <span className="small text-muted">
                                    {" "}
                                    ({formatDateCustom(new Date(note.dateSent))})
                                  </span>
                                </span>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-muted mb-0">No Notifications.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Reminder (compact banner) — visible only if dues exist */}
              {showFeeReminder && (
                <div className="fee-reminder-card" onClick={() => navigate("/fees/student")}>
                  <div className="fee-reminder-left">
                    <span className="fee-reminder-badge">Action Required</span>
                    <div className="fee-reminder-title">Internship Fee Payment</div>
                  </div>
                  <div className="fee-reminder-middle">
                    <span className="fee-reminder-label">Due Date</span>
                    <span className="fee-reminder-value">20-01-2026</span>
                  </div>
                  <div className="fee-reminder-right" onClick={(e) => e.stopPropagation()}>
                    <button className="fee-pay-btn" onClick={() => navigate("/fees/student")}>Pay Now</button>
                    <div className="fee-support">Need help? <span className="fee-support-highlight">+91 8297 222 302</span></div>
                  </div>
                </div>
              )}


              {/* Summary cards — same style/classes as AdminDashboard */}
              <div className="row mt-3">
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
                      <div className="dashboard-label text-dark fw-bold">{item.label}</div>
                      <div className="dashboard-count text-dark fw-bold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline styles kept from your original (ticker/animations) */}
              <style>{`
                .scrolling-container {
                  display: flex;
                  flex-direction: column;
                  animation: scrollUp 8s linear infinite;
                }
                /* Fee Reminder Banner */
                .fee-reminder-card {
                  display: flex;
                  align-items: center;
                  gap: 14px;
                  background: #ffffff;
                  border: 1px solid #ffe0b2;
                  border-left: 6px solid #f5170bff;
                  border-radius: 12px;
                  padding: 10px 12px;
                  margin-bottom: 8px;
                  box-shadow: 0 2px 8px rgba(245, 11, 11, 0.16);
                  cursor: pointer;
                }
                .fee-reminder-card:hover { box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25); }
                .fee-reminder-left { display: flex; flex-direction: column; min-width: 180px; }
                .fee-reminder-badge {
                  display: inline-block;
                  background: #fef3c7;
                  color: #f5170bff;
                  font-weight: 700;
                  font-size: 11px;
                  padding: 4px 8px;
                  border-radius: 999px;
                  border: 1px solid #fde68a;
                  width: fit-content;
                  letter-spacing: 0.3px;
                }
                .fee-reminder-title { font-weight: 700; color: #1f2937; margin-top: 4px; font-size: 14px; }
                .fee-reminder-middle { display: flex; flex-direction: column; gap: 2px; }
                .fee-reminder-label { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: .3px; }
                .fee-reminder-value { font-size: 13px; color: #dc2626; font-weight: 800; }
                .fee-reminder-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-left: auto; }
                .fee-pay-btn {
                  background: linear-gradient(135deg, #111827, #374151);
                  color: #fff; border: none; border-radius: 10px; padding: 8px 14px; font-weight: 700; font-size: 13px;
                  box-shadow: 0 2px 8px rgba(17,24,39,.25); cursor: pointer; transition: transform .15s ease, box-shadow .15s ease;
                }
                .fee-pay-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(17,24,39,.3); }
                .fee-support { font-size: 11px; color: #6b7280; }
                .fee-support-highlight { color: #4f46e5; font-weight: 700; }

                .notif-item {
                  display: block;
                  margin-bottom: 10px;
                  padding: 5px 10px;
                  background: #fff;
                  border: 1px solid #ddd;
                  border-radius: 20px;
                  box-shadow: 0 1px 3px rgba(15, 7, 239, 0.42);
                }
                @keyframes scrollUp {
                  0% { transform: translateY(30%); }
                  100% { transform: translateY(-100%); }
                }
                .card-body:hover .scrolling-container { animation-play-state: paused; }
                @keyframes zoomInOut {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.2); }
                }
                .live-anim .live-badge { animation: zoomInOut 1s infinite; }

                /* Responsive adjustments for fee reminder */
                @media (max-width: 768px) {
                  .fee-reminder-card { gap: 10px; padding: 10px; }
                  .fee-reminder-left { min-width: 140px; }
                  .fee-reminder-title { font-size: 13px; }
                  .fee-reminder-value { font-size: 12px; }
                  .fee-pay-btn { padding: 7px 12px; font-size: 12px; }
                }
                @media (max-width: 576px) {
                  .fee-reminder-card { flex-direction: column; align-items: stretch; }
                  .fee-reminder-right { align-items: stretch; }
                  .fee-pay-btn { width: 100%; text-align: center; }
                  .fee-support { text-align: center; }
                }
              `}</style>
            </div>
          </div>

           
        </div>
      </div>

      {/* Modal preserved */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>All Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {[...liveClassNotifications, ...examNotifications].sort(
            (a, b) => new Date(b.dateSent) - new Date(a.dateSent)
          ).length > 0 ? (
            <ul className="list-group">
              {[...liveClassNotifications, ...examNotifications]
                .sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent))
                .map((note, index) => (
                  <li key={index} className="list-group-item">
                    <i
                      className={`fa ${
                        note.category === "Exam" ? "fa-file" : "fa-video-camera"
                      } text-primary mr-1`}
                    />
                    <strong>{note.category}</strong> — {note.message}
                    <span
                      className={`badge ml-2 ${
                        note.status === "Live Now" || note.status === "Open"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {note.status}
                    </span>
                    <div className="small text-muted">
                      {formatDateCustom(new Date(note.dateSent))}
                    </div>

                    
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-muted">No Notifications.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StudentDashboard;
