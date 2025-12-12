import React, { useState, useEffect } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import AddStudent from "../components/students/AddStudent";
import { FaUserGraduate } from "react-icons/fa";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import Collapse from "react-bootstrap/Collapse";
import API_BASE_URL from "../config";

function Collegewisestudents() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mode, setMode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState(null);

  const [openBatch, setOpenBatch] = useState({});
  const [openUniversity, setOpenUniversity] = useState({});
  const [openCollege, setOpenCollege] = useState({});
  const [openProgramme, setOpenProgramme] = useState({});
  const [openGroup, setOpenGroup] = useState({});
  const [searchText, setSearchText] = useState("");

  const [activeTab] = useState("batch");
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const resolvedRole =
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decoded.role;
        const id = decoded["UserId"] || decoded.userId;
        setRole(resolvedRole);
        setUserId(id);
      } catch (err) {
        console.error("Token decode failed", err);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) fetchStudents(userId);
  }, [userId, refreshKey]);

  const fetchStudents = async (uid) => {
    const token = localStorage.getItem("jwt");
    try {
      const res = await fetch(`${API_BASE_URL}/student/collegewisestudents/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setStudents([]);
    }
  };

  const refreshStudents = () => setRefreshKey((p) => p + 1);

  const closeModal = () => {
    setSelectedStudent(null);
    setMode(null);
    setShowModal(false);
  };

  const handleAddNew = () => {
    setSelectedStudent(null);
    setMode(null);
    setShowModal(true);
  };

  const handleAdd = async (student) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(student),
      });

      if (res.ok) {
        toast.success("Student added successfully!");
        refreshStudents();
        closeModal();
        return res;
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        const errorResponse = new Error(`HTTP ${res.status}: ${JSON.stringify(errorData)}`);
        errorResponse.status = res.status;
        errorResponse.data = errorData;
        throw errorResponse;
      }
    } catch (err) {
      console.error("Add error:", err);
      throw err;
    }
  };

  const handleEdit = async (student) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/student/details/${student.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fullData = await res.json();
      setSelectedStudent(fullData);
      setMode("edit");
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to load student details for edit.");
    }
  };

  const handleView = async (student) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/student/details/${student.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fullData = await res.json();
      setSelectedStudent(fullData);
      setMode("view");
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to load student details.");
    }
  };

  const handleUpdate = async (updatedStudent) => {
    try {
      const token = localStorage.getItem("jwt");
      const userIdForUpdate = updatedStudent.userId || selectedStudent?.userId;
      if (!userIdForUpdate) {
        toast.error("Unable to identify student for update.");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/student/update/${userIdForUpdate}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedStudent),
      });
      if (response.ok) {
        toast.success("Student updated!");
        refreshStudents();
        closeModal();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        toast.error(`Update failed: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Update failed.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("jwt");
      await fetch(`${API_BASE_URL}/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Student deleted!");
      refreshStudents();
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const removeDuplicateStudents = (students) => {
    const uniqueMap = {};
    students.forEach((s) => {
      const id = s.UserId || s.userId || s.UserID || s.userID;
      uniqueMap[id || `${s.email || s.email}`] = s;
    });
    return Object.values(uniqueMap);
  };

  const deduplicatedStudents = removeDuplicateStudents(students);

  const filteredStudents = deduplicatedStudents.filter((student) => {
    const text = searchText.toLowerCase();
    return (
      (student.FirstName && student.FirstName.toLowerCase().includes(text)) ||
      (student.firstName && student.firstName.toLowerCase().includes(text)) ||
      (student.lastName && student.lastName.toLowerCase().includes(text)) ||
      (student.username && student.username.toLowerCase().includes(text)) ||
      (student.email && student.email.toLowerCase().includes(text)) ||
      (student.programme && student.programme.toLowerCase().includes(text)) ||
      (student.group && student.group.toLowerCase().includes(text)) ||
      (student.semester && student.semester.toString().toLowerCase().includes(text)) ||
      (student.ssem && student.ssem.toString().toLowerCase().includes(text)) ||
      (student.phoneNumber && student.phoneNumber.toLowerCase().includes(text)) ||
      (student.status && student.status.toLowerCase().includes(text))
    );
  });

  // Grouping with university & college
  const getGroupedStudents = (students) => {
    const grouped = {};
    students.forEach((student) => {
      const batch = student.BatchName || student.batchName || "Unknown Batch";
      const semester = student.ssem || student.semester || "Unknown Semester";
      const university = student.uname || student.university || "Unknown University";
      const college = student.colname || student.college || "Unknown College";
      const programme = student.Programme || student.programme || "Unknown Programme";
      const group = student.group || student.Group || "Unknown Group";

      const batchSemesterKey = `${batch} / ${semester}`;

      if (!grouped[batchSemesterKey]) grouped[batchSemesterKey] = {};
      if (!grouped[batchSemesterKey][university]) grouped[batchSemesterKey][university] = {};
      if (!grouped[batchSemesterKey][university][college]) grouped[batchSemesterKey][university][college] = {};
      if (!grouped[batchSemesterKey][university][college][programme]) grouped[batchSemesterKey][university][college][programme] = {};
      if (!grouped[batchSemesterKey][university][college][programme][group]) grouped[batchSemesterKey][university][college][programme][group] = [];

      grouped[batchSemesterKey][university][college][programme][group].push(student);
    });
    return grouped;
  };

  const groupedStudents = getGroupedStudents(filteredStudents);

  // helper: count students in a college object (college -> programmes -> groups -> arrays)
  const countStudentsInCollege = (collegeObj) => {
    let c = 0;
    Object.values(collegeObj).forEach((programmeObj) => {
      Object.values(programmeObj).forEach((groupsObj) => {
        Object.values(groupsObj).forEach((studentsArr) => {
          c += Array.isArray(studentsArr) ? studentsArr.length : 0;
        });
      });
    });
    return c;
  };

  // helper: count students in a programme (programme -> groups -> arrays)
  const countStudentsInProgramme = (programmeObj) => {
    let c = 0;
    Object.values(programmeObj).forEach((groupsObj) => {
      Object.values(groupsObj).forEach((studentsArr) => {
        c += Array.isArray(studentsArr) ? studentsArr.length : 0;
      });
    });
    return c;
  };

  useEffect(() => {
    if (searchText.trim() === "") return;

    const newOpenBatch = {};
    const newOpenUni = {};
    const newOpenCollege = {};
    const newOpenProgramme = {};
    const newOpenGroup = {};

    Object.entries(groupedStudents).forEach(([batchKey, unis], bsIndex) => {
      let batchHas = false;
      Object.entries(unis).forEach(([uniName, colleges], uniIndex) => {
        let uniHas = false;
        Object.entries(colleges).forEach(([collegeName, programmes], collegeIndex) => {
          let collegeHas = false;
          Object.entries(programmes).forEach(([programmeName, groups], pIndex) => {
            let progHas = false;
            Object.entries(groups).forEach(([groupName, studentsArr], gIndex) => {
              if (studentsArr && studentsArr.length > 0) {
                const groupKey = `${bsIndex}-${uniIndex}-${collegeIndex}-${pIndex}-${gIndex}`;
                newOpenGroup[groupKey] = true;
                progHas = true;
                collegeHas = true;
                uniHas = true;
                batchHas = true;
              }
            });
            if (progHas) newOpenProgramme[`${bsIndex}-${uniIndex}-${collegeIndex}-${pIndex}`] = true;
          });
          if (collegeHas) newOpenCollege[`${bsIndex}-${uniIndex}-${collegeIndex}`] = true;
        });
        if (uniHas) newOpenUni[`${bsIndex}-${uniIndex}`] = true;
      });
      if (batchHas) newOpenBatch[bsIndex] = true;
    });

    setOpenBatch(newOpenBatch);
    setOpenUniversity(newOpenUni);
    setOpenCollege(newOpenCollege);
    setOpenProgramme(newOpenProgramme);
    setOpenGroup(newOpenGroup);
  }, [searchText]); // eslint-disable-line

  const toggleAll = () => {
    if (!allOpen) {
      const newOpenBatchAll = {};
      const newOpenUniAll = {};
      const newOpenCollegeAll = {};
      const newOpenProgrammeAll = {};
      const newOpenGroupAll = {};

      Object.entries(groupedStudents).forEach(([batchKey, unis], bsIndex) => {
        newOpenBatchAll[bsIndex] = true;
        Object.entries(unis).forEach(([uniName, colleges], uniIndex) => {
          newOpenUniAll[`${bsIndex}-${uniIndex}`] = true;
          Object.entries(colleges).forEach(([collegeName, programmes], collegeIndex) => {
            newOpenCollegeAll[`${bsIndex}-${uniIndex}-${collegeIndex}`] = true;
            Object.entries(programmes).forEach(([programmeName, groups], pIndex) => {
              newOpenProgrammeAll[`${bsIndex}-${uniIndex}-${collegeIndex}-${pIndex}`] = true;
              Object.entries(groups).forEach(([groupName, students], gIndex) => {
                newOpenGroupAll[`${bsIndex}-${uniIndex}-${collegeIndex}-${pIndex}-${gIndex}`] = true;
              });
            });
          });
        });
      });

      setOpenBatch(newOpenBatchAll);
      setOpenUniversity(newOpenUniAll);
      setOpenCollege(newOpenCollegeAll);
      setOpenProgramme(newOpenProgrammeAll);
      setOpenGroup(newOpenGroupAll);
      setAllOpen(true);
    } else {
      setOpenBatch({});
      setOpenUniversity({});
      setOpenCollege({});
      setOpenProgramme({});
      setOpenGroup({});
      setAllOpen(false);
    }
  };

  // styles you can tweak
  const universityStyle = { color: "#0b5ed7", fontWeight: 600 }; // blue
  const collegeStyle = { color: "#b045ff", fontWeight: 600 }; // purple-ish

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            {(role === "Admin" || role === "College") && (
              <div className="container-fluid">
                <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                  <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                    <FaUserGraduate /> Manage Students
                  </h2>
                  <p className="text-muted mb-0 dashboard-hero-sub">Add, edit, and manage students</p>
                </div>
                <div className="d-flex flex-row justify-content-between">
                  {(activeTab === "batch" || activeTab === "subject") && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={toggleAll}
                      title={allOpen ? "Collapse all" : "Expand all"}
                      aria-label={allOpen ? "Collapse all" : "Expand all"}
                      style={{ marginLeft: "10px" }}
                    >
                      {allOpen ? <i className="fa-solid fa-minimize" /> : <i className="fa-solid fa-maximize" />}
                    </button>
                  )}
                  <button onClick={() => window.history.back()} className="btn btn-outline-primary mt-2 mt-md-0 mb-2">
                    <i className="fa fa-arrow-left mr-1"></i> Back
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="section-body mt-2">
            <div className="container-fluid">
              <div className="welcome-card animate-welcome">
                <div className="card-header bg-primary text-white d-flex align-items-center">
                  <FaUserGraduate className="mr-2 mt-2" />
                  <h6 className="mb-0">Student Management</h6>
                </div>

                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3 align-items-start flex-wrap">
                    <input
                      type="text"
                      className="form-control w-50"
                      placeholder="Search by name or username..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />

                    {/* <div className="d-flex align-items-center mt-2 mt-md-0">
                      {["College"].includes(role) && (
                        <button className="btn btn-primary ml-2" onClick={handleAddNew}>
                          <i className="fa fa-plus mr-1"></i> Add Student
                        </button>
                      )}
                    </div> */}
                  </div>

                  {/* Render grouped students: batch -> university -> college -> programme -> group */}
                  {Object.entries(groupedStudents).map(([batchSemester, unis], bsIndex) => (
                    <div key={batchSemester} className="mb-3 p-2">
                      <div
                        className="d-flex justify-content-between align-items-center semester-toggle-btn text-blue"
                        onClick={() =>
                          setOpenBatch((prev) => ({
                            ...prev,
                            [bsIndex]: !prev[bsIndex],
                          }))
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <div>
                          <strong>Batch:</strong> {batchSemester.split(" / ")[0]}
                        </div>

                        <i className={`fa ml-2 ${openBatch[bsIndex] ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                      </div>

                      <Collapse in={!!openBatch[bsIndex]}>
                        <div className="mt-2">
                          {Object.entries(unis).map(([uniName, colleges], uniIndex) => {
                            const uniKey = `${bsIndex}-${uniIndex}`;
                            return (
                              <div key={uniName} className="mb-2 border p-2">
                                <div
                                  className={`d-flex justify-content-between align-items-center semester-toggle-btn ${openUniversity[uniKey] ? "bg-secondary" : "bg-dark"}`}
                                  onClick={() =>
                                    setOpenUniversity((prev) => ({
                                      ...prev,
                                      [uniKey]: !prev[uniKey],
                                    }))
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <div style={universityStyle}>
                                    <strong>University:</strong> {uniName}
                                  </div>
                                  <i className={`fa ml-2 ${openUniversity[uniKey] ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                                </div>

                                <Collapse in={!!openUniversity[uniKey]}>
                                  <div className="mt-2">
                                    {Object.entries(colleges).map(([collegeName, programmes], collegeIndex) => {
                                      const collegeKey = `${bsIndex}-${uniIndex}-${collegeIndex}`;
                                      const collegeCount = countStudentsInCollege({ [collegeName]: programmes });
                                      return (
                                        <div key={collegeName} className="mb-2 border p-2">
                                          <div
                                            className={`d-flex justify-content-between align-items-center semester-toggle-btn ${openCollege[collegeKey] ? "bg-secondary" : "bg-dark"}`}
                                            onClick={() =>
                                              setOpenCollege((prev) => ({
                                                ...prev,
                                                [collegeKey]: !prev[collegeKey],
                                              }))
                                            }
                                            style={{ cursor: "pointer" }}
                                          >
                                            <div style={collegeStyle}>
                                              <strong>College:</strong> {collegeName}{" "}
                                              <small className="ml-2" style={{ fontWeight: 500, color: "#333" }}>
                                                ({collegeCount} students)
                                              </small>
                                            </div>
                                            <i className={`fa ml-2 ${openCollege[collegeKey] ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                                          </div>

                                          <Collapse in={!!openCollege[collegeKey]}>
                                            <div className="mt-2">
                                              {Object.entries(programmes).map(([programmeName, groups], pIndex) => {
                                                const progKey = `${bsIndex}-${uniIndex}-${collegeIndex}-${pIndex}`;
                                                const progCount = countStudentsInProgramme({ [programmeName]: groups });
                                                const groupNames = Object.keys(groups);
                                                const hasOnlyDummyGroup =
                                                  groupNames.length === 1 && ["---", "", "Unknown Group", null].includes(groupNames[0]);

                                                return (
                                                  <div key={programmeName} className="mb-2 border p-2">
                                                    <div
                                                      className={`d-flex justify-content-between align-items-center text-white semester-toggle-btn ${openProgramme[progKey] ? "bg-secondary" : "bg-dark"}`}
                                                      onClick={() =>
                                                        setOpenProgramme((prev) => ({
                                                          ...prev,
                                                          [progKey]: !prev[progKey],
                                                        }))
                                                      }
                                                      style={{ cursor: "pointer" }}
                                                    >
                                                      <div>
                                                        <strong>Course:</strong> {programmeName}{" "}
                                                        <small style={{ fontWeight: 600, color: "#333" }}>
                                                          ({progCount} students)
                                                        </small>
                                                      </div>
                                                      <i className={`fa ml-2 ${openProgramme[progKey] ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                                                    </div>

                                                    <Collapse in={!!openProgramme[progKey]}>
                                                      <div className="semester-panel-body mt-2">
                                                        {hasOnlyDummyGroup ? (
                                                          <div className="row">
                                                            {groups[groupNames[0]].map((student, idx) => (
                                                              <div key={`${student.userId || student.UserId}-${idx}`} className="col-lg-4 col-md-6 mb-3">
                                                                <div className="card shadow-sm h-100 border-0">
                                                                  <div className="card-body d-flex flex-column align-items-center text-center">
                                                                    <div className="avatar d-inline-block rounded-circle mb-3" style={{ width: "100px", height: "100px", backgroundColor: "#6c757d", textAlign: "center", lineHeight: "100px", fontWeight: "bold", fontSize: "36px" }}>
                                                                      {((student.firstName || student.FirstName || student.username || student.Username) || "U")[0].toUpperCase()}
                                                                    </div>
                                                                    <h5 className="font-weight-bold mb-1">{student.firstName || student.FirstName || ""} {student.lastName || student.LastName || ""}</h5>
                                                                    <p className="text-muted small mb-1"><strong>Username:</strong> {student.username || student.Username || "N/A"}</p>
                                                                    <p className="text-muted small mb-1"><strong>Course:</strong> {student.programme || student.Programme || "N/A"}</p>
                                                                    <p className="text-muted small mb-1"><strong>mentor:</strong> {(student.mentor || student.Mentor) || "N/A"}</p>
                                                                    <ul className="list-unstyled text-muted small mb-3 mt-2">
                                                                      <li><i className="fa fa-envelope text-primary mr-1"></i>{student.email || student.Email || "No Email"}</li>
                                                                      <li><i className="fa fa-phone text-success mr-1"></i>{student.phoneNumber || student.PhoneNumber || "No Phone"}</li>
                                                                    </ul>
                                                                    <span className={`badge px-3 py-2 ${(student.status || student.Status) === "Active" ? "badge-success" : "badge-danger"}`}>{student.status || student.Status || "Inactive"}</span>
                                                                    <div className="mt-3">
                                                                      <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => handleView(student)}><i className="fa fa-eye mr-1"></i> View</button>
                                                                      {(role === "Admin" || role === "College") && (
                                                                        <>
                                                                          <button className="btn btn-sm btn-outline-info mr-2 rounded-pill" onClick={() => handleEdit(student)}><i className="fa fa-edit mr-1"></i> Edit</button>
                                                                          <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(student.userId || student.UserId)}><i className="fa fa-trash mr-1"></i> Delete</button>
                                                                        </>
                                                                      )}
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        ) : (
                                                          Object.entries(groups).map(([groupName, studentsList], gIndex) => (
                                                            <div key={groupName} className="mb-2 border p-2">
                                                              <div className="mt-2 row">
                                                                {Array.isArray(studentsList) && studentsList.length > 0 ? (
                                                                  studentsList.map((student, idx) => (
                                                                    <div key={`${student.userId || student.UserId}-${idx}`} className="col-lg-4 col-md-6 mb-3">
                                                                      <div className="card shadow-sm h-100 border-0">
                                                                        <div className="card-body d-flex flex-column align-items-center text-center">
                                                                          <div className="avatar d-inline-block rounded-circle mb-3" style={{ width: "100px", height: "100px", backgroundColor: "#6c757d", textAlign: "center", lineHeight: "100px", fontWeight: "bold", fontSize: "36px" }}>
                                                                            {((student.firstName || student.FirstName || student.username || student.Username) || "U")[0].toUpperCase()}
                                                                          </div>
                                                                          <h5 className="font-weight-bold mb-1">{student.firstName || student.FirstName || ""}</h5>
                                                                          <p className="text-muted small mb-1"><strong>Username:</strong> {student.username || student.Username || "N/A"}</p>
                                                                          <p className="text-muted small mb-1"><strong>Course:</strong> {student.programme || student.Programme || "N/A"}</p>
                                                                          <p className="text-muted small mb-1"><strong>SRO:</strong> {student.mentor || student.Mentor || "N/A"}</p>
                                                                          <ul className="list-unstyled text-muted small mb-3 mt-2">
                                                                            <li><i className="fa fa-envelope text-primary mr-1"></i>{student.email || student.Email || "No Email"}</li>
                                                                            <li><i className="fa fa-phone text-success mr-1"></i>{student.phoneNumber || student.PhoneNumber || "No Phone"}</li>
                                                                          </ul>
                                                                          <span className={`badge px-3 py-2 ${(student.status || student.Status) === "Active" ? "badge-success" : "badge-danger"}`}>{student.status || student.Status || "Inactive"}</span>
                                                                          {/* <div className="mt-3">
                                                                            <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => handleView(student)}><i className="fa fa-eye mr-1"></i> View</button>
                                                                            {role === "Admin" && (
                                                                              <>
                                                                                <button className="btn btn-sm btn-outline-info mr-2 rounded-pill" onClick={() => handleEdit(student)}><i className="fa fa-edit mr-1"></i> Edit</button>
                                                                                <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(student.userId || student.UserId)}><i className="fa fa-trash mr-1"></i> Delete</button>
                                                                              </>
                                                                            )}
                                                                          </div> */}
                                                                        </div>
                                                                      </div>
                                                                    </div>
                                                                  ))
                                                                ) : (
                                                                  <p className="text-muted">No students in this group.</p>
                                                                )}
                                                              </div>
                                                            </div>
                                                          ))
                                                        )}
                                                      </div>
                                                    </Collapse>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </Collapse>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </Collapse>
                              </div>
                            );
                          })}
                        </div>
                      </Collapse>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* {showModal && (
            <div className="modal show fade d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{mode === "edit" ? "Edit Student" : mode === "view" ? "View Student Details" : "Add New Student"}</h5>
                    <button type="button" className="close" onClick={closeModal}><span>&times;</span></button>
                  </div>
                  <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <AddStudent student={selectedStudent} editMode={mode === "edit"} readOnly={mode === "view"} onSubmit={mode === "edit" ? handleUpdate : handleAdd} onCancel={closeModal} />
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default Collegewisestudents;
