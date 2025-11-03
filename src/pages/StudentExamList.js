import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import ConfirmationPopup from "../components/ConfirmationPopup";
import { toast } from "react-toastify";
import { ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { FaClipboardList, FaCalendar } from "react-icons/fa";
import CalendarViewsStudentExams from "../components/events/CalendarViewsStudentExams";
import API_BASE_URL from "../config";

function StudentExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [openAssignment, setOpenAssignment] = useState(true);
  const [openTheory, setOpenTheory] = useState(true);
  const [allOpen, setAllOpen] = useState(true);

  // -- Add for Guidelines
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [guidelinesAgreed, setGuidelinesAgreed] = useState(false);
  const [pendingExamId, setPendingExamId] = useState(null);

  // -- Hide Confirm until guidelines are agreed
  const [showConfirm, setShowConfirm] = useState(false);
  const [examToStart, setExamToStart] = useState(null);

  const [activeTab, setActiveTab] = useState("exams");
  const navigate = useNavigate();

const fetchExams = (uid) => {
  console.log("📥 Fetching exams for user:", uid);
  fetch(`${API_BASE_URL}/InstructorExam/StudentExam/${uid}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("jwt")}`
    }
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("📚 Exams fetched:", data);
      setExams(data);
    })
    .catch((err) => {
      console.error("❌ Fetch error:", err);
      toast.error("Error fetching exams.");
    })
    .finally(() => setLoading(false));
};


useEffect(() => {
  const token = localStorage.getItem("jwt");
  console.log("📦 JWT Token from localStorage:", token);
  if (!token) return;
  try {
    const decoded = jwtDecode(token);
    const id = decoded["UserId"] || decoded.userId || decoded.nameid;
    console.log("✅ Decoded User ID:", id);
    setUserId(id);
    fetchExams(id);
  } catch (error) {
    console.error("❌ Token decode error:", error);
    toast.error("Invalid user token.");
    setLoading(false);
  }
}, []);

  const getExamStatus = (exam) => {
    const now = new Date();
    const createdAt = new Date(exam.createdAt);
    const examDate = new Date(exam.examDate);
    const endDate = new Date(exam.examDate);
    endDate.setMinutes(endDate.getMinutes() + exam.durationMinutes);

    let result;

    if (exam.examType === "MA" || exam.examType === "DA") {
      if (now < createdAt) {
        result = { status: "Upcoming", color: "warning", desc: "", startTime: createdAt };
      } else if (now > examDate) {
        result = { status: "Closed", color: "danger", desc: "Exam closed" };
      } else {
        result = {
          status: "Open",
          color: "success",
          desc: exam.examType === "MA" ? "You can attend" : "You can upload",
        };
      }
    } else if (exam.examType === "MT" || exam.examType === "DT") {
      if (now < examDate) {
        result = { status: "Upcoming", color: "warning", desc: "", startTime: examDate };
      } else if (now > endDate) {
        result = { status: "Closed", color: "danger", desc: "Exam closed" };
      } else {
        result = {
          status: "Open",
          color: "success",
          desc: exam.examType === "MT" ? "You can attend" : "You can upload",
        };
      }
    } else {
      result = { status: "Unknown", color: "secondary", desc: "Status unknown" };
    }
    return result;
  };

  const assignmentExams = exams.filter((e) => e.examType === "MA" || e.examType === "DA");
  const theoryExams = exams.filter((e) => e.examType === "MT" || e.examType === "DT");

  const toggleAll = () => {
    const newState = !allOpen;
    setOpenAssignment(newState);
    setOpenTheory(newState);
    setAllOpen(newState);
  };

const handleStartExam = () => {
  if (examToStart) {
    const examDetails = exams.find((e) => e.examid === examToStart);
    console.log("🚀 Starting exam:", examDetails);
    navigate(`/take-exam/${examToStart}`, { state: { exam: examDetails } });
    setShowConfirm(false);
  } else {
    console.warn("⚠️ Exam start triggered but no exam ID is selected.");
  }
};


  const handleFileUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("jwt");
    const decoded = jwtDecode(token);
    const studentId = decoded["UserId"] || decoded.userId || decoded.nameid;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${API_BASE_URL}/assignmentsubmission/submit?ExamId=${id}&studentId=${studentId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg);
      }
      alert("✅ Assignment submitted successfully");
    } catch (err) {
      alert(err.message || "Error submitting file.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calendarEvents = exams.map((exam) => {
    const status = getExamStatus(exam);
    const startDate = `${exam.examDate}`;
    const endDate = new Date(exam.examDate);
    endDate.setMinutes(endDate.getMinutes() + exam.durationMinutes);

    return {
      id: exam.examid,
      title: exam.title,
      start: startDate,
      end: endDate.toISOString(),
      extendedProps: {
        type: {
          MA: "MCQ Assignment",
          MT: "MCQ Theory",
          DA: "Descriptive Assignment",
          DT: "Descriptive Theory",
        }[exam.examType] || "N/A",
        status: status.status,
        duration: exam.durationMinutes,
      },
    };
  });

 // ---------- In-Page Guidelines block
