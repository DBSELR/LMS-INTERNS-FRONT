import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import TicketStatusBadge from "../../../components/supportTickets/TicketStatusBadge";
import TicketForm from "../../../components/supportTickets/TicketForm";
import HeaderTop from "../../../components/HeaderTop";
import LeftSidebar from "../../../components/LeftSidebar";
import RightSidebar from "../../../components/RightSidebar";
import Footer from "../../../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../../config";

const StudentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [remark, setRemark] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded?.UserId || decoded?.userId || decoded?.nameid;
        if (id) {
          setStudentId(id);
          fetchStudentTickets(id);
        } else {
          console.warn("Student ID missing in token.");
        }
      } catch (e) {
        console.error("Token decode error:", e);
      }
    }
  }, []);

  const fetchStudentTickets = async (id) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/SupportTicket/Student/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch student tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketHistory = async (ticketId) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/SupportTicket/GetLogHistoryByTicketId/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setTicketHistory(data || []);
    } catch (error) {
      console.error("Failed to fetch ticket history", error);
      setTicketHistory([]);
    }
  };

  const handleView = async (ticket, e) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
    setShowViewModal(true);
    await fetchTicketHistory(ticket.ticketId);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedTicket(null);
    setRemark("");
    setAttachment(null);
    setTicketHistory([]);
  };

  const handleCloseNewModal = () => setShowNewModal(false);

  const logTicketHistory = async () => {
    if (!selectedTicket) return;

    const token = localStorage.getItem("jwt");
    if (!token) return alert("Authentication token missing");

    try {
      const formData = new FormData();
      formData.append("ticketId", selectedTicket.ticketId);
      formData.append("actionTaken", remark);
      formData.append("performedBy", studentId);
      formData.append("comment", "");
      if (attachment) formData.append("attachment", attachment);

      const response = await fetch(
        `${API_BASE_URL}/SupportTicket/LogTicketHistory`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await response.json();
      if (response.ok) {
        toast.success("Message sent successfully");
        setRemark("");
        setAttachment(null);
        await fetchTicketHistory(selectedTicket.ticketId);
      } else {
        const errorMessages = Object.entries(result.errors || {})
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n");
        toast.error("Validation failed:\n" + errorMessages);
      }
    } catch (error) {
      console.error("Unexpected error logging message:", error);
      toast.error("Unexpected error occurred.");
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />
      
      <div className="section-wrapper">
           <div className="page admin-dashboard pt-0">
           <div className="section-body mt-3 pt-0">
            <div className="container-fluid">
              <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
          <h2 className="page-title text-primary pt-0 dashboard-hero-title">
            <i className="fa fa-headset"></i> Support Tickets
          </h2>
          <p className="text-muted mb-0 dashboard-hero-sub">
            View and manage your Support Tickets
          </p>
        </div>
            </div>
           </div>

        <div className="d-flex flex-row justify-content-end mb-3">
          <button
            className="btn btn-dark"
            onClick={() => setShowNewModal(true)}
          >
            <i className="fa fa-plus mr-2"></i>New Ticket
          </button>
        </div>

        <div className="table-responsive">
          {loading ? (
            <p>Loading tickets...</p>
          ) : (
            <table className="table table-bordered table-hover">
              <thead className="thead-light">
                <tr>
                  <th>TICKET #ID</th>
                  <th>TICKET SUBJECT</th>
                  <th>TYPE</th>
                  <th>SUB-TYPE</th>
                  <th>START DATE</th>
                  <th>STATUS</th>
                  <th>VIEW</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="text-primary font-weight-bold">
                        {ticket.ticketId}
                      </td>
                      <td>{ticket.subject}</td>
                      <td>{ticket.type}</td>
                      <td>{ticket.subType}</td>
                      <td>{new Date(ticket.startDate).toLocaleDateString()}</td>
                      <td>
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          onClick={(e) => handleView(ticket, e)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No tickets found. Please create a new ticket.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
         
      </div>
      </div>

      {/* View Ticket Modal */}
      <Modal
        show={showViewModal}
        onHide={handleCloseViewModal}
        size="xl"
        centered
        id="ticket-main-box"
      >
        <ToastContainer
          position="bottom-center"
          autoClose={2000}
          hideProgressBar
        />
        <Modal.Header className="m-0 p-3">
          <Modal.Title><i className="fa fa-ticket me-2"></i>{" "}Ticket Details</Modal.Title>
          <button
                    type="button"
                    className="close"
                    onClick={handleCloseViewModal}
                  >
                    <span>&times;</span>
                  </button>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div className="row">
              {/* Ticket Info */}
              <div className="col-md-8">
                <div className="card p-4 shadow-sm mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6>Ticket ID : {selectedTicket.ticketId}</h6>
                    </div>
                    <div>
                      <TicketStatusBadge status={selectedTicket.status} />
                    </div>
                  </div>
                  <h4 className="mb-3 text-primary">
                    {selectedTicket.subject}
                  </h4>
                  <div className="mb-2">
                    <strong>Type:</strong> {selectedTicket.type} -{" "}
                    {selectedTicket.subType}
                  </div>
                  <div className="mb-2">
                    <strong>Start Date:</strong>{" "}
                    {new Date(selectedTicket.startDate).toLocaleDateString()}
                  </div>
                  <div className="mb-2">
                    <strong>Description:</strong>{" "}
                    <p>{selectedTicket.description}</p>
                  </div>
                  <div className="mb-2">
                    <strong>Assigned By:</strong> {selectedTicket.assignedBy}
                  </div>
                  <div className="mb-2">
                    <strong>Assigned To:</strong> {selectedTicket.assignedTo}
                  </div>
                </div>
              </div>

              {/* Chat UI */}
              <div className="col-md-4">
                <div className="chat-wrapper shadow-sm d-flex flex-column">
                  <div
                    className="chat-header d-flex justify-content-between align-items-center "
                    id="ticket-head"
                  >
                    <span>
                      <i className="fa fa-ticket me-2"></i>{" "}
                      Ticket Chat
                    </span>
                    
                  </div>
                  <div
                    className="chat-body"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                  >
                    {ticketHistory.length > 0 ? (
                      ticketHistory.map((entry, index) => {
                        const isMe =
                          String(entry.performedBy) === String(studentId);
                        return (
                          <div
                            key={index}
                            className={`chat-bubble ${
                              isMe ? "sent" : "received"
                            }`}
                          >
                            <div className="sender small font-weight-bold mb-1">
                              {entry.user || (isMe ? "You" : "Staff")}
                            </div>
                            <div>{entry.actionTaken || "No message"}</div>
                            {entry.attachmentUrl && (
                              <div className="mt-2">
                                📎{" "}
                                <a
                                  href={`http://localhost:5129${entry.attachmentUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-white"
                                >
                                  Attachment
                                </a>
                              </div>
                            )}
                            <div className="timestamp small mt-1 text-end">
                              {new Date(entry.actionDate).toLocaleString()}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-white text-center">
                        No history available.
                      </p>
                    )}
                  </div>

                  <div className="chat-footer">
                    <textarea
                      rows={1}
                      placeholder="Send a Message"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          logTicketHistory();
                        }
                      }}
                    />
                    <label htmlFor="file-upload" className="attachment-label">
                      <i className="fa fa-paperclip" />
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={(e) => setAttachment(e.target.files[0])}
                    />
                    <button className="send-button" onClick={logTicketHistory}>
                      <i className="fa fa-paper-plane" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* New Ticket Modal */}
      <Modal
        show={showNewModal}
        onHide={handleCloseNewModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Support Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TicketForm role="student" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseNewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StudentTickets;
