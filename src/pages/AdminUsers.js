// File: pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import RoleAssignModal from "../components/users/RoleAssignModal";
import UserFormModal from "../components/users/UserFormModal";
import ConfirmationPopup from "../components/ConfirmationPopup";
import API_BASE_URL from "../config";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [sortField, setSortField] = useState("role");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, [isFormModalOpen, isRoleModalOpen]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/User`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error("❌ Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Filter roles and search input
  const filteredUsers = users
    .filter((u) => u.role !== "Faculty" && u.role !== "Student")
    .filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const fieldA = a[sortField]?.toLowerCase() || "";
    const fieldB = b[sortField]?.toLowerCase() || "";
    if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirmPopup(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("jwt");
      await fetch(`${API_BASE_URL}/User/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("🗑️ User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error("❌ Error deleting user");
    } finally {
      setShowConfirmPopup(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const handleRoleAssign = (user) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const onUserFormSubmit = () => {
    setIsFormModalOpen(false);
    toast.success("✅ User saved successfully");
  };

  const onRoleUpdated = () => {
    setIsRoleModalOpen(false);
    toast.success("🔐 Role updated successfully");
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
      <LeftSidebar role="Admin" />
      
      <div className="section-wrapper">
      <div className="page admin-dashboard">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i class="fa-solid fa-user-secret"></i> Manage Other Roles
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">
                View, edit, and manage other Roles
              </p>
            </div>
            <div className="d-flex flex-row justify-content-end">
            <a
                href="/users-dashboard"
                className="btn btn-outline-primary mt-2 mt-md-0 mb-2"
              >
                <i className="fa fa-arrow-left mr-1"></i> Back
              </a>
            </div>
            <div
                className="card-header text-white d-flex justify-content-between align-items-center mb-3"
                style={{ backgroundColor: "#5a67d8", borderRadius: "18px" }}
              >
                <h6 className="mb-0">Users List</h6>
            </div>

            <div className="mb-3 d-flex flex-wrap justify-content-between align-items-center">
              <div className="flex-grow-1 mr-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search by username or email"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button
                className="btn btn-primary rounded-pill mt-2 mt-md-0"
                onClick={handleCreate}
              >
                <i className="fa fa-plus mr-1"></i> Add Users
              </button>
            </div>

            <div className="card">
              <div className="card-body p-0">
                {currentUsers.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover table-striped align-middle mb-0 welcome-card animate-welcome">
                      <thead className="thead-light">
                        <tr>
                          <th>Profile</th>
                          <th onClick={() => handleSort("username")} style={{ cursor: "pointer" }}>
                            Username {sortField === "username" && (sortOrder === "asc" ? "▲" : "▼")}
                          </th>
                          <th>Email</th>
                          <th onClick={() => handleSort("role")} style={{ cursor: "pointer" }}>
                            Role {sortField === "role" && (sortOrder === "asc" ? "▲" : "▼")}
                          </th>
                          <th>Status</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      
                      <tbody>
                        
                        {currentUsers.map((user) => (
                          <tr key={user.userId}>
                            <td>
                              <div
                                className="avatar d-inline-block bg-primary text-white rounded-circle"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  textAlign: "center",
                                  lineHeight: "40px",
                                  fontWeight: "bold",
                                }}
                              >
                                {user.username?.charAt(0)?.toUpperCase()}
                              </div>
                            </td>
                            <td>{user.username} - {user.firstName} {user.lastName}</td>
                            <td>{user.email || "-"}</td>
                            <td>
                              <span
                                className={`badge ${
                                  user.role === "Admin" ? "badge-danger" : "badge-info"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  user.status === "Active" ? "badge-success" : "badge-warning"
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-info mr-1"
                                onClick={() => handleEdit(user)}
                              >
                                <i className="fa fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger mr-1"
                                onClick={() => handleDelete(user.userId)}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleRoleAssign(user)}
                              >
                                Role
                              </button>
                            </td>
                          </tr>
                        ))}
                        
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <h5>No users found.</h5>
                  </div>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <nav className="mt-4 d-flex justify-content-center">
                <ul className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                      onClick={() => handlePageChange(i + 1)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="page-link">{i + 1}</span>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>

         

        <RoleAssignModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          user={selectedUser}
          onRoleUpdated={onRoleUpdated}
        />
        <UserFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          user={selectedUser}
          onSave={onUserFormSubmit}
          mode={formMode}
        />
        <ConfirmationPopup
          show={showConfirmPopup}
          message="Are you sure you want to delete this user?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmPopup(false)}
        />
      </div>
      </div>
    </div>
  );
}

export default AdminUsers;
