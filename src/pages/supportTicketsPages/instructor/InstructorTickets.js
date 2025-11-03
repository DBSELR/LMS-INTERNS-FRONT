// ✅ Full & Final - InstructorTickets.js
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import TicketStatusBadge from "../../../components/supportTickets/TicketStatusBadge";
import HeaderTop from "../../../components/HeaderTop";
import LeftSidebar from "../../../components/LeftSidebar";
import RightSidebar from "../../../components/RightSidebar";
import Footer from "../../../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../../config";

const InstructorTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [remark, setRemark] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [userId, setUserId] = useState("");

  const [callHistory, setCallHistory] = useState([]);

  const [isCalling, setIsCalling] = useState(false);
  const [callModalVisible, setCallModalVisible] = useState(false);

  const [callStatus, setCallStatus] = useState(null); // stores "ringing", "in-progress", "completed"

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded?.UserId || decoded?.userId || decoded?.nameid;
        if (id) {
          setUserId(id);
          fetchStudentTickets(id);
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
        `${API_BASE_URL}/SupportTicket/GetStudentTicketsById/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setTickets(data || []);
      console.log("📋 Loaded tickets:", data);
      data.forEach((ticket, idx) => {
        console.log(`📞 Ticket ${idx + 1} phone:`, ticket.phoneNumber);
      });
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCallHistoryByTicketId = async (ticketId) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
       `${API_BASE_URL}/Exotel/GetcallrecordHistoryByTicketId/${ticketId}`,
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
      );
      const data = await res.json();
      setCallHistory(data || []);
      console.log("📞 Call History:", data);
    } catch (err) {
      console.error("Failed to fetch call history", err);
      setCallHistory([]);
    }
  };

  // Refresh chat every 2 seconds while modal is open
  useEffect(() => {
    if (!selectedTicket || !showModal) return;

    const interval = setInterval(() => {
      fetchTicketHistory(selectedTicket.ticketId);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedTicket, showModal]);

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
    await fetchCallHistoryByTicketId(ticket.ticketId); // 🔁 fetch call records
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
      toast.error("Authentication or ticket missing");
    return;

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

  const callStudent = async (toPhoneRaw, fromPhoneRaw) => {
    console.log("📍 Inside callStudent()");
    console.log("🧾 selectedTicket in callStudent:", selectedTicket);
    console.log("🆔 selectedTicket.ticketId:", selectedTicket?.ticketId);

    if (!toPhoneRaw || !fromPhoneRaw) {
      toast.error("⚠️ Phone number missing in ticket.");
      return;
    }

    const cleanedTo = toPhoneRaw.toString().replace(/\D/g, "").trim();
    const cleanedFrom = fromPhoneRaw.toString().replace(/\D/g, "").trim();

    console.log("📞 Cleaned Student Phone (To):", cleanedTo);
    console.log("📞 Cleaned SRO Phone (From):", cleanedFrom);

    if (cleanedTo.length !== 10 || cleanedFrom.length !== 10) {
      console.warn(
        "❌ Validation failed. Cleaned numbers:",
        cleanedTo,
        cleanedFrom
      );
      toast.error("⚠️ Phone numbers must be exactly 10 digits.");
      return;
    }

    try {
      setCallModalVisible(true);
      setIsCalling(true);
      setCallStatus("initiated");

      const payload = {
        From: cleanedFrom,
        To: cleanedTo,
        CallerId: "09513886363",
        CustomField: `${selectedTicket?.ticketId}`,
      };

      console.log("📤 Sending call request with payload:", payload);
      console.log("🔎 Confirm CustomField:", payload.CustomField);
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${API_BASE_URL}/Exotel/InitiateCall`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await res.text();
      let responseJson = null;

      try {
        responseJson = JSON.parse(responseText);
        console.log("✅ Response JSON:", responseJson);
      } catch (e) {
        console.warn("⚠️ Response not JSON:", responseText);
      }

      if (res.ok) {
        toast.success(`📞 Call initiated to ${cleanedTo}`);
        setCallStatus("in-progress");

        setTimeout(() => {
          setCallModalVisible(false);
          setCallStatus("completed");
        }, 30000); // Simulate 30s call duration
      } else {
        const errorMsg =
          responseJson?.RestException?.Message ||
          `Call failed with status ${res.status}: ${responseText}`;
        toast.error(`❌ ${errorMsg}`);
        setCallModalVisible(false);
      }
    } catch (error) {
      console.error("❌ Error while calling backend:", error);
      toast.error("❌ Could not initiate call. Server error.");
      setCallModalVisible(false);
    } finally {
      setIsCalling(false);
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket?.subject?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      ticket?.ticketId?.toString().includes(searchQuery)
  );

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />
      
      <div className="section-wrapper">
            <div className="page admin-dashboard pt-0">

        <div className="section-body mt-3 pt-0">
          <div className="container-fluid pl-0 pr-0">
               <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                <i class="fa-solid fa-headset"></i> Assigned Support Tickets
              </h2>
              <p className="text-muted mb-0 dashboard-hero-sub">
                View and respond to tickets assigned to you.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Ticket ID or Subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="thead-light">
              <tr>
                <th>TICKET #ID</th>
                <th>TICKET SUBJECT</th>
                <th>TYPE</th>
                <th>SUB-TYPE</th>
                <th>START DATE</th>
                <th>STATUS</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
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
                    {loading ? "Loading tickets..." : "No tickets found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
         
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

        <Modal.Header  className="m-0 p-3">
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

                    <button
                      className="btn btn-warning m-1"
                      onClick={() => handleStatusUpdate("Ongoing")}
                    >
                      Ongoing
                    </button>
                    {/* <button
                      className="btn btn-success m-1"
                      onClick={() => handleStatusUpdate("Resolved")}
                    >
                      Mark as Resolved
                    </button> */}
                    <button
                      className="btn btn-secondary m-1"
                      onClick={() => handleStatusUpdate("Closed")}
                    >
                      Close Ticket
                    </button>

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

                  <div
                    className="card mt-4 p-4 shadow-sm border-0"
                    style={{ background: "#f8f9fa", borderRadius: "10px" }}
                  >
                    <h5 className="text-primary mb-3">
                      <i className="fa fa-phone me-2 text-secondary"></i> Call
                      History
                    </h5>

                    {callHistory.length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {callHistory.map((call, index) => (
                          <li
                            className="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row"
                            key={index}
                            style={{
                              backgroundColor: "#fff",
                              border: "1px solid #e9ecef",
                              borderRadius: "6px",
                              marginBottom: "8px",
                            }}
                          >
                            <div className="me-md-3 mb-2 mb-md-0">
                              <div>
                                <strong>📅 Date:</strong>{" "}
                                {new Date(call.startTime).toLocaleDateString()}
                              </div>
                              <div>
                                <strong>🕒 Time:</strong>{" "}
                                {new Date(call.startTime).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="me-md-3 mb-2 mb-md-0">
                              <div>
                                <strong>⏱️ Duration:</strong>{" "}
                                <span className="badge bg-info text-white">
                                  {call.duration} sec
                                </span>
                              </div>
                            </div>
                            <div>
                              <strong>🎧 Recording:</strong>{" "}
                              {call.recordingUrl ? (
                                <audio controls style={{ width: "100%" }}>
                                  <source
                                    src={call.recordingUrl}
                                    type="audio/mpeg"
                                  />
                                  Your browser does not support the audio
                                  element.
                                </audio>
                              ) : (
                                <span className="text-muted">
                                  Not available
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted fst-italic">
                        No call records found for this ticket.
                      </p>
                    )}
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
                    <div>
                      {/* <i className="fa fa-video-camera me-3"></i> */}
                      <i
                        className="fa fa-phone"
                        onClick={() => {
                          console.log(
                            "🎯 Triggered direct call with ticket:",
                            selectedTicket
                          );
                          console.log("☎️ Full Ticket:", selectedTicket);
                          callStudent(
                            selectedTicket?.phoneNumber,
                            selectedTicket?.sroPhoneNumber
                          );
                        }}
                        style={{ cursor: "pointer" }}
                      ></i>
                    </div>
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

      {/* ✅ Calling Popup */}
      <Modal
        show={callModalVisible}
        onHide={() => setCallModalVisible(false)}
        centered
        backdrop="static"
        style={{ borderRadius: "20px" }}
      >
        <Modal.Header
          style={{
            background: "linear-gradient(to bottom right, #5a67d8, #f8ceec)",
            borderBottom: "none",
            justifyContent: "flex-end",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={() => setCallModalVisible(false)}
          ></button>
        </Modal.Header>

        <Modal.Body
          className="text-center p-5"
          style={{
            background: "linear-gradient(to bottom right, #5a67d8, #f8ceec)",
            color: "#fff",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
          }}
        >
          <h3>Calling...</h3>
          <h2 className="mt-2 fs-5">{selectedTicket?.assignedBy}</h2>
          <p className="mt-2 fs-5">{selectedTicket?.phoneNumber}</p>

          <div className="mt-4">
            <img
              src="/assets/default-avatar.png"
              alt="Calling..."
              style={{ width: "200px" }}
            />
          </div>

          <div className="spinner-border text-light mt-4" role="status">
            <span className="visually-hidden">...</span>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InstructorTickets;
