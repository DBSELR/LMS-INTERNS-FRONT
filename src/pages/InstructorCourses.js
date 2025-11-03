import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { Collapse } from "react-bootstrap";
import { FaChevronDown, FaChevronUp, FaBookOpen } from "react-icons/fa";
import API_BASE_URL from "../config";

function InstructorCourses() {
  const [groupedCourses, setGroupedCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [openSemesters, setOpenSemesters] = useState({});
  const [allOpen, setAllOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const decoded = jwtDecode(token);
        console.log("📦 Decoded Token:", decoded);

        const role =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || decoded.role;
        setUserRole(role);
        const instructorId = decoded.UserId || decoded.userId;
        console.log("👨‍🏫 Instructor ID:", instructorId);
        console.log("🎓 Role:", role);

        const res = await fetch(
          `${API_BASE_URL}/course/by-instructor/${instructorId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
      },
    }
        );
        const data = await res.json();
        console.log("📚 Fetched courses:", data);

        const grouped = {};
        data.forEach((course) => {
          const key = `${course.batchName}-${course.board}-${course.class}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(course);
        });

        console.log("📘 Grouped courses:", grouped);
        setGroupedCourses(grouped);

        const initialOpen = {};
        Object.keys(grouped).forEach((key) => {
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
    console.log("🔄 Toggling semester:", key);
    setOpenSemesters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    console.log("📂 Toggle All Semesters");
    const newState = {};
    Object.keys(openSemesters).forEach((key) => {
      newState[key] = !allOpen;
    });
    setOpenSemesters(newState);
    setAllOpen(!allOpen);
  };

  const filterCourses = (courses) => {
    console.log("🔍 Search Term:", searchTerm);
    return courses.filter((c) =>
      `${c.paperCode} ${c.paperName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
        <div className="section-body mt-2 pt-0">
        <div className="container-fluid">
          <div className="card-body">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i className="fa-solid fa-book-open"></i> My Courseware
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">
                View and Manage your Subjects below
              </p>
            </div>

            {Object.keys(groupedCourses).length > 0 && (
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button
  className="btn btn-sm btn-outline-primary"
  onClick={toggleAll}
  title={allOpen ? "Collapse all" : "Expand all"}
  aria-label={allOpen ? "Collapse all" : "Expand all"}
>
  {allOpen ? (
    <i className="fa-solid fa-minimize" />
  ) : (
    <i className="fa-solid fa-maximize" />
  )}
</button>


                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: "250px" }}
                  placeholder="Search by Subject Name or Code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            {Object.entries(groupedCourses).map(([key, courses]) => {
              const filtered = filterCourses(courses);
              console.log("🎯 Filtered courses for key:", key, filtered);
              if (filtered.length === 0) return null;

              return (
                <div key={key} className="mb-4">
  <button
    className="semester-toggle-btn w-100 text-left d-flex justify-content-between align-items-center"
    onClick={() => toggleSemester(key)}
    aria-controls={`collapse-${key}`}
    aria-expanded={!!openSemesters[key]}
  >
    <span>
      <FaBookOpen className="me-2" /> {key} ({filtered.length} Subjects)
    </span>
    {openSemesters[key] ? <FaChevronUp /> : <FaChevronDown />}
  </button>

  <Collapse in={openSemesters[key]}>
    {/* 👇 give the opened panel its own scroll */}
    <div id={`collapse-${key}`} className="p-3 mt-2 semester-panel-body" tabIndex={-1}>
      {filtered.map((course) => (
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

              );
            })}
          </div>
        </div>
        </div>
         
      </div>

      </div>
    </div>
  );
}

function CourseCard({ course, navigate, role }) {
  const [details, setDetails] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(
          `${API_BASE_URL}/Content/stats/${course.examinationID}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
          console.log("📊 Course stats for", course.examinationID, ":", data);
        }
      } catch (err) {
        console.error("❌ Error loading course details:", err);
      }
    };
    load();
  }, [course.examinationID]);

  return (
    <div className="course-card welcome-card animate-welcome">
      <div className="course-header">
        <h1
          className="course-title"
          style={{ fontSize: "1.25rem", fontWeight: "600" }}
        >
          {course.paperCode} - {course.paperName}
        </h1>
        <div className="course-btn-group">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => {
              console.log("➡️ Navigating to view content for:", course);
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate(`/view-course-content/${course.examinationID}`, {
                state: {
                  examinationID: course.examinationID, // ✅ Add this line
                  paperCode: course.paperCode,
                  paperName: course.paperName,
                  batchName: course.batchName,
                  name: course.name,
                  semester: course.semester,
                  class: course.class,
                },
              });
            }}
          >
            <i className="fas fa-eye me-1"></i> View
          </button>

          {role === "Admin" && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                console.log("🆙 Navigating to upload content for:", course);
                navigate(
                  `/admin/upload-course-content/${course.examinationID}`,
                  {
                    state: {
                      paperCode: course.paperCode,
                      paperName: course.paperName,
                      batchName: course.batchName,
                      semester: course.semester,
                      name: course.name,
                    },
                  }
                );
              }}
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
           <div className="course-stats-container">
  {renderCourseStat("Video", details.videoCount)}
  {renderCourseStat("E-Book", details.ebookCount)}
  {renderCourseStat("Web Resource", details.webCount)}
  {renderCourseStat(
  "FAQ / Study Guide",
  `${details.faqCount} / ${details.sgCount}`
)}

  {renderCourseStat("Misconceptions", details.misconceptionsCount)}
  {renderCourseStat("Practice Test", details.paCount)}
  {/* {renderCourseStat("Study Guide", details.sgCount)} */}
  {renderCourseStat("Live Class", details.livecount)}
  {renderCourseStat("Assignments", details.assignmentCount)}
  {renderCourseStat("Exams", details.examCount)}
  {renderCourseStat("Discussions", details.discussionCount)}
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
                    {new Date(details.upLiveClass)
                      .toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(",", "")}
                  </p>
                )}
                {details.upAExam && (
                  <p className="text-muted mb-0">
                    <strong>Assignment:</strong>{" "}
                    {new Date(details.upAExam)
                      .toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(",", "")}
                  </p>
                )}
                {details.upTExam && (
                  <p className="text-muted mb-0">
                    <strong>Theory Exam:</strong>{" "}
                    {new Date(details.upTExam)
                      .toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(",", "")}
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
  );
}

function renderCourseStat(label, count) {
  return (
    <div className="course-stat-item">
      <div className="course-stat-count">
        {count || 0}
      </div>
      <div className="course-stat-label">
        {label}
      </div>
    </div>
  );
}

export default InstructorCourses;
