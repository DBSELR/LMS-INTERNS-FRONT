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

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mode, setMode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState(null);

  const [openBatch, setOpenBatch] = useState({});
  const [openProgramme, setOpenProgramme] = useState({});
  const [openGroup, setOpenGroup] = useState({});
  const [searchText, setSearchText] = useState("");

  // NEW: to support your condition (activeTab === "batch" || activeTab === "subject")
  // This page is batch-style grouping, so we'll treat it as "batch".
  const [activeTab] = useState("batch");

  // NEW: global expand/collapse toggle state
  const [allOpen, setAllOpen] = useState(false);

  // ======================
  // Decode JWT for role/id
  // ======================
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("✅ Decoded Token:", decoded);
        const resolvedRole =
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decoded.role;
        const id = decoded["UserId"] || decoded.userId;
        setRole(resolvedRole);
        setUserId(id);
        console.log("✅ Role:", resolvedRole, "UserId:", id);
      } catch (err) {
        console.error("❌ Token decode failed", err);
      }
    }
  }, []);

  // ======================
  // Fetch students for this user
  // ======================
  useEffect(() => {
    if (userId) {
      fetchStudents(userId);
    }
  }, [userId, refreshKey]);

  const fetchStudents = async (uid) => {
    const token = localStorage.getItem("jwt");
    try {
      const res = await fetch(`${API_BASE_URL}/student/students/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("✅ Fetched students data:", data);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setStudents([]);
    }
  };

  const refreshStudents = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // ======================
  // Modal helpers
  // ======================
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

  // ======================
  // CRUD actions
  // ======================
  const handleAdd = async (student) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/student/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(student),
      });
      if (res.ok) {
        // Success: close modal, refresh list, show toast
        toast.success("Student added successfully!");
        refreshStudents();
        closeModal();
        return res;
      } else {
        // Pass the error response to AddStudent for modal display
        return res;
      }
    } catch (err) {
      return err;
    }
  };

  const handleEdit = async (student) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/student/details/${student.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      const res = await fetch(
        `${API_BASE_URL}/student/details/${student.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      await fetch(
        `${API_BASE_URL}/student/update/${updatedStudent.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedStudent),
        }
      );
      toast.success("Student updated!");
      refreshStudents();
      closeModal();
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("jwt");
      await fetch(`${API_BASE_URL}/students/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Student deleted!");
      refreshStudents();
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  // ======================
  // Deduplicate
  // ======================
  const removeDuplicateStudents = (students) => {
    const uniqueMap = {};
    students.forEach((s) => {
      uniqueMap[s.userId] = s;
    });
    const deduped = Object.values(uniqueMap);
    console.log("✅ Deduplicated students:", deduped);
    return deduped;
  };

  const deduplicatedStudents = removeDuplicateStudents(students);

  // ======================
  // Search filter
  // ======================
  const filteredStudents = deduplicatedStudents.filter((student) => {
    const text = searchText.toLowerCase();
    return (
      (student.firstName &&
        student.firstName.toLowerCase().includes(text)) ||
      (student.lastName &&
        student.lastName.toLowerCase().includes(text)) ||
      (student.username &&
        student.username.toLowerCase().includes(text)) ||
      (student.email && student.email.toLowerCase().includes(text)) ||
      (student.programme &&
        student.programme.toLowerCase().includes(text)) ||
      (student.group && student.group.toLowerCase().includes(text)) ||
      (student.semester &&
        student.semester.toString().toLowerCase().includes(text)) ||
      (student.phoneNumber &&
        student.phoneNumber.toLowerCase().includes(text)) ||
      (student.status && student.status.toLowerCase().includes(text)) ||
      (student.userId &&
        student.userId.toString().toLowerCase().includes(text))
    );
  });
  console.log("✅ Filtered students:", filteredStudents);

  // ======================
  // Grouping logic
  // ======================
  const getGroupedStudents = (students) => {
    const grouped = {};
    students.forEach((student) => {
      const batch = student.batchName || "Unknown Batch";
      const semester = student.semester || "Unknown Semester";
      const programme = student.programme || "Unknown Programme";
      const group = student.group || "Unknown Group";

      const batchSemesterKey = `${batch} / ${semester}`;

      if (!grouped[batchSemesterKey]) grouped[batchSemesterKey] = {};
      if (!grouped[batchSemesterKey][programme])
        grouped[batchSemesterKey][programme] = {};
      if (!grouped[batchSemesterKey][programme][group])
        grouped[batchSemesterKey][programme][group] = [];

      grouped[batchSemesterKey][programme][group].push(student);
    });

    return grouped;
  };

  const groupedStudents = getGroupedStudents(filteredStudents);

  // ======================
  // Auto-open when searching
  // ======================
  useEffect(() => {
    if (searchText.trim() === "") return;

    const newOpenBatchSemester = {};
    const newOpenProgramme = {};
    const newOpenGroup = {};

    Object.entries(groupedStudents).forEach(
      ([batchSemesterKey, programmes], bsIndex) => {
        let batchSemesterHasMatch = false;

        Object.entries(programmes).forEach(
          ([programmeName, groups], pIndex) => {
            let programmeHasMatch = false;

            Object.entries(groups).forEach(
              ([groupName, students], gIndex) => {
                const hasMatch = students.length > 0;
                if (hasMatch) {
                  newOpenGroup[`${bsIndex}-${pIndex}-${gIndex}`] = true;
                  programmeHasMatch = true;
                  batchSemesterHasMatch = true;
                }
              }
            );

            if (programmeHasMatch) {
              newOpenProgramme[`${bsIndex}-${pIndex}`] = true;
            }
          }
        );

        if (batchSemesterHasMatch) {
          newOpenBatchSemester[bsIndex] = true;
        }
      }
    );

    setOpenBatch(newOpenBatchSemester);
    setOpenProgramme(newOpenProgramme);
    setOpenGroup(newOpenGroup);
  }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  // ======================
  // toggleAll logic (NEW)
  // ======================
  const toggleAll = () => {
    // If we're expanding all:
    if (!allOpen) {
      const newOpenBatchAll = {};
      const newOpenProgrammeAll = {};
      const newOpenGroupAll = {};

      Object.entries(groupedStudents).forEach(
        ([batchSemesterKey, programmes], bsIndex) => {
          newOpenBatchAll[bsIndex] = true; // open each batch/semester

          Object.entries(programmes).forEach(
            ([programmeName, groups], pIndex) => {
              const programmeKey = `${bsIndex}-${pIndex}`;
              newOpenProgrammeAll[programmeKey] = true; // open each programme

              Object.entries(groups).forEach(
                ([groupName, students], gIndex) => {
                  const groupKey = `${bsIndex}-${pIndex}-${gIndex}`;
                  newOpenGroupAll[groupKey] = true; // open each group
                }
              );
            }
          );
        }
      );

      setOpenBatch(newOpenBatchAll);
      setOpenProgramme(newOpenProgrammeAll);
      setOpenGroup(newOpenGroupAll);
      setAllOpen(true);
    } else {
      // Collapse all
      setOpenBatch({});
      setOpenProgramme({});
      setOpenGroup({});
      setAllOpen(false);
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
          <div className="section-body mt-3 pt-0">
            {role === "Admin" && (
              <div className="container-fluid">
                <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                  <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                    <FaUserGraduate /> Manage Students
                  </h2>
                  <p className="text-muted mb-0 dashboard-hero-sub">
                    Add, edit, and manage students
                  </p>
                </div>
                <div className="d-flex flex-row justify-content-between">
                  {/* <a
                href="/users-dashboard"
                className="btn btn-outline-primary mt-2 mt-md-0 mb-2"
              >
                <i className="fa fa-arrow-left mr-1"></i> Back
              </a> */}

              {/* ✅ YOUR NEW TOGGLE BUTTON BLOCK */}
                      {(activeTab === "batch" || activeTab === "subject") && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={toggleAll}
                          title={allOpen ? "Collapse all" : "Expand all"}
                          aria-label={allOpen ? "Collapse all" : "Expand all"}
                          style={{ marginLeft: "10px" }}
                        >
                          {allOpen ? (
                            <i className="fa-solid fa-minimize" />
                          ) : (
                            <i className="fa-solid fa-maximize" />
                          )}
                        </button>
                      )}
                  <button
                    onClick={() => window.history.back()}
                    className="btn btn-outline-primary mt-2 mt-md-0 mb-2"
                  >
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

                    <div className="d-flex align-items-center mt-2 mt-md-0">
                      

                      {["Admin", "Faculty"].includes(role) && (
                        <button
                          className="btn btn-primary ml-2"
                          onClick={handleAddNew}
                        >
                          <i className="fa fa-plus mr-1"></i> Add Student
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Render grouped students */}
                  {Object.entries(groupedStudents).map(
                    ([batchSemester, programmes], bsIndex) => (
                      <div key={batchSemester} className="mb-3 p-2">
                        <div
                          className={`d-flex justify-content-between align-items-center semester-toggle-btn ${
                            openBatch[bsIndex]
                              ? "text-blue"
                              : "text-blue"
                          }`}
                          onClick={() =>
                            setOpenBatch((prev) => ({
                              ...prev,
                              [bsIndex]: !prev[bsIndex],
                            }))
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <div>
                            <strong>Batch:</strong>{" "}
                            {batchSemester.split(" / ")[0]}
                          </div>

                          <i
                            className={`fa ml-2 ${
                              openBatch[bsIndex]
                                ? "fa-chevron-up"
                                : "fa-chevron-down"
                            }`}
                          ></i>
                        </div>

                        <Collapse in={!!openBatch[bsIndex]}>
                          <div className="mt-2">
                            {Object.entries(programmes).map(
                              ([programmeName, groups], pIndex) => {
                                const programmeKey = `${bsIndex}-${pIndex}`;
                                const groupNames = Object.keys(groups);
                                const hasOnlyDummyGroup =
                                  groupNames.length === 1 &&
                                  ["---", "", "Unknown Group", null].includes(
                                    groupNames[0]
                                  );

                                return (
                                  <div
                                    key={programmeName}
                                    className="mb-2 border p-2"
                                  >
                                    <div
                                      className={`d-flex justify-content-between align-items-center text-white semester-toggle-btn ${
                                        openProgramme[programmeKey]
                                          ? "bg-secondary"
                                          : "bg-dark"
                                      }`}
                                      onClick={() =>
                                        setOpenProgramme((prev) => ({
                                          ...prev,
                                          [programmeKey]:
                                            !prev[programmeKey],
                                        }))
                                      }
                                      style={{ cursor: "pointer" }}
                                    >
                                      <div>
                                        <strong>Board:</strong>{" "}
                                        {programmeName}
                                      </div>
                                      <i
                                        className={`fa ml-2 ${
                                          openProgramme[programmeKey]
                                            ? "fa-chevron-up"
                                            : "fa-chevron-down"
                                        }`}
                                      ></i>
                                    </div>

                                    <Collapse in={!!openProgramme[programmeKey]}>
                                      <div className="semester-panel-body">
                                        <div className="mt-2">
                                          {hasOnlyDummyGroup ? (
                                            <div className="row">
                                              {groups[
                                                groupNames[0]
                                              ].map((student) => (
                                                <div
                                                  key={`${student.userId}-${student.username}`}
                                                  className="col-lg-4 col-md-6 mb-3"
                                                >
                                                  <div className="card shadow-sm h-100 border-0">
                                                    <div className="card-body d-flex flex-column align-items-center text-center">
                                                      <div
                                                        className="avatar d-inline-block rounded-circle mb-3"
                                                        style={{
                                                          width: "100px",
                                                          height: "100px",
                                                          backgroundColor:
                                                            "#6c757d",
                                                          textAlign: "center",
                                                          lineHeight: "100px",
                                                          fontWeight: "bold",
                                                          fontSize: "36px",
                                                        }}
                                                      >
                                                        {(
                                                          student.firstName ||
                                                          student.username ||
                                                          "U"
                                                        )[0].toUpperCase()}
                                                      </div>
                                                      <h5 className="font-weight-bold mb-1">
                                                        {student.firstName ||
                                                          ""}{" "}
                                                        {student.lastName || ""}
                                                        {!student.firstName &&
                                                          !student.lastName &&
                                                          student.username}
                                                      </h5>
                                                      <p className="text-muted small mb-1">
                                                        <strong>
                                                          Username:
                                                        </strong>{" "}
                                                        {student.username ||
                                                          "N/A"}
                                                      </p>
                                                      <p className="text-muted small mb-1">
                                                        <strong>Board:</strong>{" "}
                                                        {student.programme ||
                                                          "N/A"}
                                                      </p>
                                                      <p className="text-muted small mb-1">
                                                        <strong>Class:</strong>{" "}
                                                        {student.group ||
                                                          "N/A"}
                                                      </p>
                                                      {/* <p className="text-muted small mb-1">
                                                <strong>Semester:</strong> {student.semester || "N/A"}
                                              </p> */}
                                                      <p className="text-muted small mb-1">
                                                        <strong>mentor:</strong>{" "}
                                                        {student.mentor ||
                                                          "N/A"}
                                                      </p>

                                                      <ul className="list-unstyled text-muted small mb-3 mt-2">
                                                        <li>
                                                          <i className="fa fa-envelope text-primary mr-1"></i>
                                                          {student.email ||
                                                            "No Email"}
                                                        </li>
                                                        <li>
                                                          <i className="fa fa-phone text-success mr-1"></i>
                                                          {student.phoneNumber ||
                                                            "No Phone"}
                                                        </li>
                                                      </ul>
                                                      <span
                                                        className={`badge px-3 py-2 ${
                                                          student.status ===
                                                          "Active"
                                                            ? "badge-success"
                                                            : "badge-danger"
                                                        }`}
                                                      >
                                                        {student.status ||
                                                          "Inactive"}
                                                      </span>
                                                      <div className="mt-3">
                                                        <button
                                                          className="btn btn-sm btn-outline-primary mr-2"
                                                          onClick={() =>
                                                            handleView(student)
                                                          }
                                                        >
                                                          <i className="fa fa-eye mr-1"></i>{" "}
                                                          View
                                                        </button>
                                                        {role === "Admin" && (
                                                          <>
                                                            <button
                                                              className="btn btn-sm btn-outline-info mr-2 rounded-pill"
                                                              onClick={() =>
                                                                handleEdit(
                                                                  student
                                                                )
                                                              }
                                                            >
                                                              <i className="fa fa-edit mr-1"></i>{" "}
                                                              Edit
                                                            </button>
                                                            <button
                                                              className="btn btn-sm btn-outline-danger rounded-pill"
                                                              onClick={() =>
                                                                handleDelete(
                                                                  student.userId
                                                                )
                                                              }
                                                            >
                                                              <i className="fa fa-trash mr-1"></i>{" "}
                                                              Delete
                                                            </button>
                                                          </>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            Object.entries(groups).map(
                                              (
                                                [groupName, studentsList],
                                                gIndex
                                              ) => {
                                                const groupKey = `${bsIndex}-${pIndex}-${gIndex}`;
                                                return (
                                                  <div
                                                    key={groupName}
                                                    className="mb-2 border p-2"
                                                  >
                                                    <div
                                                      className={`d-flex justify-content-between align-items-center text-white semester-toggle-btn ${
                                                        openGroup[groupKey]
                                                          ? "bg-dark"
                                                          : "bg-secondary"
                                                      }`}
                                                      onClick={() =>
                                                        setOpenGroup(
                                                          (prev) => ({
                                                            ...prev,
                                                            [groupKey]:
                                                              !prev[groupKey],
                                                          })
                                                        )
                                                      }
                                                      style={{
                                                        cursor: "pointer",
                                                      }}
                                                    >
                                                      <div>
                                                        <strong>
                                                          Class:
                                                        </strong>{" "}
                                                        {groupName}
                                                      </div>
                                                      <i
                                                        className={`fa ml-2 ${
                                                          openGroup[groupKey]
                                                            ? "fa-chevron-up"
                                                            : "fa-chevron-down"
                                                        }`}
                                                      ></i>
                                                    </div>

                                                    <Collapse
                                                      in={
                                                        !!openGroup[groupKey]
                                                      }
                                                    >
                                                      <div className="mt-2 row">
                                                        {Array.isArray(
                                                          studentsList
                                                        ) &&
                                                        studentsList.length >
                                                          0 ? (
                                                          studentsList.map(
                                                            (student) => (
                                                              <div
                                                                key={`${student.userId}-${student.username}`}
                                                                className="col-lg-4 col-md-6 mb-3"
                                                              >
                                                                <div className="card shadow-sm h-100 border-0">
                                                                  <div className="card-body d-flex flex-column align-items-center text-center">
                                                                    <div
                                                                      className="avatar d-inline-block rounded-circle mb-3"
                                                                      style={{
                                                                        width:
                                                                          "100px",
                                                                        height:
                                                                          "100px",
                                                                        backgroundColor:
                                                                          "#6c757d",
                                                                        textAlign:
                                                                          "center",
                                                                        lineHeight:
                                                                          "100px",
                                                                        fontWeight:
                                                                          "bold",
                                                                        fontSize:
                                                                          "36px",
                                                                      }}
                                                                    >
                                                                      {(
                                                                        student.firstName ||
                                                                        student.username ||
                                                                        "U"
                                                                      )[0].toUpperCase()}
                                                                    </div>
                                                                    <h5 className="font-weight-bold mb-1">
                                                                      {student.firstName ||
                                                                        ""}{" "}
                                                                      {student.lastName ||
                                                                        ""}
                                                                      {!student.firstName &&
                                                                        !student.lastName &&
                                                                        student.username}
                                                                    </h5>
                                                                    <p className="text-muted small mb-1">
                                                                      <strong>
                                                                        Username:
                                                                      </strong>{" "}
                                                                      {student.username ||
                                                                        "N/A"}
                                                                    </p>
                                                                    <p className="text-muted small mb-1">
                                                                      <strong>
                                                                        Board:
                                                                      </strong>{" "}
                                                                      {student.programme ||
                                                                        "N/A"}
                                                                    </p>
                                                                    <p className="text-muted small mb-1">
                                                                      <strong>
                                                                        Class:
                                                                      </strong>{" "}
                                                                      {student.group ||
                                                                        "N/A"}
                                                                    </p>
                                                                    {/* <p className="text-muted small mb-1">
                                                          <strong>Semester:</strong> {student.semester || "N/A"}
                                                        </p> */}
                                                                    <p className="text-muted small mb-1">
                                                                      <strong>
                                                                        SRO:
                                                                      </strong>{" "}
                                                                      {student.mentor ||
                                                                        "N/A"}
                                                                    </p>
                                                                    <ul className="list-unstyled text-muted small mb-3 mt-2">
                                                                      <li>
                                                                        <i className="fa fa-envelope text-primary mr-1"></i>
                                                                        {student.email ||
                                                                          "No Email"}
                                                                      </li>
                                                                      <li>
                                                                        <i className="fa fa-phone text-success mr-1"></i>
                                                                        {student.phoneNumber ||
                                                                          "No Phone"}
                                                                      </li>
                                                                    </ul>
                                                                    <span
                                                                      className={`badge px-3 py-2 ${
                                                                        student.status ===
                                                                        "Active"
                                                                          ? "badge-success"
                                                                          : "badge-danger"
                                                                      }`}
                                                                    >
                                                                      {student.status ||
                                                                        "Inactive"}
                                                                    </span>
                                                                    <div className="mt-3">
                                                                      <button
                                                                        className="btn btn-sm btn-outline-primary mr-2"
                                                                        onClick={() =>
                                                                          handleView(
                                                                            student
                                                                          )
                                                                        }
                                                                      >
                                                                        <i className="fa fa-eye mr-1"></i>{" "}
                                                                        View
                                                                      </button>
                                                                      {role ===
                                                                        "Admin" && (
                                                                        <>
                                                                          <button
                                                                            className="btn btn-sm btn-outline-info mr-2 rounded-pill"
                                                                            onClick={() =>
                                                                              handleEdit(
                                                                                student
                                                                              )
                                                                            }
                                                                          >
                                                                            <i className="fa fa-edit mr-1"></i>{" "}
                                                                            Edit
                                                                          </button>
                                                                          <button
                                                                            className="btn btn-sm btn-outline-danger rounded-pill"
                                                                            onClick={() =>
                                                                              handleDelete(
                                                                                student.userId
                                                                              )
                                                                            }
                                                                          >
                                                                            <i className="fa fa-trash mr-1"></i>{" "}
                                                                            Delete
                                                                          </button>
                                                                        </>
                                                                      )}
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            )
                                                          )
                                                        ) : (
                                                          <p className="text-muted">
                                                            No students in this
                                                            group.
                                                          </p>
                                                        )}
                                                      </div>
                                                    </Collapse>
                                                  </div>
                                                );
                                              }
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </Collapse>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </Collapse>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {showModal && (
            <div
              className="modal show fade d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {mode === "edit"
                        ? "Edit Student"
                        : mode === "view"
                        ? "View Student Details"
                        : "Add New Student"}
                    </h5>
                    <button
                      type="button"
                      className="close"
                      onClick={closeModal}
                    >
                      <span>&times;</span>
                    </button>
                  </div>
                  <div
                    className="modal-body"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    <AddStudent
                      student={selectedStudent}
                      editMode={mode === "edit"}
                      readOnly={mode === "view"}
                      onSubmit={mode === "edit" ? handleUpdate : handleAdd}
                      onCancel={closeModal}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
           
        </div>
      </div>
    </div>
  );
}

export default StudentsPage;
