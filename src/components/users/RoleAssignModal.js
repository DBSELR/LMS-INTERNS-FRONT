// src/components/admin/RoleAssignModal.jsx
import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../config";

function RoleAssignModal({ isOpen, onClose, user, onRoleUpdated }) {
  const [selectedRole, setSelectedRole] = useState(user?.role || "");

  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  const handleRoleChange = async () => {
    if (!selectedRole || !user) return;

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/User/ReassignRole/${user.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (res.ok) {
        onRoleUpdated(); // Refresh parent list
        onClose();
      } else {
        alert("Failed to reassign role.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error occurred while updating role.");
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Reassign Role for {user.username}</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <label>Role</label>
            <select
              className="form-control"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
              <option value="Parent">Parent</option>
              <option value="Accountant">Accountant</option>
              <option value="Director">Director</option>
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRoleChange}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleAssignModal;
