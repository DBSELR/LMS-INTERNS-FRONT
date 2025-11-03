import React, { useState, useEffect } from "react";
import ProfessorsTable from "../components/professors/ProfessorsTable";
import AddProfessor from "../components/professors/AddProfessor";
import CourseAssignmentModal from "../components/professors/AssignCoursesModal";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { FaChalkboardTeacher } from "react-icons/fa";
import API_BASE_URL from "../config";

function ProfessorsPage() {
  const [professors, setProfessors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [mode, setMode] = useState(null);
  const [assignedCourseIds, setAssignedCourseIds] = useState([]);
  const [showAssignCoursesModal, setShowAssignCoursesModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfessors(), fetchCourses()]);
      setLoading(false);
    };

    loadData();
  }, [refreshKey]);

  const fetchProfessors = async (retry = true) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/professor/`, {
        
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch professors");
      const data = await res.json();
      setProfessors(data);
    } catch (err) {
      console.error("Fetch error (professors):", err);
      if (retry) setTimeout(() => fetchProfessors(false), 1000);
    }
  };

  const fetchCourses = async (retry = true) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/course/All`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Fetch error (courses):", err);
      if (retry) setTimeout(() => fetchCourses(false), 1000);
    }
  };

  const refreshProfessors = () => setRefreshKey((prev) => prev + 1);

  const handleView = (prof) => {
    setSelectedProfessor(prof);
    setMode("view");
    setShowAddEditModal(true);
  };

  const handleEdit = (prof) => {
    setSelectedProfessor(prof);
    setMode("edit");
    setShowAddEditModal(true);
  };

  const handleAddNew = () => {
    setSelectedProfessor(null);
    setMode(null);
    setShowAddEditModal(true);
  };

  const closeAddEditModal = () => {
    setSelectedProfessor(null);
    setMode(null);
    setShowAddEditModal(false);
    refreshProfessors();
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("jwt");
    await fetch(`${API_BASE_URL}/professor/by-user/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    refreshProfessors();
  };

  const handleUpdate = async (updatedProf) => {
    const token = localStorage.getItem("jwt");
    await fetch(`${API_BASE_URL}/professor/${updatedProf.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(updatedProf),
    });
    refreshProfessors();
    closeAddEditModal();
  };

  const handleAssignCourses = (professor, courseIds) => {
    setSelectedProfessor(professor);
    setAssignedCourseIds(courseIds);
    setShowAssignCoursesModal(true);
  };

  const handleAssignCoursesToProfessor = async (assignedCourseIds) => {
    if (!selectedProfessor) return alert("Please select a professor");

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${API_BASE_URL}/professor/assign-course/${selectedProfessor.userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ courseIds: assignedCourseIds }),
        }
      );

      if (response.ok) {
        alert("Courses assigned successfully!");
        refreshProfessors();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
// ProfessorsPage.js (or wherever you define onSubmit)
const handleAdd = async (payload) => {
  const token = localStorage.getItem("jwt");

  // normalize base (no trailing slash)
  const base = String(API_BASE_URL || "").replace(/\/+$/, "");

  // if base already ends with /api, use it; otherwise add /api
  const url = /\/api$/i.test(base)
    ? `${base}/Professor`        // e.g., https://localhost:7099/api/Professor
    : `${base}/api/Professor`;   // e.g., https://localhost:7099/api/Professor

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await res.text(); // read body for details in case of error
  if (!res.ok) {
    if (res.status === 409) {
      // Always throw a plain error with only the friendly message
      throw new Error("Duplicate entries detected. Please provide a unique email address and phone number.");
    }
    console.error("❌ POST /Professor failed:", res.status, bodyText);
    throw new Error(bodyText || `HTTP ${res.status}`);
  }
  return bodyText ? JSON.parse(bodyText) : null;
};



  const handleCloseModal = () => {
    setSelectedProfessor(null);
    setShowAssignCoursesModal(false);
  };

  const filteredProfessors = professors.filter((prof) => {
    const term = searchTerm.toLowerCase();
    return (
      prof.fullName?.toLowerCase().includes(term) ||
      prof.firstName?.toLowerCase().includes(term) ||
      prof.lastName?.toLowerCase().includes(term) ||
      prof.email?.toLowerCase().includes(term) ||
      prof.phoneNumber?.toLowerCase().includes(term) ||
      prof.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
       
      <div className="section-wrapper">
      <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <div>
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <FaChalkboardTeacher /> Manage Faculty
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  View, add, and manage all Faculty in the system.
                </p>
              </div>
            </div>
            <div className="d-flex flex-row justify-content-end">
              {/* <a
                href="/users-dashboard"
                className="btn btn-outline-primary mt-2 mt-md-0 mb-2"
              >
                <i className="fa fa-arrow-left mr-1"></i> Back
              </a> */}

              <button
                onClick={() => window.history.back()}
                className="btn btn-outline-primary mt-2 mt-md-0 mb-2"
              >
                <i className="fa fa-arrow-left mr-1"></i> Back
              </button>

            </div>
          </div>
        </div>


        <div className="section-body mt-2">
          <div className="container-fluid">
            <div className="welcome-card animate-welcome">
              <div className="card-header bg-primary text-white d-flex align-items-center">
                <FaChalkboardTeacher className="mr-2 mt-2" />
                <h6 className="mb-0">Faculty Management</h6>
              </div>
              
              
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <input
                    type="text"
                    placeholder="Search by name, phone, email, or department..."
                    className="form-control w-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <button className="btn btn-primary" onClick={handleAddNew}>
                    <i className="fa fa-plus mr-1"></i> Add Faculty
                  </button>
                </div>
                
                <div className="semester-panel-body">
                {loading ? (
                  <div className="text-center p-5">Loading faculty...</div>
                ) : (
                  <ProfessorsTable
                    professors={filteredProfessors}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAssignCourses={handleAssignCourses}
                  />
                )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {showAddEditModal && (
          <div
            className="modal show fade d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {mode === "edit"
                      ? "Edit Faculty"
                      : mode === "view"
                        ? "View Faculty"
                        : "Add Faculty"}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={closeAddEditModal}
                  >
                    <span>&times;</span>
                  </button>
                </div>

                <div
                  className="modal-body"
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  <AddProfessor
                    key={mode + (selectedProfessor?.userId || "new")}
                    professor={selectedProfessor}
                    mode={mode}
                    onSubmit={mode === "edit" ? handleUpdate : handleAdd}
                    onCancel={closeAddEditModal}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {showAssignCoursesModal && (
          <CourseAssignmentModal
            professorId={selectedProfessor?.userId}
            assignedCourseIds={assignedCourseIds}
            onAssign={() => {
              refreshProfessors();
              handleCloseModal();
            }}
            onClose={handleCloseModal}
          />
        )}

         
      </div>
      </div>
    </div>
  );
}

export default ProfessorsPage;
