import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../config";

function StaffTable() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch staff data from the backend
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${API_BASE_URL}/admin/search?query=staff`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setStaff(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching staff data:", error);
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // Handle Delete operation
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${API_BASE_URL}/admin/delete-staff/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        alert(result.message);
        setStaff(staff.filter((member) => member.userId !== id)); // Remove deleted staff from state
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("Error deleting staff");
      }
    }
  };

  // Handle Edit operation (Example: Navigate to edit page)
  const handleEdit = (id) => {
    // Navigate to edit staff page (you can create a new page for this)
    // For example: navigate(`/edit-staff/${id}`);
    alert(`Edit staff with ID: ${id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-vcenter text-nowrap table-striped mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Designation</th>
            <th>Email</th>
            <th>Join Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member, index) => (
            <tr key={index}>
              <td>
                <img className="avatar" src="../assets/images/xs/avatar3.jpg" alt="avatar" />
              </td>
              <td>{member.username}</td> {/* Changed from name to username */}
              <td>{member.phone}</td>
              <td>{member.designation}</td>
              <td>{member.email}</td>
              <td>{member.joinDate}</td>
              <td>
                <span className={`tag tag-${member.status === "Full-time" ? "success" : "warning"}`}>
                  {member.status}
                </span>
              </td>
              <td>
                {/* <button type="button" className="btn btn-icon btn-sm" title="View">
                  <i className="fa fa-eye"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-icon btn-sm"
                  title="Edit"
                  onClick={() => handleEdit(member.userId)} // Pass userId for editing
                >
                  <i className="fa fa-edit"></i>
                </button> */}
                <button
                  type="button"
                  className="btn btn-icon btn-sm"
                  title="Delete"
                  onClick={() => handleDelete(member.userId)} // Pass userId for deletion
                >
                  <i className="fa fa-trash-o text-danger"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StaffTable;
