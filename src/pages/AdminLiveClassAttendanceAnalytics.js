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

  // 🔹 Batch-wise stats
  const [stats, setStats] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourseKey, setSelectedCourseKey] = useState("");
  const [lastSelectedCourse, setLastSelectedCourse] = useState(null);

  // 🔹 Student-wise stats
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

        // ========== 1) Batch-wise ==========
        const res = await fetch(
          `${API_BASE_URL}/LiveClass/GetLiveclassAttPercent?InstructorId=${instructorId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
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

        // ========== 2) Student-wise ==========
        const resStudents = await fetch(
          `${API_BASE_URL}/LiveClass/GetLiveclassAttPercentByStudents?InstructorId=${instructorId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
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

  // ================= Batch-wise derived =================

  const batches = useMemo(() => {
    const map = {};
    stats.forEach((row) => {
      if (!map[row.batchName]) map[row.batchName] = [];
      map[row.batchName].push(row);
    });
    return map;
  }, [stats]);

  const batchNames = Object.keys(batches);

  const coursesForBatch = useMemo(() => {
    if (!selectedBatch || !batches[selectedBatch]) return [];
    return batches[selectedBatch];
  }, [batches, selectedBatch]);

  const selectedCourse = useMemo(() => {
    if (!selectedCourseKey || coursesForBatch.length === 0) return null;
    const [batch, examIdStr] = selectedCourseKey.split("-");
    const examId = parseInt(examIdStr, 10);
    return coursesForBatch.find(
      (c) => c.batchName === batch && c.examinationID === examId
    );
  }, [selectedCourseKey, coursesForBatch]);

  useEffect(() => {
    if (selectedCourse) setLastSelectedCourse(selectedCourse);
  }, [selectedCourse]);

  const displayedCourse = selectedCourse || lastSelectedCourse;

  // Pie chart: attended vs not attended
  const pieData = useMemo(() => {
    const attPercent = displayedCourse?.courseAttendancePercent ?? 0;
    const clampedAtt = Math.max(0, Math.min(100, attPercent));
    const notAtt = 100 - clampedAtt;

    return {
      labels: ["Attended", "Not Attended"],
      datasets: [
        {
          data: [clampedAtt, notAtt],
          backgroundColor: ["#2563eb", "#e5e7eb"],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }, [displayedCourse]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
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

  // ================= Student-wise derived =================

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

  const filteredStudentStats = useMemo(
    () =>
      studentStats.filter((row) => {
        if (studentBatchFilter && row.batchName !== studentBatchFilter)
          return false;
        if (studentCourseFilter && row.course !== studentCourseFilter)
          return false;
        return true;
      }),
    [studentStats, studentBatchFilter, studentCourseFilter]
  );

  // ================= RENDER =================

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

      <div className="section-wrapper analytics-page">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            <div className="container-fluid analytics-container">
              {/* ===== HEADER ===== */}
              <div className="analytics-header">
                <div className="analytics-header__titles">
                  <h2 className="analytics-title">
                    <span className="analytics-title__icon">
                      <i className="fa fa-bar-chart" />
                    </span>
                    Live Class Attendance Analytics
                  </h2>
                  <p className="analytics-subtitle">
                    Understand how students attend your live sessions — batch-wise
                    & student-wise.
                  </p>
                </div>
                <button
                  className="btn analytics-back-btn"
                  onClick={() => navigate(-1)}
                >
                  <i className="fa fa-arrow-left me-1" />
                  Back to Dashboard
                </button>
              </div>

              {/* ===== TAB TOGGLE ===== */}
              <div className="analytics-tab-toggle">
                <button
                  type="button"
                  className={
                    "analytics-tab-toggle__btn" +
                    (activeTab === "batch" ? " is-active" : "")
                  }
                  onClick={() => setActiveTab("batch")}
                >
                  <span className="analytics-tab-toggle__label">
                    Batch-wise
                  </span>
                  <span className="analytics-tab-toggle__hint">
                    Per course / batch
                  </span>
                </button>
                <button
                  type="button"
                  className={
                    "analytics-tab-toggle__btn" +
                    (activeTab === "student" ? " is-active" : "")
                  }
                  onClick={() => setActiveTab("student")}
                >
                  <span className="analytics-tab-toggle__label">
                    Student-wise
                  </span>
                  <span className="analytics-tab-toggle__hint">
                    Per student detail
                  </span>
                </button>
              </div>

              {/* ============== TAB 1: BATCH-WISE ============== */}
              {activeTab === "batch" && (
                <>
                  {/* Filters */}
                  {batchNames.length > 0 && (
                    <div className="analytics-filter-bar">
                      <div className="analytics-filter-bar__item">
                        <label className="analytics-filter__label">
                          Select Batch <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select form-select-sm analytics-filter__select"
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
                    </div>
                  )}

                  <div className="row g-3 analytics-main-row">
                    {/* Left: Pie chart */}
                    <div className="col-12 col-lg-5">
                      <div className="analytics-card analytics-card--chart">
                        <div className="analytics-card__header">
                          <div className="analytics-card__title-wrap">
                            <span className="analytics-card__icon">
                              <i className="fa fa-pie-chart" />
                            </span>
                            <h5 className="analytics-card__title">
                              Course Attendance %
                            </h5>
                          </div>
                          <select
                            className="form-select form-select-sm analytics-card__select"
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

                        {selectedCourse ? (
                          <>
                            <div className="analytics-chart-container">
                              <Pie data={pieData} options={pieOptions} />
                            </div>
                            <div className="analytics-chart-footer">
                              <div className="analytics-chart-footer__title">
                                {selectedCourse.paperCode} -{" "}
                                {selectedCourse.paperName}
                              </div>
                              <div className="analytics-chart-footer__meta">
                                Batch:{" "}
                                <strong>{selectedCourse.batchName}</strong>
                              </div>
                              <div className="analytics-chart-footer__badges">
                                <span className="analytics-pill analytics-pill--info">
                                  Attendance{" "}
                                  {selectedCourse.courseAttendancePercent.toFixed(
                                    2
                                  )}
                                  %
                                </span>
                                <span className="analytics-pill analytics-pill--success">
                                  Reach{" "}
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

                    {/* Right: Stats + table */}
                    <div className="col-12 col-lg-7">
                      <div className="analytics-card analytics-card--table">
                        <div className="analytics-card__header mb-2">
                          <div className="analytics-card__title-wrap">
                            <span className="analytics-card__icon">
                              <i className="fa fa-list-alt" />
                            </span>
                            <h5 className="analytics-card__title">
                              Batch-wise Live Class Stats
                            </h5>
                          </div>
                        </div>

                        {displayedCourse && (
                          <div className="analytics-stat-grid">
                            <StatBadge
                              label="Total Live Classes"
                              value={displayedCourse.totalLiveClasses}
                            />
                            <StatBadge
                              label="Total Students"
                              value={displayedCourse.totalStudents}
                            />
                            <StatBadge
                              label="Total Attendances"
                              value={displayedCourse.totalAttendances}
                            />
                            <StatBadge
                              label="Students Attended"
                              value={displayedCourse.studentsWhoAttended}
                            />
                            <StatBadge
                              label="Course Attendance %"
                              value={`${displayedCourse.courseAttendancePercent.toFixed(
                                2
                              )}%`}
                            />
                            <StatBadge
                              label="Overall Batch %"
                              value={`${displayedCourse.overallAttendancePercentPerBatch.toFixed(
                                2
                              )}%`}
                            />
                          </div>
                        )}

                        <div className="analytics-table-wrapper mt-3">
                          <table className="table table-sm table-hover align-middle analytics-table">
                            <thead className="analytics-table__head">
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
                                    className={
                                      "analytics-table__row" +
                                      (isActive
                                        ? " analytics-table__row--active"
                                        : "")
                                    }
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

              {/* ============== TAB 2: STUDENT-WISE ============== */}
              {activeTab === "student" && (
                <div className="analytics-card analytics-card--full">
                  {/* Filters */}
                  <div className="analytics-filter-bar analytics-filter-bar--student">
                    <div className="analytics-filter-bar__left">
                      <div className="analytics-filter-bar__item">
                        <label className="analytics-filter__label">
                          Batch <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select form-select-sm analytics-filter__select"
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

                      <div className="analytics-filter-bar__item">
                        <label className="analytics-filter__label">
                          Course
                        </label>
                        <select
                          className="form-select form-select-sm analytics-filter__select"
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

                    <div className="analytics-filter-bar__right">
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

                  {/* Table */}
                  <div className="analytics-table-wrapper analytics-table-wrapper--student">
                    <table className="table table-sm table-hover align-middle analytics-table analytics-table--student">
                      <thead className="analytics-table__head">
                        <tr>
                          <th style={{ width: "50px" }}>#</th>
                          <th>Registration No.</th>
                          <th>Student Name</th>
                          <th className="text-end">Live Classes</th>
                          <th className="text-end">Classes Attended</th>
                          <th className="text-end">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudentStats.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center text-muted">
                              No records found for selected filters.
                            </td>
                          </tr>
                        )}

                        {filteredStudentStats.map((row, idx) => (
                          <tr
                            key={`${row.batchName}-${row.registrationNo}-${row.course}-${idx}`}
                          >
                            <td>{idx + 1}</td>
                            <td>{row.registrationNo}</td>
                            <td>{row.studentName}</td>
                            <td className="text-end">
                              {row.totalLiveClasses}
                            </td>
                            <td className="text-end">
                              {row.classesAttendedByStudent}
                            </td>
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
    <div className="analytics-stat-badge">
      <div className="analytics-stat-badge__label">{label}</div>
      <div className="analytics-stat-badge__value">{value}</div>
    </div>
  );
}

export default AdminLiveClassAttendanceAnalytics;
