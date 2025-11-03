// File: src/pages/AdminSupportTickets.jsx
import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/SupportTicket/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTickets(data);
    } catch {
      alert("\u26A0\uFE0F Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedFields) => {
    const token = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/SupportTicket/Update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFields),
    });
    if (res.ok) fetchTickets();
  };

  const handleCommentChange = (id, value) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, adminComment: value } : ticket
      )
    );
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
              <h2 className="text-primary mb-2">Support Tickets</h2>
              <p className="text-muted mb-0">Manage and respond to student queries.</p>
            </div>

            <div className="row">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="col-lg-6 col-md-12 mb-4">
                  <div className="card border border-primary shadow rounded-3 h-100">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{ticket.subject}</h6>
                      <span className={`badge badge-${ticket.status === "Resolved" ? "success" : ticket.status === "Closed" ? "secondary" : "warning"}`}>{ticket.status}</span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <p className="mb-1"><strong>Type:</strong> {ticket.type} → {ticket.subType}</p>
                      <p className="mb-2">{ticket.description}</p>
                      <p className="small text-muted">
                        <strong>Raised by:</strong> {ticket.studentName} <br />
                        <strong>Date:</strong> {new Date(ticket.startDate).toLocaleString()}
                      </p>

                      <div className="form-group mt-auto">
                        <label className="font-weight-bold">Admin Comment</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={ticket.adminComment || ""}
                          onChange={(e) => handleCommentChange(ticket.id, e.target.value)}
                          placeholder="Write your comment or response here..."
                        ></textarea>
                      </div>

                      <div className="btn-group btn-group-sm mt-3" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() => handleUpdate(ticket.id, {
                            status: "Resolved",
                            adminComment: ticket.adminComment || ""
                          })}
                        >
                           Mark Resolved
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleUpdate(ticket.id, {
                            status: "Closed",
                            adminComment: ticket.adminComment || ""
                          })}
                        >
                          Close Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {tickets.length === 0 && !loading && (
                <div className="col-12 text-center text-muted py-5">
                  <h5>No support tickets found.</h5>
                </div>
              )}
            </div>

          </div>
        </div>
         
      </div>
    </div>
  );
};

export default AdminSupportTickets;