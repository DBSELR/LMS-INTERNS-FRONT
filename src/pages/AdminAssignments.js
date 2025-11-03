import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import AssignmentFormModal from "../components/assignments/AssignmentFormModal";
import { Collapse } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import API_BASE_URL from "../config";

function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openGroup, setOpenGroup] = useState({});

  const token = localStorage.getItem("jwt");
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
    } catch (err) {
      console.error("JWT decode error", err);
    }
  }

  const fetchAssignments = async () => {
    const camelizeObject = (obj) => {
      if (Array.isArray(obj)) return obj.map(camelizeObject);
      if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key.charAt(0).toLowerCase() + key.slice(1),
            camelizeObject(value),
          ])
        );
      }
      return obj;
    };

    try {

      const response = await fetch(`${API_BASE_URL}/Assignment/GetAllAssignments`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }

      );
      const data = await response.json();
      const fetchedAssignments = Array.isArray(data) ? camelizeObject(data) : [];
      setAssignments(fetchedAssignments);
    } catch (err) {
      console.error("Error fetching assignments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        const token = localStorage.getItem("jwt");
        await fetch(`${API_BASE_URL}/Assignment/${id}`, { method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        fetchAssignments();
      } catch (err) {
        console.error("Error deleting assignment", err);
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setSelectedAssignment(null);
    fetchAssignments();
  };

  const filteredAssignments = assignments.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase())
  );

const groupedAssignments = filteredAssignments.reduce((acc, a) => {
  const groupKey = `${a.programme || "No Course"} - ${a.semester || "No Semester"}`;
  if (!acc[groupKey]) acc[groupKey] = [];
  acc[groupKey].push(a);
  return acc;
}, {});


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

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="p-4 welcome-card animate-welcome mb-4">
              <div>
                <h2 className="text-primary mb-2">Manage Assignments</h2>
                <p className="text-muted mb-0">Create, edit, and manage all assignments efficiently.</p>
              </div>
              {role !== "Student" && role !== "Admin" && (
                <button className="btn btn-primary mt-3 mt-md-0" onClick={() => {
                  setSelectedAssignment(null);
                  setShowModal(true);
                }}>
                  <i className="fa fa-plus mr-1"></i> Add New Assignment
                </button>
              )}
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
                <input
                  type="text"
                  className="form-control w-50 mb-2 mb-md-0"
                  placeholder="Search assignments by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {Object.keys(groupedAssignments).length > 0 ? (
              Object.entries(groupedAssignments).map(([groupName, groupList], index) => (
                <div key={groupName} className="mb-4">
                  <button
                    className="w-100 text-white text-left px-3 py-2 d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: "#1c1c1c", border: "none", borderRadius: "25px", fontWeight: "bold" }}
                    onClick={() => setOpenGroup(prev => ({ ...prev, [index]: !prev[index] }))}
                  >
                    <span>{groupName} ({groupList.length} Assignments)</span>
                    {openGroup[index] ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  <Collapse in={!!openGroup[index]}>
                    <div className="mt-3">
                      <div className="card shadow-sm">
                        <div className="card-body p-0">
                          <div className="table-responsive">
                            <table className="table table-bordered mb-0">
                              <thead className="thead-light">
                                <tr>
                                  <th>Title</th>
                                  <th>Description</th>
                                  <th>Due Date</th>
                                  <th>Max Grade</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupList.map((a) => (
                                  <tr key={a.assignmentId}>
                                    <td>{a.title}</td>
                                    <td>{a.description}</td>
                                    <td>{new Date(a.dueDate).toLocaleDateString()}</td>
                                    <td>{a.maxGrade}</td>
                                    <td>
                                      <button className="btn btn-sm btn-outline-info mr-2" onClick={() => handleEdit(a)}>
                                        <i className="fa fa-edit"></i>
                                      </button>
                                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.assignmentId)}>
                                        <i className="fa fa-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Collapse>
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-5">
                <h5>No assignments found.</h5>
              </div>
            )}
          </div>
        </div>
         
      </div>

      {showModal && (
        <AssignmentFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleSave}
          assignment={selectedAssignment}
        />
      )}
    </div>
  );
}

export default AdminAssignments;
