// components/ComposeMessage.jsx
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";



function ComposeMessage({ onMessageSent }) {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [form, setForm] = useState({
    senderId: null,
    receiverId: "",
    subject: "",
    content: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    const decoded = jwtDecode(token);
    const userId = parseInt(decoded["UserId"] || decoded.userId || decoded.nameid);
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    setCurrentUserId(userId);
    setForm((prev) => ({ ...prev, senderId: userId }));

    fetch(`${API_BASE_URL}/user`, {
      method: "GET",
      headers: {
        
        "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (u) => (u.role === "Admin" || u.role === "Instructor") && u.userId !== userId
        );
        setUsers(filtered);
      })
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSend = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/message/send`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert("Message sent!");
        setForm((prev) => ({
          ...prev,
          receiverId: "",
          subject: "",
          content: ""
        }));
        if (onMessageSent) onMessageSent();
      } else {
        const err = await res.text();
        alert("Failed: " + err);
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  return (
    <div className="card p-4">
      <h5>Compose Message</h5>
      <div className="form-group">
        <label>To:</label>
        <select
          name="receiverId"
          value={form.receiverId}
          onChange={handleChange}
          className="form-control"
          required
        >
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.firstName || user.username} {user.lastName || ""}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Subject:</label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Message:</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          className="form-control"
          rows="5"
        ></textarea>
      </div>
      <button className="btn btn-primary" onClick={handleSend}>
        Send
      </button>
    </div>
  );
}

export default ComposeMessage;