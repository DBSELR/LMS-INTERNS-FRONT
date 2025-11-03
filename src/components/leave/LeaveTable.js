import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../config";

function LeaveTable() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/leave`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch leave data");
      const data = await res.json();
      setLeaves(data);
    } catch (error) {
      console.error("Error loading leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/leave/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to approve leave");
      fetchLeaveData();
    } catch (err) {
      alert("Approval failed");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/leave/${id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to reject leave");
      fetchLeaveData();
    } catch (err) {
      alert("Rejection failed");
    }
  };

  if (loading) return <div className="text-center p-4">Loading leave requests...</div>;

  return (
    <div className="container-fluid">
      <div className="row">
        {leaves.map((leave) => (
          <div className="col-md-6 col-lg-4 mb-4" key={leave.leaveRequestId}>
            <div className="card shadow-sm h-100 border-0 leave-card">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={leave.profilePhotoUrl || "/assets/images/xs/avatar1.jpg"}
                    alt="avatar"
                    className="rounded-circle mr-3"
                    width="50"
                    height="50"
                    style={{ objectFit: "cover" }}
                  />
                  <div>
                    <h6 className="mb-0">{leave.name}</h6>
                    <span
                      className={`badge bg-${
                        leave.status === "Approved"
                          ? "success"
                          : leave.status === "Rejected"
                          ? "danger"
                          : "warning"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="mb-1">
                    <strong>Reason:</strong> {leave.reason}
                  </p>
                  <p className="mb-1">
                    <strong>From:</strong> {leave.startDate?.split("T")[0]}
                  </p>
                  <p className="mb-0">
                    <strong>To:</strong> {leave.endDate?.split("T")[0]}
                  </p>
                </div>
                {leave.status === "Pending" && (
                  <div className="mt-auto d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleApprove(leave.leaveRequestId)}
                    >
                      <i className="fa fa-check"></i> Approve
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleReject(leave.leaveRequestId)}
                    >
                      <i className="fa fa-times"></i> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaveTable;
