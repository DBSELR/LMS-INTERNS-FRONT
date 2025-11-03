// File: src/pages/SubmitTicket.jsx
import React, { useState, useEffect } from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

const SubmitTicket = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [subType, setSubType] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tickets, setTickets] = useState([]);

  const typeOptions = {
    "Lab/Project": ["Lab related queries", "Project topic approval", "Submission delay"],
    "Hostel": ["Room maintenance", "Meal quality", "Electricity issue"],
    "Fees": ["Fee discrepancy", "Scholarship query", "Late fine"]
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const decoded = jwtDecode(token);
      const id = decoded["UserId"] || decoded.userId || decoded.nameid;
      setStudentId(id);
      fetchStudentTickets(id);
    }
  }, []);

  const fetchStudentTickets = async (id) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/SupportTicket/Student/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch student tickets", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const ticket = {
      studentId,
      subject,
      description,
      type,
      subType
    };

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/SupportTicket/Add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(ticket)
      });
      if (!res.ok) throw new Error("Failed to submit ticket");
      setSuccess(true);
      setSubject("");
      setDescription("");
      setType("");
      setSubType("");
      fetchStudentTickets(studentId);
    } catch (err) {
      alert("❌ Ticket submission failed");
    } finally {
      setLoading(false);
    }
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
      <LeftSidebar role="Student" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4">
              <h2 className="text-primary mb-2">Support Ticket Portal</h2>
              <p className="text-muted mb-0">View your previous queries and raise a new one.</p>
            </div>

            <div className="row">
              <div className="col-lg-7 mb-4">
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Your Submitted Tickets</h5>
                  </div>
                  <div className="card-body">
                    {tickets.length === 0 ? (
                      <p className="text-muted">You haven't submitted any tickets yet.</p>
                    ) : (
                      <div className="list-group">
                        {tickets
                          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                          .map((ticket) => (
                            <div key={ticket.id} className="list-group-item list-group-item-action flex-column align-items-start">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1 text-primary">{ticket.subject}</h6>
                                <small className={`badge badge-${ticket.status === "Resolved" ? "success" : ticket.status === "Closed" ? "secondary" : "warning"}`}>{ticket.status}</small>
                              </div>
                              <small className="text-muted">{new Date(ticket.startDate).toLocaleString()}</small>
                              <p className="mb-1">{ticket.description}</p>
                              <small className="text-muted">Type: {ticket.type} → {ticket.subType}</small>
                              {ticket.adminComment && (
                                <div className="mt-2 text-info"><strong>Admin:</strong> {ticket.adminComment}</div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">Raise a New Ticket</h5>
                  </div>
                  <div className="card-body">
                    {success && <div className="alert alert-success">✅ Ticket submitted successfully!</div>}
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label>Subject</label>
                        <input
                          type="text"
                          className="form-control"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        ></textarea>
                      </div>

                      <div className="form-group">
                        <label>Type</label>
                        <select
                          className="form-control"
                          value={type}
                          onChange={(e) => {
                            setType(e.target.value);
                            setSubType("");
                          }}
                          required
                        >
                          <option value="">-- Select Type --</option>
                          {Object.keys(typeOptions).map((t, idx) => (
                            <option key={idx} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {type && (
                        <div className="form-group">
                          <label>Sub Type</label>
                          <select
                            className="form-control"
                            value={subType}
                            onChange={(e) => setSubType(e.target.value)}
                            required
                          >
                            <option value="">-- Select SubType --</option>
                            {typeOptions[type].map((sub, i) => (
                              <option key={i} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button type="submit" className="btn btn-info btn-block">
                        Submit Ticket
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
         
      </div>
    </div>
  );
};

export default SubmitTicket;
