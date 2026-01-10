import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { CreditCard, Clock, X, AlertTriangle, CheckCircle, HelpCircle, Calendar } from "lucide-react";
import "./InternshipFeeReminderPopup.css";

const InternshipFeeReminderPopup = () => {
  const [show, setShow] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [dueDate] = useState("20th January 2026"); // You can make this dynamic
  const [contactInfo] = useState("finance@example.com | +91-1234567890"); // You can make this dynamic

  // Watch for token changes in localStorage
  useEffect(() => {
    const checkToken = () => {
      const jwtToken = localStorage.getItem("jwt");
      if (jwtToken !== token) {
        // console.log("🔍 [FeePopup] Token changed, updating...");
        setToken(jwtToken);
        setHasChecked(false); // Reset check flag when token changes
      }
    };

    // Check immediately
    checkToken();

    // Check periodically (useful after login redirect)
    const interval = setInterval(checkToken, 500);

    // Listen for storage events (for cross-tab updates)
    window.addEventListener("storage", checkToken);

    // Cleanup after 5 seconds (stop checking once initialized)
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener("storage", checkToken);
    };
  }, [token]);

  useEffect(() => {
    // Skip if already checked or no token
    if (hasChecked || !token) {
      return;
    }

    try {
      const decoded = jwtDecode(token);

      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded.role ||
        decoded.Role;

      setUserRole(role);
      setHasChecked(true); // Mark as checked

      // Show popup only for students and if not dismissed
      if (role === "Student") {
        const dismissed = localStorage.getItem("feeReminderDismissed");
        const dismissedDate = localStorage.getItem("feeReminderDismissedDate");
        const today = new Date().toDateString();

        // Check if reminder was dismissed today
        if (dismissed !== "true" || dismissedDate !== today) {
          // Show popup after a short delay
          setTimeout(() => {
            setShow(true);
          }, 2000);
        }
      }
    } catch (err) {
      console.error("❌ [FeePopup] JWT decode error:", err);
      setHasChecked(true); // Mark as checked even on error to prevent infinite loops
    }
  }, [token, hasChecked]);

  const handlePayNow = () => {
    setShow(false);
    // Redirect to payment page or open payment modal
    window.location.href = "/fees/student"; // Update with your payment route
  };

  const handleRemindLater = () => {
    setShow(false);
    // Store dismissal in localStorage with current date
    const today = new Date().toDateString();
    localStorage.setItem("feeReminderDismissed", "true");
    localStorage.setItem("feeReminderDismissedDate", today);
  };

  const handleClose = () => {
    setShow(false);
    // Don't set dismissed flag when clicking X, so it shows again on next visit
  };

  // Don't render the modal if role is explicitly not a Student (but allow null during loading)
  if (userRole !== null && userRole !== "Student") {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="modern-fee-popup"
      backdrop="static"
      keyboard={false}
      size="lg"
    >
      <div className="popup-decorative-bg"></div>
      <button className="popup-close-btn" onClick={handleClose}>
        <X size={20} />
      </button>

      <div className="popup-content-wrapper">
        {/* Left Side - Visual */}
        <div className="popup-visual-section">
          <div className="visual-icon-container">
            <CreditCard size={48} className="visual-icon mb-3" />
            <div className="visual-circle-1"></div>
            <div className="visual-circle-2"></div>
          </div>
          <h3>Action Required</h3>
          <p>Internship Fee Payment</p>
        </div>

        {/* Right Side - Content */}
        <div className="popup-text-section">
          <div className="popup-header">
            <div className="header-icon-badge">
              <AlertTriangle size={24} />
            </div>

          </div>

          <div className="popup-body">
            <div className="info-card">
              <Calendar size={18} className="icon-highlight" />
              <div>
                <span className="label">Due Date</span>
                <span className="value">{dueDate}</span>
              </div>
            </div>

            <p className="message-text">
              This is a friendly reminder that your internship fee is pending.
              Please clear your dues to ensure a smooth internship experience.
            </p>

            <div className="action-buttons">
              <button className="btn-primary-action" onClick={handlePayNow}>
                <span className="btn-content">
                  Pay Now <CheckCircle size={18} />
                </span>
              </button>
              {/* <button className="btn-secondary-action" onClick={handleRemindLater}>
                <span className="btn-content">
                  Remind Me Later <Clock size={18} />
                </span>
              </button> */}
            </div>

            <div className="support-link">
              <HelpCircle size={14} />
              <span>
                Need help? Contact <span className="highlight-text">+91 8297 222 302</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InternshipFeeReminderPopup;
