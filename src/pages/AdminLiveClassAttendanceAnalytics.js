// File: src/pages/AdminLiveClassAttendanceAnalytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

// Chart.js
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

function AdminLiveClassAttendanceAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 🔹 Batch-wise stats (existing)
  const [stats, setStats] = useState([]); // raw data from API
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourseKey, setSelectedCourseKey] = useState("");
  const [lastSelectedCourse, setLastSelectedCourse] = useState(null);

  // 🔹 Student-wise stats (NEW)
  const [studentStats, setStudentStats] = useState([]);
  const [studentBatchFilter, setStudentBatchFilter] = useState("");
  const [studentCourseFilter, setStudentCourseFilter] = useState("");

  // 🔹 Tab state
  const [activeTab, setActiveTab] = useState("batch"); // 'batch' | 'student'

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          setLoading(false);
          navigate("/login");
          return;
        }

        const decoded = jwtDecode(token);
        const role =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || decoded.role;

        const instructorId =
          decoded.UserId ||
          decoded.userId ||
          decoded.userid ||
          decoded.Id ||
          decoded.id;

        if (!instructorId) {
          console.error("❌ No InstructorId/UserId found in token");
          setLoading(false);
          return;
        }

        if (role !== "Admin" && role !== "College") {
          setLoading(false);
          navigate("/unauthorized");
          return;
        }

        // ==========================
        // 1) Batch-wise API (existing)
        // ==========================
        const res = await fetch(
          `${API_BASE_URL}/LiveClass/GetLiveclassAttPercent?InstructorId=${instructorId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error(
            "Failed to fetch live class attendance percent",
            res.status
          );
        } else {
          const data = await res.json();
          console.log("📊 Live class attendance stats (batch-wise):", data);

          // normalize keys (PascalCase / camelCase)
          const normalized = data.map((row) => ({
            batchName: row.batchName ?? row.BatchName,
            examinationID: row.examinationID ?? row.ExaminationID,
            paperCode: row.paperCode ?? row.PaperCode,
            paperName: row.paperName ?? row.PaperName,

            totalStudents: row.totalStudents ?? row.TotalStudents,
            totalLiveClasses: row.totalLiveClasses ?? row.TotalLiveClasses,
            totalAttendances: row.totalAttendances ?? row.TotalAttendances,
            studentsWhoAttended:
              row.studentsWhoAttended ?? row.StudentsWhoAttended,
            totalPossibleAttendances:
              row.totalPossibleAttendances ?? row.TotalPossibleAttendances,

            courseAttendancePercent: Number(
              row.courseAttendancePercent ?? row.CourseAttendancePercent ?? 0
            ),
            studentReachPercent: Number(
              row.studentReachPercent ?? row.StudentReachPercent ?? 0
            ),
            overallAttendancePercentPerBatch: Number(
              row.overallAttendancePercentPerBatch ??
                row.OverallAttendancePercentPerBatch ??
                0
            ),
          }));

          setStats(normalized);

          if (normalized.length > 0) {
            const firstBatch = normalized[0].batchName;
            setSelectedBatch(firstBatch);

            const firstCourseKey = `${normalized[0].batchName}-${normalized[0].examinationID}`;
            setSelectedCourseKey(firstCourseKey);
          }
        }

        // ==========================
        // 2) Student-wise API (NEW)
        // ==========================
        const resStudents = await fetch(
          `${API_BASE_URL}/LiveClass/GetLiveclassAttPercentByStudents?InstructorId=${instructorId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resStudents.ok) {
          console.error(
            "Failed to fetch live class attendance percent by students",
            resStudents.status
          );
        } else {
          const dataStudents = await resStudents.json();
          console.log(
            "📊 Live class attendance stats (student-wise):",
            dataStudents
          );

          const normalizedStudents = dataStudents.map((row) => ({
            batchName: row.batchName ?? row.BatchName,
            registrationNo: row.registrationNo ?? row.RegistrationNo,
            studentName: row.studentName ?? row.StudentName,
            course: row.course ?? row.Course ?? row.courseName ?? row.CourseName,
            totalLiveClasses: row.totalLiveClasses ?? row.TotalLiveClasses,
            classesAttendedByStudent:
              row.classesAttendedByStudent ??
              row.ClassesAttendedByStudent ??
              0,
            totalAttendanceEvents:
              row.totalAttendanceEvents ?? row.TotalAttendanceEvents ?? 0,
            studentCourseAttendancePercent: Number(
              row.studentCourseAttendancePercent ??
                row.StudentCourseAttendancePercent ??
                0
            ),
          }));

          setStudentStats(normalizedStudents);

          if (normalizedStudents.length > 0) {
            setStudentBatchFilter(normalizedStudents[0].batchName);
            setStudentCourseFilter("");
          }
        }
      } catch (err) {
        console.error(
          "❌ Error loading admin live class attendance analytics:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  // ==========================
  // Batch-wise derived data
  // ==========================

  // Group by batch
  const batches = useMemo(() => {
    const map = {};
    stats.forEach((row) => {
      if (!map[row.batchName]) map[row.batchName] = [];
      map[row.batchName].push(row);
    });
    return map;
  }, [stats]);

  const batchNames = Object.keys(batches);

  // All courses for selected batch
  const coursesForBatch = useMemo(() => {
    if (!selectedBatch || !batches[selectedBatch]) return [];
    return batches[selectedBatch];
  }, [batches, selectedBatch]);

  // Selected course row
  const selectedCourse = useMemo(() => {
    if (!selectedCourseKey || coursesForBatch.length === 0) return null;
    const [batch, examIdStr] = selectedCourseKey.split("-");
    const examId = parseInt(examIdStr, 10);
    return coursesForBatch.find(
      (c) => c.batchName === batch && c.examinationID === examId
    );
  }, [selectedCourseKey, coursesForBatch]);

  // Keep last selected course so temporary clearing doesn't hide chart
  useEffect(() => {
    if (selectedCourse) setLastSelectedCourse(selectedCourse);
  }, [selectedCourse]);

  const displayedCourse = selectedCourse || lastSelectedCourse;

  // Pie chart data: attended vs not attended
  const pieData = useMemo(() => {
    const attPercent = displayedCourse?.courseAttendancePercent ?? 0;
    const clampedAtt = Math.max(0, Math.min(100, attPercent));
    const notAtt = 100 - clampedAtt;

    return {
      labels: ["Attended", "Not Attended"],
      datasets: [
        {
          data: [clampedAtt, notAtt],
          backgroundColor: ["#2196f3", "#ececec"],
          borderWidth: 1,
          hoverOffset: 0,
        },
      ],
    };
  }, [displayedCourse]);

  const pieOptions = {
    responsive: true,
    animation: { duration: 0 },
    hover: { mode: null },
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw ?? 0;
            return `${label}: ${value.toFixed(2)}%`;
          },
        },
      },
    },
  };

  // ==========================
  // Student-wise derived data
  // ==========================

  const studentBatchNames = useMemo(() => {
    const set = new Set();
    studentStats.forEach((row) => {
      if (row.batchName) set.add(row.batchName);
    });
    return Array.from(set);
  }, [studentStats]);

  const studentCourseNames = useMemo(() => {
    const set = new Set();
    studentStats.forEach((row) => {
      if (!studentBatchFilter || row.batchName === studentBatchFilter) {
        if (row.course) set.add(row.course);
      }
    });
    return Array.from(set);
  }, [studentStats, studentBatchFilter]);

  const filteredStudentStats = useMemo(() => {
    return studentStats.filter((row) => {
      if (studentBatchFilter && row.batchName !== studentBatchFilter)
        return false;
      if (studentCourseFilter && row.course !== studentCourseFilter)
        return false;
      return true;
    });
  }, [studentStats, studentBatchFilter, studentCourseFilter]);

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              {/* Header */}
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <i className="fa fa-bar-chart me-2" /> Live Class Attendance
                  Analytics
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Batch-wise and student-wise live class attendance analytics.
                </p>
              </div>

              {/* 🔹 Tabs: Batch-wise / Student-wise */}
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <button
                    type="button"
                    className={
                      "nav-link " + (activeTab === "batch" ? "active" : "")
                    }
                    onClick={() => setActiveTab("batch")}
                  >
                    Batch-wise
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={
                      "nav-link " + (activeTab === "student" ? "active" : "")
                    }
                    onClick={() => setActiveTab("student")}
                  >
                    Student-wise
                  </button>
                </li>
              </ul>

              {/* ==========================
                  TAB 1: BATCH-WISE (existing UI)
                 ========================== */}
              {activeTab === "batch" && (
                <>
                  {/* Filters */}
                  {batchNames.length > 0 && (
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                      <div>
                        <label className="form-label mb-1">
                          Select Batch <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: "220px" }}
                          value={selectedBatch}
                          onChange={(e) => {
                            const newBatch = e.target.value;
                            setSelectedBatch(newBatch);
                            const list = batches[newBatch] || [];
                            if (list.length > 0) {
                              setSelectedCourseKey(
                                `${list[0].batchName}-${list[0].examinationID}`
                              );
                            } else {
                              setSelectedCourseKey("");
                            }
                          }}
                        >
                          {batchNames.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => navigate(-1)}
                        >
                          <i className="fa fa-arrow-left me-1" />
                          Back to Dashboard
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Main content row: Pie + details */}
                  <div className="row">
                    {/* Left: Pie chart */}
                    <div className="col-12 col-lg-5 mb-3">
                      <div className="welcome-card dashboard-card animate-welcome h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5 className="mb-0">
                            <i className="fa fa-pie-chart me-2" />
                            Course Attendance %
                          </h5>
                          {/* Course selector beside title */}
                          <div style={{ minWidth: 260 }}>
                            <select
                              className="form-select form-select-sm"
                              value={selectedCourseKey}
                              onChange={(e) =>
                                setSelectedCourseKey(e.target.value)
                              }
                            >
                              {coursesForBatch.map((c) => {
                                const key = `${c.batchName}-${c.examinationID}`;
                                return (
                                  <option key={key} value={key}>
                                    {c.paperCode} - {c.paperName}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                        {selectedCourse ? (
                          <>
                            <div
                              style={{ maxWidth: "360px", margin: "0 auto" }}
                            >
                              <Pie data={pieData} options={pieOptions} />
                            </div>
                            <div className="text-center mt-3">
                              <div className="fw-bold">
                                {selectedCourse.paperCode} -{" "}
                                {selectedCourse.paperName}
                              </div>
                              <div className="text-muted small">
                                Batch:{" "}
                                <strong>{selectedCourse.batchName}</strong>
                              </div>
                              <div className="mt-2">
                                <span className="badge bg-primary me-2">
                                  Attendance:{" "}
                                  {selectedCourse.courseAttendancePercent.toFixed(
                                    2
                                  )}
                                  %
                                </span>
                                <span className="badge bg-secondary">
                                  Reach:{" "}
                                  {selectedCourse.studentReachPercent.toFixed(
                                    2
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted mb-0">
                            No data available for the selected batch.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Description & table */}
                    <div className="col-12 col-lg-7 mb-3">
                      <div className="welcome-card dashboard-card animate-welcome h-100">
                        <h5 className="mb-3">
                          <i className="fa fa-list-alt me-2" />
                          Batch-wise Live Class Stats
                        </h5>

                        {displayedCourse && (
                          <div className="mb-3">
                            <div className="row g-2">
                              <div className="col-6 col-md-4">
                                <StatBadge
                                  label="Total Live Classes"
                                  value={displayedCourse.totalLiveClasses}
                                />
                              </div>
                              <div className="col-6 col-md-4">
                                <StatBadge
                                  label="Total Students"
                                  value={displayedCourse.totalStudents}
                                />
                              </div>
                              <div className="col-6 col-md-4">
                                <StatBadge
                                  label="Total Attendances"
                                  value={displayedCourse.totalAttendances}
                                />
                              </div>
                              <div className="col-6 col-md-4">
                                <StatBadge
                                  label="Students Attended"
                                  value={displayedCourse.studentsWhoAttended}
                                />
                              </div>
                              <div className="col-6 col-md-4">
                                <StatBadge
                                  label="Course Attendance %"
                                  value={`${displayedCourse.courseAttendancePercent.toFixed(
                                    2
                                  )}%`}
                                />
                              </div>
                              <div className="col-6 col-md-4">
                                <StatBadge
                                  label="Overall Batch %"
                                  value={`${displayedCourse.overallAttendancePercentPerBatch.toFixed(
                                    2
                                  )}%`}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="table-responsive mt-2">
                          <table className="table table-sm table-hover align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>Course</th>
                                <th className="text-end">Live Classes</th>
                                <th className="text-end">Students</th>
                                <th className="text-end">Attendances</th>
                                <th className="text-end">Attendance %</th>
                                <th className="text-end">Reach %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {coursesForBatch.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="text-muted text-center"
                                  >
                                    No data for this batch.
                                  </td>
                                </tr>
                              )}

                              {coursesForBatch.map((c) => {
                                const key = `${c.batchName}-${c.examinationID}`;
                                const isActive = key === selectedCourseKey;
                                return (
                                  <tr
                                    key={key}
                                    className={isActive ? "table-primary" : ""}
                                    role="button"
                                    onClick={() => setSelectedCourseKey(key)}
                                  >
                                    <td>
                                      <div className="fw-semibold">
                                        {c.paperCode}
                                      </div>
                                      <div className="text-muted small">
                                        {c.paperName}
                                      </div>
                                    </td>
                                    <td className="text-end">
                                      {c.totalLiveClasses}
                                    </td>
                                    <td className="text-end">
                                      {c.totalStudents}
                                    </td>
                                    <td className="text-end">
                                      {c.totalAttendances}
                                    </td>
                                    <td className="text-end">
                                      {c.courseAttendancePercent.toFixed(2)}%
                                    </td>
                                    <td className="text-end">
                                      {c.studentReachPercent.toFixed(2)}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ==========================
                  TAB 2: STUDENT-WISE (NEW)
                 ========================== */}
              {activeTab === "student" && (
                <div className="welcome-card dashboard-card animate-welcome">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                    <div className="d-flex flex-wrap gap-3">
                      {/* Batch filter */}
                      <div>
                        <label className="form-label mb-1">
                          Batch <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: "200px" }}
                          value={studentBatchFilter}
                          onChange={(e) => {
                            const newBatch = e.target.value;
                            setStudentBatchFilter(newBatch);
                            setStudentCourseFilter("");
                          }}
                        >
                          <option value="">All Batches</option>
                          {studentBatchNames.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Course filter */}
                      <div>
                        <label className="form-label mb-1">Course</label>
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: "220px" }}
                          value={studentCourseFilter}
                          onChange={(e) =>
                            setStudentCourseFilter(e.target.value)
                          }
                        >
                          <option value="">All Courses</option>
                          {studentCourseNames.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          setStudentBatchFilter("");
                          setStudentCourseFilter("");
                        }}
                      >
                        <i className="fa fa-undo me-1" />
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive mt-2">
                    <table className="table table-sm table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "60px" }}>#</th>
                          {/* <th>Batch</th> */}
                          <th>Reg. No</th>
                          <th>Student Name</th>
                          {/* <th>Course</th> */}
                          <th className="text-end">Live Classes</th>
                          <th className="text-end">Classes Attended</th>
                          {/* <th className="text-end">Attendance Events</th> */}
                          <th className="text-end">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudentStats.length === 0 && (
                          <tr>
                            <td colSpan={9} className="text-center text-muted">
                              No records found for selected filters.
                            </td>
                          </tr>
                        )}

                        {filteredStudentStats.map((row, idx) => (
                          <tr
                            key={`${row.batchName}-${row.registrationNo}-${row.course}-${idx}`}
                          >
                            <td>{idx + 1}</td>
                            {/* <td>{row.batchName}</td> */}
                            <td>{row.registrationNo}</td>
                            <td>{row.studentName}</td>
                            {/* <td>{row.course}</td> */}
                            <td className="text-end">
                              {row.totalLiveClasses}
                            </td>
                            <td className="text-end">
                              {row.classesAttendedByStudent}
                            </td>
                            {/* <td className="text-end">
                              {row.totalAttendanceEvents}
                            </td> */}
                            <td className="text-end">
                              {row.studentCourseAttendancePercent.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="p-2 rounded border bg-light h-100">
      <div className="text-muted small">{label}</div>
      <div className="fw-bold">{value}</div>
    </div>
  );
}

export default AdminLiveClassAttendanceAnalytics;
