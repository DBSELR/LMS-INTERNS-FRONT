import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import ConfirmationPopup from "../components/ConfirmationPopup";
import { toast } from "react-toastify";
import Collapse from "react-bootstrap/Collapse";
import { ChevronDown, ChevronUp } from "lucide-react";
import API_BASE_URL from "../config";

function InstructorExamList() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  const [openBatch, setOpenBatch] = useState({});
  const [openSemester, setOpenSemester] = useState({});

  const navigate = useNavigate();

  const fetchExams = (uid) => {
    const token = localStorage.getItem("jwt");
    fetch( `${API_BASE_URL}/InstructorExam/MyExams/${uid}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setExams(data))
      .catch((err) => {
        console.error("❌ Failed to fetch exams", err);
        toast.error("Error fetching exams.");
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    const decoded = jwtDecode(token);
    const id = decoded["UserId"] || decoded.userId;
    setUserId(id);

    fetchExams(id);
    fetch( `${API_BASE_URL}/course/by-instructor/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => {
        console.error("❌ Failed to fetch courses", err);
        toast.error("Error fetching courses.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!examToDelete) return;
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/question/${examToDelete}`,
        { method: "DELETE",
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
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast.error("❌ An error occurred while deleting.");
    } finally {
      setShowConfirm(false);
      setExamToDelete(null);
    }
  };

  const groupExams = () => {
    const grouped = {};
    exams.forEach((exam) => {
      const course = courses.find(
        (c) => c.examinationID === exam.examinationID
      );
      const batch = course ? course.batchName : "Unknown Batch";
      const semester = course ? course.semester : "Unknown Semester";

      if (!grouped[batch]) grouped[batch] = {};
      if (!grouped[batch][semester])
        grouped[batch][semester] = { assignments: [], theory: [] };

      if (exam.examType === "MA" || exam.examType === "DA") {
        grouped[batch][semester].assignments.push({ exam, course });
      } else if (exam.examType === "MT" || exam.examType === "DT") {
        grouped[batch][semester].theory.push({ exam, course });
      }
    });
    return grouped;
  };

  const isPast = (examDate) => new Date(examDate) < new Date();

  const grouped = groupExams();

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Faculty" />

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
              {/* <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/instructor/exam-create")}
                >
                  <i className="fa fa-plus mr-1"></i> Create New Exam
                </button>
              </div> */}
            </div>

            {loading ? (
              <div className="text-center py-5 text-muted">
                Loading exams...
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No exams found.</h5>
                <p>Click "Create New Exam" to add your first exam.</p>
              </div>
            ) : (
              Object.entries(grouped).map(([batchName, semesters], bIdx) => {
                return (
                  <div key={batchName} className="mb-3">
                    <button
                      className="btn w-100 mb-2 d-flex justify-content-between align-items-center semester-toggle-btn"
                      onClick={() =>
                        setOpenBatch((prev) => ({
                          ...prev,
                          [bIdx]: !prev[bIdx],
                        }))
                      }
                    >
                      <span>Batch: {batchName}</span>
                      {openBatch[bIdx] ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    <Collapse in={!!openBatch[bIdx]}>
                      <div>
                        {Object.entries(semesters).map(
                          ([semesterName, types], sIdx) => {
                            const semesterKey = `${bIdx}-${sIdx}`;
                            return (
                              <div key={semesterName} className="ml-3 mb-2">
                                <button
                                  className="btn w-100 mb-2 d-flex justify-content-between align-items-center semester-toggle-btn"
                                  onClick={() =>
                                    setOpenSemester((prev) => ({
                                      ...prev,
                                      [semesterKey]: !prev[semesterKey],
                                    }))
                                  }
                                >
                                  <span>Semester: {semesterName}</span>
                                  {openSemester[semesterKey] ? (
                                    <ChevronUp />
                                  ) : (
                                    <ChevronDown />
                                  )}
                                </button>
                                <Collapse in={!!openSemester[semesterKey]}>
                                  <div className="ml-4">
                                    {["assignments", "theory"].map((type) => (
                                      <div key={type} className="mb-3">
                                        <h5 className="text-muted">
                                          {type === "assignments"
                                            ? "Assignments"
                                            : "Theory"}
                                        </h5>
                                        <div className="row">
                                          {types[type].map(
                                            ({ exam, course }) => (
                                              <div
                                                key={exam.examid}
                                                className="col-lg-4 col-md-6 mb-4"
                                              >
                                                <div className="card shadow-sm h-100">
                                                  <div className="card-body d-flex flex-column">
                                                    <h5 className="text-primary mb-2">
                                                      {exam.title}
                                                    </h5>
                                                    <p className="small mb-1">
                                                      <strong>Course:</strong>{" "}
                                                      {course
                                                        ? `${course.paperCode}-${course.paperName} (${course.semester}/${course.batchName})`
                                                        : "N/A"}
                                                    </p>
                                                    <p className="small mb-1">
                                                      <strong>
                                                        Exam Date & Time:
                                                      </strong>{" "}
                                                      {new Date(
                                                        exam.examDate
                                                      ).toLocaleString(
                                                        "en-GB",
                                                        {
                                                          day: "2-digit",
                                                          month: "long",
                                                          year: "numeric",
                                                        }
                                                      )}{" "}
                                                      -{" "}
                                                      {new Date(
                                                        exam.examDate
                                                      ).toLocaleTimeString(
                                                        "en-US",
                                                        {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                          hour12: true,
                                                        }
                                                      )}
                                                    </p>
                                                    <p className="small mb-1">
                                                      <strong>Duration:</strong>{" "}
                                                      {exam.durationMinutes} min
                                                    </p>
                                                    <p className="small mb-3">
                                                      <strong>
                                                        Exam Type:
                                                      </strong>{" "}
                                                      {exam.examType === "MA"
                                                        ? "MCQ Assignment"
                                                        : exam.examType === "MT"
                                                        ? "MCQ Theory"
                                                        : exam.examType === "DA"
                                                        ? "Descriptive Assignment"
                                                        : exam.examType === "DT"
                                                        ? "Descriptive Theory"
                                                        : exam.examType ||
                                                          "N/A"}
                                                    </p>

                                                    <div className="mt-auto d-flex flex-wrap gap-2">
                                                      {isPast(exam.examDate) ? (
                                                        <button
                                                          className="btn btn-sm btn-outline-success"
                                                          onClick={() =>
                                                            navigate(
                                                              `/instructor/grade-list`
                                                            )
                                                          }
                                                        >
                                                          Grade
                                                        </button>
                                                      ) : (
                                                        <>
                                                          <button
                                                            className="btn btn-sm btn-outline-info"
                                                            onClick={() =>
                                                              navigate(
                                                                `/instructor/exams/edit/${exam.examid}`,
                                                                {
                                                                  state: {
                                                                    exam,
                                                                  },
                                                                }
                                                              )
                                                            }
                                                          >
                                                            Edit
                                                          </button>
                                                          <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => {
                                                              setExamToDelete(
                                                                exam.examid
                                                              );
                                                              setShowConfirm(
                                                                true
                                                              );
                                                            }}
                                                          >
                                                            Delete
                                                          </button>
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </Collapse>
                              </div>
                            );
                          }
                        )}
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
      <ConfirmationPopup
        show={showConfirm}
        message="Are you sure you want to delete this exam?"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowConfirm(false);
          setExamToDelete(null);
        }}
        toastMessage="Exam deleted"
      />
    </div>
  );
}

export default InstructorExamList;
