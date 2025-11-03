import React, { useState, useEffect } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

function LeaveRequest() {
  const token = localStorage.getItem("jwt");
  const decoded = jwtDecode(token);
  const instructorId = decoded["UserId"] || decoded.userId;

  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchLeaves = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/leave/my-leaves/${instructorId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setLeaves(data);
    } catch (err) {
      console.error("Error fetching leave requests", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/leave/${instructorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Submission failed");
      setMessage("Leave request submitted successfully!");
      setForm({ startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave?")) return;
    await fetch(`${API_BASE_URL}/leave/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    fetchLeaves();
  };

  const filteredLeaves = leaves.filter(l =>
    statusFilter === "All" ? true : l.status === statusFilter
  );

  const formatDate = (iso) => new Date(iso).toLocaleDateString();

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
              <h2 className="text-primary mb-2">Submit Leave Request</h2>
              <p className="text-muted mb-0">Fill in your leave details below.</p>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" className="form-control" name="startDate" value={form.startDate} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" className="form-control" name="endDate" value={form.endDate} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Reason</label>
                    <textarea className="form-control" name="reason" rows="3" value={form.reason} onChange={handleChange} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
                {message && <p className="mt-3 text-info">{message}</p>}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between">
                <h6 className="mb-0">My Leave Requests</h6>
                <select className="form-select form-select-sm w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
              <div className="card-body">
                <div className="row">
                  {filteredLeaves.map((leave, i) => (
                    <div key={i} className="col-md-6 col-lg-4 mb-4">
                      <div className="card shadow-sm h-100 border-0">
                        <div className="card-body">
                          <h6 className="mb-1 fw-bold text-dark">{leave.reason}</h6>
                          <p className="text-muted mb-2">
                            {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                          </p>
                          <span className={`badge bg-${
                            leave.status === "Pending" ? "warning" :
                            leave.status === "Approved" ? "success" : "danger"
                          } text-white`}>{leave.status}</span>
                          <div className="mt-3 text-end">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(leave.leaveRequestId)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!filteredLeaves.length && (
                    <div className="text-center text-muted w-100">No leave requests found</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
         
      </div>
    </div>
  );
}

export default LeaveRequest;
