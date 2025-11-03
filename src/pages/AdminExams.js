import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import ExamFormModal from "../components/exams/ExamFormModal";
import QuestionSelector from "../components/exams/QuestionSelector";
import Collapse from "react-bootstrap/Collapse";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationPopup from "../components/ConfirmationPopup";
import API_BASE_URL from "../config";

function AdminExams() {
  const [exams, setExams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [openSemester, setOpenSemester] = useState({});
  const [openPaper, setOpenPaper] = useState({});
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const navigate = useNavigate();


  
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const id = decoded["UserId"] || decoded.userId;
      setUserId(id);
    } catch (err) {
      console.error("JWT decode error", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (userId) {
      fetchExams(userId);
      fetch(`${API_BASE_URL}/course/by-instructor/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("📘 Courses fetched from backend:", data);
          setCourses(data);
        })
        .catch((err) => console.error("Failed to fetch courses", err))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  const fetchExams = (userId) => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/InstructorExam/MyExams/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("📥 Exams refreshed:", data);
        setExams(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch exams:", err);
        setExams([]);
      })
      .finally(() => setLoading(false));
  };

  const requestDelete = (id) => {
    setPendingDeleteId(id);
    setShowConfirmPopup(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Exam/${pendingDeleteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success("✅ Exam deleted successfully");
        fetchExams(userId);
      } else {
        toast.error("❌ Failed to delete exam");
      }
    } catch (err) {
      console.error("Error deleting exam", err);
      toast.error("❌ Error occurred while deleting");
    } finally {
      setShowConfirmPopup(false);
      setPendingDeleteId(null);
    }
  };

  const handleViewReport = (examId) => {
    window.open(`/exam-report/${examId}`, "_blank");
  };

  const filteredExams = exams.filter((exam) => {
    const text = search.toLowerCase();
    return (
      (exam.title && exam.title.toLowerCase().includes(text)) ||
      (exam.subject && exam.subject.toLowerCase().includes(text)) ||
      (exam.examType && exam.examType.toLowerCase().includes(text)) ||
      (exam.examDate && new Date(exam.examDate).toLocaleDateString("en-GB").includes(text)) ||
      (exam.durationMinutes && exam.durationMinutes.toString().includes(text))
    );
  });

  const getGroupedExams = (exams) => {
    const grouped = {};
    exams.forEach((exam) => {
      const course = courses.find((c) => c.examinationID === exam.examinationID);
      if (!course) return;

      const batch = course.batchName || "Unknown Batch";
      const semester = course.semester || "Unknown Semester";
      const paper = `${course.paperCode} - ${course.paperName}` || "Unknown Paper";

      const batchSemesterKey = `Batch: ${batch} - Semester: ${semester}`;

      if (!grouped[batchSemesterKey]) grouped[batchSemesterKey] = {};
      if (!grouped[batchSemesterKey][paper]) grouped[batchSemesterKey][paper] = [];
      grouped[batchSemesterKey][paper].push(exam);
    });
    return grouped;
  };

  const groupedExams = getGroupedExams(exams);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="section-wrapper">
           <div className="page admin-dashboard">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i className="fa-solid fa-file-pen"></i> Manage Exams
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">Manage exams efficiently</p>
            </div>

            <div className="container-fluid mb-3">
              <div className="row align-items-center">
                <div className="col-md-8 mb-2 mb-md-0">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Search exams by title, subject, type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-4 text-md-end">
                  <button
                    className="btn btn-primary w-100 w-md-auto"
                    onClick={() => navigate("/admin/exam-create")}
                  >
                    <i className="fa fa-plus mr-1"></i> Create New Exam
                  </button>
                </div>
              </div>
            </div>

            {search ? (
              <div className="row">
                {filteredExams.map((exam) => (
                  <div className="col-lg-4 col-md-6 mb-4" key={exam.id}>
                    <div className="card shadow-sm h-100">
                      <div className="card-body d-flex flex-column">
                        <h6 className="text-primary mb-2">{exam.title}</h6>
                        <p className="small mb-1"><strong>Subject:</strong> {exam.subject || "N/A"}</p>
                        <p className="small mb-1"><strong>Exam Type:</strong> {exam.examType || "N/A"}</p>
                        <p className="small mb-1">
                          <strong>Exam Date & Time:</strong>{" "}
                          {new Date(exam.examDate).toLocaleString("en-GB", {
                            day: "2-digit", month: "long", year: "numeric"
                          })} -{" "}
                          {new Date(exam.examDate).toLocaleTimeString("en-US", {
                            hour: "2-digit", minute: "2-digit", hour12: true
                          })}
                        </p>
                        <p className="small mb-1"><strong>Duration:</strong> {exam.durationMinutes} min</p>

                        <div className="mt-auto d-flex flex-wrap justify-content-between gap-1">
                          <button className="btn btn-sm btn-outline-danger" onClick={() => requestDelete(exam.id)}>
                            <i className="fa fa-trash"></i> Delete
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleViewReport(exam.id)}>
                            <i className="fa fa-bar-chart"></i> Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              Object.entries(groupedExams).map(([batchSemesterKey, papers], sIndex) => {
                const semesterKey = `semester-${sIndex}`;
                return (
                  <div key={batchSemesterKey} className="mb-2 p-2">
                    <div
                      className="p-2 d-flex justify-content-between align-items-center semester-toggle-btn"
                      onClick={() =>
                        setOpenSemester((prev) => ({
                          ...prev,
                          [semesterKey]: !prev[semesterKey],
                        }))
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div>{batchSemesterKey}</div>
                      <div className="badge badge-light text-dark px-2 py-1">
                        Total Papers: {Object.keys(papers).length}
                        <i className={`fa ml-2 ${openSemester[semesterKey] ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                      </div>
                    </div>

                    <Collapse in={!!openSemester[semesterKey]}>
                      <div className="mt-2">
                        {Object.entries(papers).map(([paperName, examList], pIndex) => {
                          const paperKey = `${sIndex}-${pIndex}`;
                          return (
                            <div key={paperName} className="mb-2 p-2">
                              <div
                                className="bg-info p-2 d-flex justify-content-between align-items-center semester-toggle-btn"
                                onClick={() =>
                                  setOpenPaper((prev) => ({
                                    ...prev,
                                    [paperKey]: !prev[paperKey],
                                  }))
                                }
                                style={{ cursor: "pointer", color: "#fff" }}
                              >
                                <div><strong>Paper:</strong> {paperName}</div>
                                <div className="badge badge-light text-dark px-2 py-1">
                                  Total Exams: {examList.length}
                                  <i className={`fa ml-2 ${openPaper[paperKey] ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                                </div>
                              </div>

                              <Collapse in={!!openPaper[paperKey]}>
                                <div className="mt-2 row">
                                  {examList.map((exam) => (
                                    <div className="col-lg-4 col-md-6 mb-3" key={exam.id}>
                                      <div className="card shadow-sm h-100">
                                        <div className="card-body d-flex flex-column">
                                          <h6 className="text-primary mb-2">{exam.title}</h6>
                                          <p className="small mb-1"><strong>Exam Type:</strong> {exam.examType || "N/A"}</p>
                                          <p className="small mb-1">
                                            <strong>Exam Date & Time:</strong>{" "}
                                            {new Date(exam.examDate).toLocaleString("en-GB", {
                                              day: "2-digit", month: "long", year: "numeric"
                                            })} -{" "}
                                            {new Date(exam.examDate).toLocaleTimeString("en-US", {
                                              hour: "2-digit", minute: "2-digit", hour12: true
                                            })}
                                          </p>
                                          <p className="small mb-1"><strong>Duration:</strong> {exam.durationMinutes} min</p>

                                          <div className="mt-auto d-flex flex-wrap justify-content-between gap-1">
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => requestDelete(exam.id)}>
                                              <i className="fa fa-trash"></i> Delete
                                            </button>
                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => handleViewReport(exam.id)}>
                                              <i className="fa fa-bar-chart"></i> Report
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </Collapse>
                            </div>
                          );
                        })}
                      </div>
                    </Collapse>
                  </div>
                );
              })
            )}
          </div>
        </div>

          
      </div>
      </div>

     

      {showModal && (
        <ExamFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchExams(userId);
          }}
          exam={selectedExam}
        />
      )}

      {showSelector && (
        <QuestionSelector
          examId={selectedExamId}
          onClose={() => setShowSelector(false)}
        />
      )}

      <ConfirmationPopup
        show={showConfirmPopup}
        title="Confirm Delete"
        message="Are you sure you want to delete this exam?"
        onCancel={() => setShowConfirmPopup(false)}
        onConfirm={handleDeleteConfirmed}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default AdminExams;
