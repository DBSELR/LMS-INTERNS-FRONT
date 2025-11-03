import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../../config";

const TicketForm = ({ role }) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [subType, setSubType] = useState("");
  const [success, setSuccess] = useState(false);
  const [remark, setRemark] = useState("");
  const [attachment, setAttachment] = useState(null);

  // New Ticket Types and Subtypes
  const typeOptions = {
    "Profile Update": [
      "ID card",
      "Change Mobile Number",
      "Change Email ID",
      "Add/Update Address",
      "Name Correction/Update",
    ],
    "General Query": [
      "Support contact Details",
      "Specialization/Elective subject change request",
      "Batch Change",
      "Telegram Link",
      "LMS Walkthrough Request",
      "Course Change",
    ],
    "Assignments": [
      "Assignment deadline",
      "Assignment Information",
      "Assignment submission process",
      "Assignment submitted but not reflecting",
      "Proof of Delivery for assignments",
      "Resend the circular/links for assignments",
    ],
    "Exams": [
      "Exam fees Query",
      "Tentative exam date",
      "Exam tech issues",
      "Exam Re-schedule request",
      "Exam Login credentials not received",
      "Exam Form Issues",
      "Viva exam query",
    ],
    "Fee query": [
      "Fees Due",
      "LMS Blocked",
      "Fee link",
      "Course Fees Queries",
      "Fees Paid but not reflecting",
      "Payment receipt download",
      "Payment/amount related query",
      "EMI related query",
      "Fee deducted multiple times",
      "Fee Payment Issue",
    ],
    "Live Lecture": [
      "Live Session schedule",
      "LINK not working",
      "Session recording related",
      "Faculty Feedback",
      "Notification/Communication",
    ],
    "Cancellation/Refunds": [
      "Cancel admission and request refund",
      "Refund not received",
      "Cancellation Documents",
      "Cancel admission and loan closure",
      "Incorrect amount refunded",
      "Other Refund Related query",
      "Excess Fee refund",
    ],
    "Results Online": [
      "Tentative Result declaration date",
      "Correction in Result",
      "Result related queries",
      "Transcripts",
      "Backlog category",
      "Error / Unable to check result online",
    ],
    "Degree Certificates/Marksheet": [
      "Degree Certificate not received",
      "Marksheet not received",
      "Correction in Degree / marksheet",
      "Extra Certification courses certificate",
      "Migration Certificate",
      "PDC",
    ],
    "Referral": [
      "Referral Pending",
      "Require TAT",
      "Cash back Voucher",
    ],
    "LAB/Project query": [
      "LAB related queries",
      "Project related queries",
    ],
    "Mentor call back request": [
      "SRO Call back",
    ],
    "Discussion Forum": [
      "Not visible",
      "Not available",
      "No access to comment",
      "Grade query",
    ],
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setSuccess(true);
  //   setSubject("");
  //   setDescription("");
  //   setType("");
  //   setSubType("");
  //   setRemark("");
  //   setAttachment(null);
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

const token = localStorage.getItem("jwt");

  if (!token || typeof token !== "string") {
    alert("User not authenticated. Please log in again.");
    return;
  }

  let studentId;
  try {
    const decoded = jwtDecode(token);
    studentId = decoded?.UserId || decoded?.userId || decoded?.nameid;

    if (!studentId) {
      alert("User ID missing in token. Please log in again.");
      return;
    }
  } catch (error) {
    console.error("Token decode error:", error);
    alert("Invalid token. Please log in again.");
    return;
  }

  // const decodedToken = jwtDecode(token);
  // const studentId = decodedToken?.UserId;

  const formData = new FormData();
  formData.append("StudentId", studentId);
  formData.append("Subject", subject);
  formData.append("description", description);
  formData.append("Type", type);
  formData.append("SubType", subType);

  // Only attach file if it's selected
  if (attachment) {
    formData.append("file", attachment);
  }

  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${API_BASE_URL}/SupportTicket/CreateTicket`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(errMsg || "Failed to submit ticket");
    }

    const data = await response.json();
    console.log("Ticket Created:", data);
    setSuccess(true);

    // Reset form
    setSubject("");
    setDescription("");
    setType("");
    setSubType("");
    setRemark("");
    setAttachment(null);
  } catch (error) {
    console.error("Error submitting ticket:", error);
    alert("Error submitting ticket: " + error.message);
  }
};

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">{role === "student" ? "Submit New Ticket" : "Ticket Form"}</h5>
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
            <label>Ticket Type</label>
            <select
              className="form-control"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setSubType("");
              }}
              required
            >
              <option value="">-- Select Ticket Type --</option>
              {Object.keys(typeOptions).map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {type && (
            <div className="form-group">
              <label>Ticket Sub Type</label>
              <select
                className="form-control"
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                required
              >
                <option value="">-- Select Sub Ticket Type --</option>
                {typeOptions[type].map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <hr />
          {/* <h6 className="mb-3">Add Your Remark</h6>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            ></textarea>
          </div> */}
          <div className="form-group">
            <label className="d-block">Add Attachment :</label>
            <input
              type="file"
              className="form-control-file"
              onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <button type="submit" className="btn btn-primary mt-2">Submit Ticket</button>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
