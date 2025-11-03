import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import { Collapse } from "react-bootstrap";
import API_BASE_URL from "../config";

function Courses() {
  const [studentCourses, setStudentCourses] = useState([]);
  const [groupedCourses, setGroupedCourses] = useState({});
  const [openSemesters, setOpenSemesters] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("jwt");
  let role = null;
  let username = "User";
  let userId = null;
  let programme = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("🧾 Decoded JWT:", decoded);
      role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || decoded.role;
      username = decoded["Username"] || decoded.name || "User";
      userId = decoded["UserId"] || decoded.userId;
      programme = decoded["Programme"];
      console.log(
        "👤 Role:",
        role,
        "| UserId:",
        userId,
        "| Username:",
        username
      );
    } catch (err) {
      console.error("❌ JWT decode error", err);
    }
  }

  useEffect(() => {
    const fetchStudentCourses = async () => {
      console.log("📡 Fetching student courses...");
      try {
        const token = localStorage.getItem("jwt");
        if (role === "Student" && userId) {
          const res = await fetch(
            `${API_BASE_URL}/course/CoursesForStudent/${userId}`, {
              method: "GET",
              headers: {
                
                "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
              },
            }
          );
          const data = await res.json();
          console.log("📚 Courses fetched:", data);
          setStudentCourses(data);

          const grouped = {};
          data.forEach((course) => {
            const key = `${course.programme}-${course.semester}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(course);
          });

          console.log("📦 Grouped Courses:", grouped);
          setGroupedCourses(grouped);
        } else {
          console.warn("⚠️ User is not a student or userId is missing.");
        }
      } catch (err) {
        console.error("❌ Failed to fetch student courses", err);
      } finally {
        setLoading(false);
        console.log("✅ Course fetch complete");
      }
    };

    fetchStudentCourses();
  }, [role, userId]);

  const toggleSemester = (key) => {
    console.log("🔁 Toggling semester view for:", key);
    setOpenSemesters((prev) => ({ ...prev, [key]: !prev[key] }));
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
      <LeftSidebar role={role} />
      
      <div className="section-wrapper">
      <div className="page admin-dashboard">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
          <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
            <h2 className="page-title text-primary pt-0 dashboard-hero-title">Hello {username}!</h2>
            <p className="text-muted mb-0 dashboard-hero-sub">
              Explore your enrolled courses and view content.
            </p>
          </div>
          </div>

          <div className="">
            <div className="welcome-card animate-welcome">
              {Object.entries(groupedCourses).length === 0 ? (
                <div className="text-center py-5">
                  <h5>No courses found.</h5>
                </div>
              ) : (
                Object.entries(groupedCourses).map(([key, list]) => (
                  <div key={key} className="mb-4">
                    <button
                      className="semester-toggle-btn w-100 text-white text-left px-3 py-2 d-flex justify-content-between align-items-center"
                      style={{
                        backgroundColor: "#1c1c1c",
                        border: "none",
                        borderRadius: "25px",
                        fontWeight: "bold",
                      }}
                      onClick={() => toggleSemester(key)}
                      aria-controls={`collapse-${key}`}
                      aria-expanded={!!openSemesters[key]}
                    >
                      <span>
                        <FaBookOpen className="me-2" /> {key} ({list.length}{" "}
                        Subjects)
                      </span>
                      <span>{openSemesters[key] ? "▲" : "▼"}</span>
                    </button>
                    <Collapse in={openSemesters[key]}>
                      <div
                        id={`collapse-${key}`}
                        className=" p-3 mt-2"
                      >
                        <div className="row">
                          {list.map((course) => (
                            <div
                              className="col-md-6 col-lg-4 mb-4"
                              key={course.courseId}
                            >
                              <div className="p-4 h-100 d-flex flex-column welcome-card animate-welcome">
                                <h5 className="text-primary font-weight-bold mb-3 border-bottom pb-2">
                                  {course.name}
                                </h5>
                                {/* <div className="mb-2">
                                  <strong>Code:</strong>{" "}
                                  <span className="text-muted">
                                    {course.courseCode}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <strong>Credits:</strong>{" "}
                                  <span className="text-muted">
                                    {course.credits}
                                  </span>
                                </div>
                                <div className="mb-3">
                                  <strong>Description:</strong>
                                  <p className="text-muted mb-0">
                                    {course.courseDescription}
                                  </p>
                                </div> */}
                                {/* <div className="mt-auto pt-3 border-top d-flex justify-content-end"> */}
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => {
                                      console.log(
                                        "👁️ View Content clicked:",
                                        course.courseId
                                      );
                                      navigate(
                                        `/view-course-content/${course.courseId}`,
                                        {
                                          state: { courseName: course.name },
                                        }
                                      );
                                    }}
                                  >
                                    <i className="fa fa-eye me-1"></i> View
                                    Content
                                  </button>
                                {/* </div> */}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Collapse>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
         
      </div>
      </div>
    </div>
  );
}

export default Courses;
