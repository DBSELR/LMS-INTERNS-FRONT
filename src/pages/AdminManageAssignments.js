import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import Collapse from "react-bootstrap/Collapse";
import { FaUserGraduate } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import API_BASE_URL from "../config";

function AdminManageAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState(null);
  const [openSemester, setOpenSemester] = useState({});
  const [openPaper, setOpenPaper] = useState({});

  const [viewModal, setViewModal] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      fetch(
        `${API_BASE_URL}/AssignmentSubmission/GetAllSubmissionsById/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("📥 Assignments fetched:", data);
          setAssignments(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch assignments:", err);
          setAssignments([]);
        })
        .finally(() => setLoading(false));
    }
  }, [userId]);

  const filteredAssignments = assignments.filter((a) => {
    const text = search.toLowerCase();
    return (
      a.AssignmentTitle?.toLowerCase().includes(text) ||
      a.pname?.toLowerCase().includes(text) ||
      a.examtype?.toLowerCase().includes(text) ||
      a.AssignmentType?.toLowerCase().includes(text) ||
      new Date(a.StartDate).toLocaleDateString("en-GB").includes(text)
    );
  });

  const handleView = (examid) => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    setLoadingDetails(true);
    fetch(
      `${API_BASE_URL}/AssignmentSubmission/GetAssignmentSubmissionListById/${examid}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setSubmissionDetails(data);
        setViewModal(true);
      })
      .catch((err) => {
        console.error("Error fetching assignment details:", err);
        setSubmissionDetails([]);
      })
      .finally(() => setLoadingDetails(false));
  };

  const getGroupedAssignments = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const batch = item.batchname || "Unknown Batch";
      const semester = item.semester || "Unknown Semester";
      const paper = item.pname || "Unknown Paper";
      const batchSemesterKey = `Batch: ${batch} - Semester: ${semester}`;

      if (!grouped[batchSemesterKey]) grouped[batchSemesterKey] = {};
      if (!grouped[batchSemesterKey][paper])
        grouped[batchSemesterKey][paper] = [];
      grouped[batchSemesterKey][paper].push(item);
    });
    return grouped;
  };

  const groupedAssignments = getGroupedAssignments(filteredAssignments);

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
                <FaUserGraduate /> Manage Assignments
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">View all submitted assignments</p>
            </div>

            <div className="container-fluid mb-3">
              <div className="row align-items-center">
                <div className="col-md-8 mb-2 mb-md-0">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Search by title, subject, type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {Object.entries(groupedAssignments).map(
              ([batchSemesterKey, papers], sIndex) => {
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
                        <i
                          className={`fa ml-2 ${
                            openSemester[semesterKey]
                              ? "fa-chevron-up"
                              : "fa-chevron-down"
                          }`}
                        ></i>
                      </div>
                    </div>

                    <Collapse in={!!openSemester[semesterKey]}>
                      <div className="mt-2">
                        {Object.entries(papers).map(
                          ([paperName, assignmentList], pIndex) => {
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
                                  <div>
                                    <strong>Paper:</strong> {paperName}
                                  </div>
                                  <div className="badge badge-light text-dark px-2 py-1">
                                    Total Exams: {assignmentList.length}
                                    <i
                                      className={`fa ml-2 ${
                                        openPaper[paperKey]
                                          ? "fa-chevron-up"
                                          : "fa-chevron-down"
                                      }`}
                                    ></i>
                                  </div>
                                </div>

                                <Collapse in={!!openPaper[paperKey]}>
                                  <div className="mt-2 row">
                                    {assignmentList.map((exam) => (
                                      <div
                                        className="col-lg-4 col-md-6 mb-3"
                                        key={exam.examid}
                                      >
                                        <div
                                          className="card h-auto  border-0 mt-4 p-2"
                                          style={{
                                            background:
                                              "linear-gradient(135deg, #f0f0ff, #ffffff)",
                                            borderRadius: "20px",
                                          }}
                                        >
                                          <div className="card-body d-flex flex-column">
                                            <h5 className="text-dark fw-bold mb-2">
                                              <i className="fa fa-book mr-2 text-primary"></i>{" "}
                                              {exam.AssignmentTitle}
                                            </h5>

                                            <div className="mb-2">
                                              <span className="badge bg-primary text-light me-2">
                                                <i className="fa fa-file-alt me-1"></i>{" "}
                                                {exam.AssignmentType}
                                              </span>
                                              {/* <span className="badge bg-info text-dark">
                                                <i className="fa fa-clipboard-check me-1"></i>{" "}
                                                {exam.examtype}
                                              </span> */}
                                            </div>

                                            <div className="text-muted small mb-1">
                                              <i className="fa fa-calendar-alt me-1 text-secondary"></i>{" "}
                                              <strong>Start:</strong>{" "}
                                              {new Date(
                                                exam.StartDate
                                              ).toLocaleDateString("en-GB")}
                                            </div>
                                            <div className="text-muted small mb-1">
                                              <i className="fa fa-calendar-check me-1 text-secondary"></i>{" "}
                                              <strong>End:</strong>{" "}
                                              {new Date(
                                                exam.EndDate
                                              ).toLocaleDateString("en-GB")}
                                            </div>
                                            <div className="text-muted small mb-1">
                                              <i className="fa fa-hourglass-half me-1 text-secondary"></i>{" "}
                                              <strong>Duration:</strong>{" "}
                                              {exam.Duration} min
                                            </div>
                                            <div className="text-muted small mb-1">
                                              <i className="fa fa-trophy me-1 text-warning"></i>{" "}
                                              <strong>Total Marks:</strong>{" "}
                                              {exam.totmrk} |{" "}
                                              <strong>Pass Marks:</strong>{" "}
                                              {exam.passmrk}
                                            </div>
                                            <div className=" pt-2 ">
                                              <span
                                                className={`badge px-3 py-2 ${
                                                  exam.attempted
                                                    ? "bg-success text-light btn btn-sm"
                                                    : "bg-danger text-light btn btn-sm"
                                                }`}
                                              >
                                                {exam.attempted
                                                  ? `✅ Attempted (${exam.attempted})`
                                                  : `❌ Not Attempted (${exam.attempted})`}
                                              </span>

                                              <button
                                                className="btn btn-sm btn-outline-primary ml-3"
                                                onClick={() =>
                                                  handleView(exam.examid)
                                                }
                                              >
                                                <i className="fa fa-eye"></i>{" "}
                                                View
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
                          }
                        )}
                      </div>
                    </Collapse>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
      </div>

      <Modal
        show={viewModal}
        onHide={() => setViewModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title> Sudents Submissions List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div>Loading...</div>
          ) : submissionDetails.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Details</th>
                    <th>Programme</th>
                    <th>Batch</th>
                    <th>Semester</th>
                    <th>Paper</th>
                    <th>Assignment Title</th>
                    <th>Exam Type</th>
                    <th>Assignment Type</th>
                    <th>Total Marks</th>
                    <th>Pass Marks</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Duration (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {submissionDetails.map((d, i) => (
                    <tr key={i}>
                      <td>{d.StudentId}</td>
                      <td>{d.StudentDetails}</td>
                      <td>{d.ProgrammeName}</td>
                      <td>{d.batchname}</td>
                      <td>{d.semester}</td>
                      <td>{d.pname}</td>
                      <td>{d.AssignmentTitle}</td>
                      <td>{d.examtype}</td>
                      <td>{d.AssignmentType}</td>
                      <td>{d.totmrk}</td>
                      <td>{d.passmrk}</td>
                      <td>
                        {new Date(d.StartDate).toLocaleDateString("en-GB")}
                      </td>
                      <td>{new Date(d.EndDate).toLocaleDateString("en-GB")}</td>
                      <td>{d.Duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-danger">No submission details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

       
    </div>
  );
}

export default AdminManageAssignments;
