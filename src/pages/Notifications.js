// File: src/pages/Notifications.jsx
import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const decoded = jwtDecode(token);
      const id = decoded["UserId"] || decoded.userId || decoded.nameid;
      setUserId(id);
      fetchNotifications(id);
    }
  }, []);

  const fetchNotifications = async (id) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Notification/ByUser/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("jwt");
      await fetch(`${API_BASE_URL}/Notification/MarkAsRead/${notificationId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setNotifications((prev) => prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
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
      
      <div className="section-wrapper">
      <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
                          <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                           Latest Notifications
                          </h2>
                          <p className="text-muted mb-0 dashboard-hero-sub">
                            View your latest notifications and updates
                          </p>
                        </div>

            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Your Notifications</h5>
              </div>
              <div className="card-body">
                {notifications.length === 0 ? (
                  <p className="text-muted">You have no notifications.</p>
                ) : (
                  <ul className="list-group">
                    {notifications
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((notification) => (
                        <li
                          key={notification.notificationId}
                          className={`list-group-item d-flex justify-content-between align-items-start ${notification.isRead ? "" : "bg-light"}`}
                        >
                          <div>
                            <h6 className="text-dark mb-1">{notification.title || notification.notificationType}</h6>
                            <p className="mb-1">{notification.message}</p>
                            <small className="text-muted">{new Date(notification.createdAt).toLocaleString()}</small>
                          </div>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.notificationId)}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Mark as read
                            </button>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
         
      </div>
      </div>
    </div>
  );
};

export default Notifications;