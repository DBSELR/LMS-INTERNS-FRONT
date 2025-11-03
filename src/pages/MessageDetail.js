// components/MessageDetail.jsx
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

function MessageDetail({ message, onBack, onReplySent }) {
  const [reply, setReply] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!message.isRead) {
      fetch(`${API_BASE_URL}/message/MarkRead/${message.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        } 
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to mark as read");
        })
        .catch((err) => console.error("Mark read error:", err));
    }
  }, [message]);

  const handleReply = async () => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    const decoded = jwtDecode(token);
    const senderId = parseInt(decoded["UserId"] || decoded.userId || decoded.nameid);

    const replyMessage = {
      senderId,
      receiverId: message.senderId,
      subject: `RE: ${message.subject}`,
      content: reply
    };

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/message/Send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(replyMessage)
      });

      if (res.ok) {
        alert("Reply sent!");
        setReply("");
        onReplySent();
      } else {
        alert("Reply failed.");
      }
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <button className="btn btn-link mb-3" onClick={onBack}>
        ← Back to Inbox
      </button>

      <h5>{message.subject}</h5>
      <p className="text-muted">From: {message.senderName}</p>
      <p>{message.content}</p>

      <div className="form-group mt-4">
        <label>Reply</label>
        <textarea
          className="form-control"
          rows="4"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        ></textarea>
      </div>
      <button className="btn btn-primary" onClick={handleReply} disabled={!reply.trim()}>
        Send Reply
      </button>
    </div>
  );
}

export default MessageDetail;
