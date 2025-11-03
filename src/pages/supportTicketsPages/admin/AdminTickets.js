import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import TicketStatusBadge from "../../../components/supportTickets/TicketStatusBadge";
import HeaderTop from "../../../components/HeaderTop";
import LeftSidebar from "../../../components/LeftSidebar";
import RightSidebar from "../../../components/RightSidebar";
import Footer from "../../../components/Footer";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../../config";

const AdminTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded?.UserId || decoded?.userId || decoded?.nameid;
        if (id) {
          setUserId(id);
          fetchAdminTickets(id);
        }
      } catch (e) {
        console.error("Token decode error:", e);
      }
    }
  }, []);

  const callStudent = async (toPhoneNumberRaw) => {
    const toPhoneNumber = toPhoneNumberRaw?.trim();
    if (!toPhoneNumber) return alert("Invalid student phone number");

    const apiKey = "ee7937a70341c348d86698020fde0c8b7faf795d798cfed4";
    const apiToken = "2d01647385cd591d5d7ae5e18fa0719e2159d2116e6615a5";
    const authHeader = btoa(`${apiKey}:${apiToken}`);

    const formData = new URLSearchParams();
    formData.append("From", "8099687675");
    formData.append("To", toPhoneNumber);
    formData.append("CallerId", "09513886363");
    formData.append("CallType", "trans");
    formData.append("Record", "true");
    formData.append("RecordingChannels", "dual");

    try {
      const response = await fetch(
        "https://api.exotel.com/v1/Accounts/dbasesolutions1/Calls/connect.json",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(`📞 Call initiated to ${toPhoneNumber}`);
      } else {
        alert(
          `Call failed: ${data?.RestException?.Message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error calling student:", error);
      alert("Unexpected error while initiating call.");
    }
  };

  const fetchAdminTickets = async (id) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/SupportTicket/GetStudentTicketsById/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setTickets(data || []);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
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
    setStatus(ticket.status);
    setShowModal(true);
    await fetchTicketHistory(ticket.ticketId);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setRemark("");
    setAttachment(null);
    setTicketHistory([]);
  };

  const handleStatusUpdate = (newStatus) => {
    setStatus(newStatus);
    toast.info(`Ticket status updated to: ${newStatus}`);
  };

  const logTicketHistory = async () => {
    const token = localStorage.getItem("jwt");
    if (!token || !selectedTicket)
      return toast.error("Authentication or ticket missing");

    try {
      const formData = new FormData();
      formData.append("ticketId", selectedTicket.ticketId);
      formData.append("actionTaken", remark);
      formData.append("performedBy", userId);
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
        toast.success("Message sent successfully.");
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
      console.error("Log error:", error);
      toast.error("Unexpected error occurred.");
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />
      <div className="page mt-4">
        <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4 welcome-card animate-welcome">
          <h2 className="page-title text-primary">
            <i className="fa-solid fa-headset"></i> All Support Tickets
          </h2>
          <p className="text-muted mb-0">View and manage all support tickets</p>
        </div>

        <div className="table-responsive">
          {loading ? (
            <p>Loading tickets...</p>
          ) : (
            <table className="table table-bordered table-hover">
              <thead className="thead-light">
                <tr>
                  <th>TICKET #ID</th>
                  <th>SUBJECT</th>
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
                    <tr key={ticket.ticketId}>
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
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
         
      </div>

      {/* View Modal */}

      <Modal
        show={showModal}
        onHide={handleClose}
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
          <Modal.Title>Ticket Details</Modal.Title>
          <button
                    type="button"
                    className="close"
                    onClick={handleClose}
                  >
                    <span>&times;</span>
                  </button>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div className="row">
              {/* Left Column - Ticket Details */}
              <div className="col-md-8">
                <div className="card p-4 shadow-sm mb-4">
                  <div
                    className="d-flex justify-content-between align-items-center mb-3"
                    id="ticket-left-box"
                  >
                    <div>
                      <h6 className="m-3">
                        Ticket ID : {selectedTicket.ticketId}
                      </h6>
                    </div>
                    <div>
                      <h6 className=" m-3">
                        Status : <TicketStatusBadge status={status} />
                      </h6>
                    </div>
                  </div>
                  <h4 className="mb-3 text-primary">
                    {selectedTicket.subject}
                  </h4>
                  <div className="mb-3">
                    <strong>Type:</strong> {selectedTicket.type} -{" "}
                    {selectedTicket.subType}
                  </div>
                  <div className="mb-3">
                    <strong>Start Date:</strong>{" "}
                    {new Date(selectedTicket.startDate).toLocaleDateString()}
                  </div>
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p>{selectedTicket.description}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Assigned By:</strong> {selectedTicket.assignedBy}
                  </div>
                  <div className="mb-3">
                    <strong>Assigned To:</strong> {selectedTicket.assignedTo}
                  </div>
                  <hr />
                  <div className="text-center">
                    <h6 className="mt-3">Update Ticket Status</h6>
                    <button
                      className="btn btn-warning m-1"
                      onClick={() => handleStatusUpdate("Ongoing")}
                    >
                      Ongoing
                    </button>
                    <button
                      className="btn btn-success m-1"
                      onClick={() => handleStatusUpdate("Resolved")}
                    >
                      Mark as Resolved
                    </button>
                    <button
                      className="btn btn-secondary m-1"
                      onClick={() => handleStatusUpdate("Closed")}
                    >
                      Close Ticket
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Chat */}
              <div className="col-md-4 col-12">
                <div className="chat-wrapper shadow-sm d-flex flex-column">
                  <div
                    className="chat-header d-flex justify-content-between align-items-center "
                    id="ticket-head"
                  >
                    <span>
                      <i className="fa fa-user-circle me-2"></i>{" "}
                      {selectedTicket.assignedBy}
                    </span>
                    {/* <div>
                      <i className="fa fa-video-camera me-3"></i>
                      <i
                        className="fa fa-phone"
                        onClick={() => callStudent(selectedTicket?.phoneNumber)}
                        style={{ cursor: "pointer" }}
                      ></i>
                    </div> */}
                  </div>

                  <div
                    className="chat-body"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                  >
                    {ticketHistory.length > 0 ? (
                      ticketHistory.map((entry, index) => {
                        const isInstructor =
                          String(entry.performedBy) === String(userId);
                        return (
                          <div
                            key={index}
                            className={`chat-bubble ${
                              isInstructor ? "sent" : "received"
                            }`}
                          >
                            <div className="sender small font-weight-bold mb-1">
                              {entry.user || (isInstructor ? "You" : "Other")}
                            </div>

                            <div>{entry.actionTaken || "No message"}</div>

                            {entry.attachmentUrl && (
                              <div className="mt-2">
                                📎{" "}
                                <a
                                  href={`http://localhost:5129${entry.attachmentUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-white"
                                >
                                  Attachment
                                </a>
                              </div>
                            )}

                            {/* ✅ Timestamp added here */}
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
    </div>
  );
};

export default AdminTickets;
