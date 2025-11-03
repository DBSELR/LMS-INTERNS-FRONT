import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../../config";

import { Collapse, Modal } from "react-bootstrap";
import { FaChevronDown, FaChevronUp, FaBookOpen } from "react-icons/fa";
import HeaderTop from "../HeaderTop";
import RightSidebar from "../RightSidebar";
import LeftSidebar from "../LeftSidebar";
import Footer from "../Footer";

function InstructorCourses() {
  const [groupedCourses, setGroupedCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [openSemesters, setOpenSemesters] = useState({});
  const [allOpen, setAllOpen] = useState(true);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const decoded = jwtDecode(token);

        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
        setUserRole(role);

        const instructorId = decoded.UserId || decoded.userId;

        const res = await fetch(`${API_BASE_URL}/course/by-instructor/${instructorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        const grouped = {};
        data.forEach(course => {
          const key = `${course.batchName}-${course.semester}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(course);
        });

        setGroupedCourses(grouped);

        const initialOpen = {};
        Object.keys(grouped).forEach(key => {
          initialOpen[key] = true;
        });
        setOpenSemesters(initialOpen);
      } catch (err) {
        console.error("❌ Failed to fetch instructor courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const toggleSemester = (key) => {
    setOpenSemesters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const newState = {};
    Object.keys(openSemesters).forEach(key => {
      newState[key] = !allOpen;
    });
    setOpenSemesters(newState);
    setAllOpen(!allOpen);
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && <div className="page-loader-wrapper"><div className="loader"></div></div>}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="page section-body mt-3">
        <div className="container-fluid">
          <div className="card-body">
            <div className="p-4 rounded mb-4 welcome-card animate-welcome">
              <h2 className="text-primary mb-2">My Subjects</h2>
              <p className="text-muted mb-0">Courses assigned to you.</p>
            </div>

            {Object.keys(groupedCourses).length > 0 && (
              <div className="text-right mb-3">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={toggleAll}
                >
                  {allOpen ? "Close All" : "Open All"}
                </button>
              </div>
            )}

            {Object.entries(groupedCourses).map(([key, courses]) => (
              <div key={key} className="mb-4">
                <button
                  className="semester-toggle-btn w-100 text-left d-flex justify-content-between align-items-center"
                  onClick={() => toggleSemester(key)}
                  aria-controls={`collapse-${key}`}
                  aria-expanded={!!openSemesters[key]}
                >
                  <span><FaBookOpen className="me-2" /> {key} ({courses.length} Subjects)</span>
                  {openSemesters[key] ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                <Collapse in={openSemesters[key]}>
                  <div id={`collapse-${key}`} className="p-3 mt-2">
                    {courses.map(course => (
                      <CourseCard
                        key={course.courseId}
                        course={course}
                        navigate={navigate}
                        role={userRole}
                      />
                    ))}
                  </div>
                </Collapse>
              </div>
            ))}
          </div>
        </div>
         
      </div>
    </div>
  );
}

function CourseCard({ course, navigate, role }) {
  const [details, setDetails] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", contentType: "EBOOK" });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(`${API_BASE_URL}/Content/stats/${course.examinationID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
        } else {
          console.error("❌ Failed to fetch course content stats");
        }
      } catch (err) {
        console.error("❌ Error loading course details:", err);
      }
    };

    load();
  }, [course.examinationID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", course.examinationID);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("contentType", form.contentType);

    console.log("🧪 Final FormData payload:::::", {
      title: form.title,
      description: form.description,
      contentType: form.contentType,
      courseId: course.examinationID,
      file: file?.name
    });

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Content/UploadFile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      alert("✅ Content uploaded successfully");
      setForm({ title: "", description: "", contentType: "EBOOK" });
      setFile(null);
      setShowUploadModal(false);
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    }
  };

  return (
    <>
      <div className="course-card welcome-card animate-welcome">
        <div className="course-header">
          <h5 className="course-title">
            {course.paperCode}-{course.paperName}
          </h5>
          <div className="course-btn-group">
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => {
                navigate(`/view-course-content/${course.examinationID}`, {
                  state: {
                    paperCode: course.paperCode,
                    paperName: course.paperName,
                    batchName: course.batchName,
                    name: course.name,
                    semester: course.semester,
                  },
                });
              }}
            >
              <i className="fas fa-eye me-1"></i> View
            </button>

            {role === "Instructor" && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <i className="fas fa-upload me-1"></i> Upload
              </button>
            )}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-7">
            <div className="course-info-box welcome-card animate-welcome">
              <h6 className="course-info-title mb-3">
                <i className="fas fa-book-open me-2"></i>Courseware
              </h6>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: "5px"
              }}>
                {renderCourseStat("Video", details.videoCount)}
                {renderCourseStat("E-Book", details.ebookCount)}
                {renderCourseStat("Web Resource", details.webCount)}
                {renderCourseStat("FAQ", details.faqCount)}
                {renderCourseStat("Misconceptions", details.misconceptionsCount)}
                {renderCourseStat("Practice", details.paCount)}
                {renderCourseStat("Guide", details.sgCount)}
                {renderCourseStat("Live Class", details.livecount)}
                {renderCourseStat("Assignments", details.assignmentCount)}
                {renderCourseStat("Exams", details.examCount)}
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="course-info-box welcome-card animate-welcome">
              <h6 className="course-info-title">
                <i className="fas fa-chalkboard-teacher me-2"></i>Schedules
              </h6>
              {details.upLiveClass || details.upAExam || details.upTExam ? (
                <>
                  {details.upLiveClass && (
                    <p className="text-muted mb-0">
                      <strong>Live Class:</strong>{" "}
                      {new Date(details.upLiveClass).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }).replace(",", "")}
                    </p>
                  )}

                  {details.upAExam && (
                    <p className="text-muted mb-0">
                      <strong>Assignment:</strong>{" "}
                      {new Date(details.upAExam).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }).replace(",", "")}
                    </p>
                  )}

                  {details.upTExam && (
                    <p className="text-muted mb-0">
                      <strong>Theory Exam:</strong>{" "}
                      {new Date(details.upTExam).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }).replace(",", "")}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted mb-0">Nothing scheduled</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>⬆ Upload Course Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                className="form-control"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Content Type</label>
              <select
                className="form-control"
                value={form.contentType}
                onChange={e => setForm({ ...form, contentType: e.target.value })}
              >
                <option value="EBOOK">EBOOK</option>
                <option value="WebResources">Web Resources</option>
                <option value="FAQ">Pre-Learning : FAQ</option>
                <option value="Misconceptions">Pre-Learning : Misconceptions</option>
                <option value="PracticeAssignment">Practice Assignment</option>
                <option value="StudyGuide">Study Guide</option>
                <option value="Video">Video</option>
              </select>
            </div>
            <div className="form-group">
              <label>Select File</label>
              <input
                type="file"
                className="form-control"
                onChange={e => setFile(e.target.files[0])}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary mt-3">Upload</button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

function renderCourseStat(label, count) {
  return (
    <div
      style={{
        flex: "0 0 19%",
        maxWidth: "19%",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        padding: "2px",
        margin: "4px 0",
        textAlign: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
        height: "50px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 3px 6px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.06)";
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: "700", color: "#374151", lineHeight: "1", marginBottom: "2px" }}>
        {count || 0}
      </div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: "650",
          color: "#5c5c5e",
          lineHeight: "1.2",
          whiteSpace: "normal",
          overflow: "hidden",
          textAlign: "center",
          wordBreak: "break-word",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 2px"
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default InstructorCourses;



// dummy page for now no need 