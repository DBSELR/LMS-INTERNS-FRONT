// pages/InboxPage.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import ComposeMessage from "./ComposeMessage";
import MessageDetail from "./MessageDetail";
import API_BASE_URL from "../config";

function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessages = () => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const userId = decoded["UserId"] || decoded.userId || decoded.nameid;

      if (!userId) {
        console.warn("User ID missing in JWT");
        return;
      }

      fetch(`${API_BASE_URL}/message/inbox/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ Attach JWT token here
        },
      })
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error("Fetch error:", err))
        .finally(() => setLoading(false));
    } catch (err) {
      console.error("Invalid token", err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper">
        <div className="loader"></div>
      </div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
      
      <div className="section-wrapper">
      <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h1 className="page-title text-primary pt-0 dashboard-hero-title">Inbox</h1>
              <ol className="breadcrumb page-breadcrumb justify-content-center">
                <li className="breadcrumb-item mb-0 dashboard-hero-sub">
                  <a href="#">LMS</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Inbox
                </li>
              </ol>
            </div>

            <div className="text-right mb-3">
              <button
                className="btn btn-primary"
                onClick={() => setShowCompose(!showCompose)}
              >
                {showCompose ? "Close Compose" : "Compose Message"}
              </button>
            </div>

            {showCompose && (
              <div className="mb-4">
                <ComposeMessage onMessageSent={loadMessages} />
              </div>
            )}

            {selectedMessage && (
              <MessageDetail
                message={selectedMessage}
                onBack={() => setSelectedMessage(null)}
                onReplySent={loadMessages}
              />
            )}
          </div>
        </div>

        {!selectedMessage && (
          <div className="section-body mt-4">
            <div className="container-fluid">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex align-items-center">
                  <i className="fa fa-envelope mr-2"></i>
                  <h6 className="mb-0">Messages</h6>
                </div>

                <div className="card-body p-0">
                  {loading ? (
                    <div className="text-center py-5">Loading...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <h5>No messages available.</h5>
                    </div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {messages.map((msg) => (
                        <li
                          key={msg.id}
                          onClick={() => setSelectedMessage(msg)}
                          className={`list-group-item d-flex justify-content-between align-items-start ${msg.isRead ? "bg-light" : ""}`}
                          style={{ cursor: "pointer" }}
                        >
                          <div>
                            <h6 className="mb-1 text-primary">{msg.subject}</h6>
                            <p className="mb-1 text-muted" style={{ fontSize: "14px" }}>{msg.content}</p>
                            <small className="text-muted">From: {msg.senderName}</small>
                          </div>
                          <div className="text-right">
                            <small className="text-muted">{new Date(msg.sentAt).toLocaleString()}</small>
                            {!msg.isRead && (
                              <span className="badge badge-pill badge-danger ml-2">New</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

         
      </div>
      </div>
    </div>
  );
}

export default InboxPage;