const guidelinesBlock = showGuidelines && (
  <div
    className="card shadow border border-primary"
    style={{
      position: "fixed",
      top: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "50%",
      zIndex: 10000,
      padding: 0,
      background: "rgba(255,255,255,0.98)",
    }}
  >
    <div className="card-body pb-0">
      <h5 className="text-primary">General Guidelines for Assignments</h5>
      <ol style={{ marginLeft: "10px",fontSize:'12px' }}>
        <li>Every provisionally registered students have been provided the access to LMS for learning purpose only.</li>
        <li>The student need to ensure that their mandatory documents required as per eligibility norms for selected program has been submitted by student for admission process to the university.</li>
        <li>The students in provisional admission category; their assignment scores would not be considered for evaluation purpose.</li>
        <li>Student undertakes to abide the university guidelines for provisional admissions and understands that in case the student does not meet the eligibility norms, or non submission of mandatory documents the said provisional admission may get cancelled.</li>
        <li>Student undertakes to get minimum access of 512 kbps internet connectivity before submission of assignments through LMS.</li>
        <li>Student undertakes that he/she would not open any new window or navigate to other window or browse while submitting the assignment, as any query occurrence due to this would not be accepted by university and student would have to re-appear for said assignment. Note the assignment may be auto submitted if the student opens any other window or navigates to other windows.</li>
        <li>Students would not submit the assignment through Mobile phone or Tablet PC. The assignments has to be submitted through Desktop and Laptop only.</li>
        <li>Student undertakes to abide the solution provided by the university for any technical query related to said assignment if any, if such a technical query has not occurred due to university systems. The students may have to re-appear for said assignments.</li>
        <li>Before 5 minutes of completion of Assignments a pop up alert will appear as a reminder for student and student should ensure all questions are submitted and no request for pending submission would be accepted.</li>
        <li>Students to share the screen shot of error occurred with the support team for query resolution.</li>
        <li>Assignments would not be reset for improvisation of assignment scores.</li>
        <li>Students to refer the guidelines and passing criteria on university website.</li>
      </ol>
      <div className="mt-3 mb-2 d-flex align-items-center" style={{marginLeft:'50px'}}>
        <input
          type="checkbox"
          id="agree-guidelines"
          className="form-check-input"
          
          checked={guidelinesAgreed}
          onChange={(e) => setGuidelinesAgreed(e.target.checked)}
        />
        <label htmlFor="agree-guidelines" className="ms-2 form-check-label " >
          I agree
        </label>
      </div>
      <div className="mb-3 d-flex flex-row gap-2">
        <button
          disabled={!guidelinesAgreed}
          className="btn btn-primary"
          onClick={() => {
            setShowGuidelines(false);
            setShowConfirm(true);
            setExamToStart(pendingExamId);
            setGuidelinesAgreed(false);
            setPendingExamId(null);
          }}
        >
          Okay
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            setShowGuidelines(false);
            setGuidelinesAgreed(false);
            setPendingExamId(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);


  return (
    <div id="main_content" className="font-muli theme-blush">
      <style>
        {`
        .tab-buttons-container { display: flex; justify-content: center; gap: 10px; margin-top: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .tab-btn {
          background-color: #f1f1f1; color: #333; padding: 0.6rem 1.2rem;
          border: 1px solid #ddd; border-radius: 6px;
          font-weight: 500; display: flex;
          align-items: center; justify-content: center;
          gap: 6px; transition: all 0.3s;
        }
        .tab-btn:hover { background-color: #e2e6ea; color: #000; }
        .tab-btn.active { background-color: #5a67d8; color: #fff; border-color: #5a67d8;}
        @media (max-width: 768px) {
          .tab-btn { padding: 0.5rem 1rem; font-size: 14px;}
        }
        @media (max-width: 480px) {
          .tab-btn { padding: 0.4rem 0.8rem; font-size: 13px;}
        }
        `}
      </style>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      {guidelinesBlock}
      <div className="section-wrapper">
          <div className="page admin-dashboard" style={showGuidelines ? {overflow: "hidden", filter: "blur(1px)", pointerEvents: "none"} : {}}>
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i class="fa-solid fa fa-file-pen"></i> Exams
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">
                View and manage your Exams & Assignments
              </p>
            </div>


            <div className="tab-buttons-container">
              <button
                className={`unit-tab ${activeTab === "exams" ? "active" : ""}`}
                onClick={() => setActiveTab("exams")}
              >
                <FaClipboardList /> List View
              </button>
              <button
                className={`unit-tab ${activeTab === "calendar" ? "active" : ""}`}
                onClick={() => setActiveTab("calendar")}
              >
                <FaCalendar /> Calendar View
              </button>
            </div>

            {activeTab === "exams" && (
              <>
                <div className="container-fluid mb-3">
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={toggleAll}>
                      {allOpen ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5 text-muted">Loading exams...</div>
                ) : exams.length === 0 ? (
                  <div className="text-center py-5 text-muted"><h5>No exams found.</h5></div>
                ) : (
                  <>
                    <div className="mb-4">
                      <button
                        className="btn btn-outline-primary w-100 mb-2 d-flex justify-content-between align-items-center"
                        onClick={() => setOpenAssignment(!openAssignment)}
                      >
                        <span>Assignments (MCQ & Descriptive)</span>
                        {openAssignment ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      <Collapse in={openAssignment}>
                        <div>
                          <div className="row">
                            {assignmentExams.map((exam) => (
                              <ExamCard
                                key={exam.examid}
                                exam={exam}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                getExamStatus={getExamStatus}
                                // 👇👇 Guidelines trigger props
                                openGuidelines={() => {
                                  setPendingExamId(exam.examid);
                                  setShowGuidelines(true);
                                  setExamToStart(null);
                                  setShowConfirm(false);
                                }}
                                handleFileUpload={handleFileUpload}
                              />
                            ))}
                          </div>
                        </div>
                      </Collapse>
                    </div>
                    <div className="mb-4">
                      <button
                        className="btn btn-outline-success w-100 mb-2 d-flex justify-content-between align-items-center"
                        onClick={() => setOpenTheory(!openTheory)}
                      >
                        <span>Theory (MCQ & Descriptive)</span>
                        {openTheory ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      <Collapse in={openTheory}>
                        <div>
                          <div className="row">
                            {theoryExams.map((exam) => (
                              <ExamCard
                                key={exam.examid}
                                exam={exam}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                getExamStatus={getExamStatus}
                                // 👇👇 Guidelines trigger props
                                openGuidelines={() => {
                                  setPendingExamId(exam.examid);
                                  setShowGuidelines(true);
                                  setExamToStart(null);
                                  setShowConfirm(false);
                                }}
                                handleFileUpload={handleFileUpload}
                              />
                            ))}
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === "calendar" && (
              <CalendarViewsStudentExams events={calendarEvents} active={activeTab === "calendar"} />
            )}
          </div>
        </div>
         
      </div>
      </div>

      <ConfirmationPopup
        show={showConfirm}
        message="Are you sure you want to start this exam?"
        onConfirm={handleStartExam}
        onCancel={() => {
          setShowConfirm(false);
          setExamToStart(null);
        }}
        toastMessage="Confirmed"
      />
    </div>
  );
}

// ------------ UPDATE ExamCard below
function ExamCard({ exam, formatDate, formatTime, getExamStatus, openGuidelines, handleFileUpload }) {
  const isDescriptive = exam.examType === "DA" || exam.examType === "DT";
  const { status, color, desc, startTime } = getExamStatus(exam);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!startTime || status !== "Upcoming") return;
    const interval = setInterval(() => {
      const now = new Date();
      let diff = Math.max(0, Math.floor((startTime - now) / 1000));
      const days = Math.floor(diff / (3600 * 24));
      diff %= 3600 * 24;
      const hours = Math.floor(diff / 3600);
      diff %= 3600;
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setCountdown(`${days}d-${hours}h-${minutes}m-${seconds}s`);
      if (startTime - now <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, status]);

  const StatusIcon = status === "Open" ? CheckCircle : status === "Upcoming" ? Clock : XCircle;

  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <h5 className="text-primary mb-2">{exam.title}</h5>
          <p className="small mb-1"><strong>Exam Date & Time:</strong> {formatDate(exam.examDate)} - {formatTime(exam.examDate)}</p>
          <p className="small mb-1"><strong>Duration:</strong> {exam.durationMinutes} minutes</p>
          <p className="small mb-3"><strong>Type:</strong> {{
            MA: "MCQ Assignment", MT: "MCQ Theory", DA: "Descriptive Assignment", DT: "Descriptive Theory"
          }[exam.examType] || "N/A"}</p>

          <div className={`alert alert-${color} py-2 text-center fw-bold d-flex justify-content-center align-items-center gap-2`} style={{ borderRadius: "20px" }}>
            <StatusIcon size={18} />
            {status} — {desc}
            {status === "Upcoming" && countdown && (<span className="ms-2 small" style={{ color: '#000' }}>({countdown})</span>)}
          </div>

          {status === "Open" ? (
            <>
              {/* Only for MCQ (not descriptive) show Attend Exam; now triggers guidelines */}
              {!isDescriptive && (
                <button
                  className="btn btn-sm btn-outline-info mb-2"
                  onClick={openGuidelines}
                >
                  Attend Exam
                </button>
              )}

              {isDescriptive && (
                <div className="d-flex gap-2 flex-wrap justify-content-center" style={{ gap: '20px' }}>
                  {exam.fileurl && (
                    <a
                      href={`http://localhost:5129${exam.fileurl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      View File
                    </a>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    id={`upload-${exam.examid}`}
                    onChange={(e) => handleFileUpload(e, exam.examid)}
                  />
                  <label htmlFor={`upload-${exam.examid}`} className="btn btn-sm btn-outline-warning" style={{ cursor: "pointer" }}>
                    Upload File
                  </label>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted text-center">No actions available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentExamList;
