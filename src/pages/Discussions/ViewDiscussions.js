import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import API_BASE_URL from "../../config";

function ViewDiscussions() {
  const location = useLocation();
  const navigate = useNavigate();
  const dId = location.state?.dId;

  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isReplyOpen = () => {
    if (!discussion) return false;
    const now = new Date();
    const open = new Date(discussion.openDate);
    const close = new Date(discussion.closeDate);
    return now >= open && now <= close;
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (dId) {
      fetch(`${API_BASE_URL}/Course/GetDiscussionForumById/${dId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setDiscussion(data[0]))
        .catch((err) => console.error("❌ Error fetching discussion:", err));

      fetchReplies();
    }
  }, [dId]);

  const fetchReplies = () => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    fetch(`${API_BASE_URL}/Course/GetDiscussionForumRepliesById/${dId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => setReplies(data))
      .catch((err) => console.error("❌ Error fetching replies:", err));
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("You must be logged in to reply.");
      return;
    }

    let userId;
    try {
      const decoded = jwtDecode(token);
      userId = decoded?.UserId;
    } catch (err) {
      console.error("❌ Invalid token:", err);
      alert("Invalid session. Please login again.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      DId: dId,
      UserId: userId,
      ReplyContent: replyContent.trim(),
      AttachmentUrl: null,
    };

    fetch(`${API_BASE_URL}/Course/insertDiscussionreply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        setSuccessMsg("✅ Reply submitted successfully.");
        setReplyContent("");
        fetchReplies();
        setTimeout(() => setSuccessMsg(""), 3000);
      })
      .catch((err) => {
        console.error("❌ Error submitting reply:", err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const getReplyBoxStyle = (userId) => {
    if (typeof userId === "string" && userId.toLowerCase().includes("admin")) {
      return {
        backgroundColor: "#fff9e6",
        borderLeft: "4px solid #f4c430",
      };
    } else {
      return {
        backgroundColor: "#e6f4f9",
        borderLeft: "4px solid #1e88e5",
      };
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page section-body mt-3 instructor-course-page admin-dashboard pt-0">
        <div className="container-fluid">
          {/* Back Button */}
          <div className="d-flex justify-content-end mb-3">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-primary"
            >
              <i className="fa fa-arrow-left mr-1"></i> Back
            </button>
          </div>

          {/* Discussion Summary */}
          {discussion ? (
           <div
  className="card p-4 shadow-sm mb-4"
  style={{ borderRadius: "20px", border: "1px solid #ccc" }}
>
  {/* Title row with icon */}
  <h5
    className="fw-bold mb-2 d-flex align-items-center"
    style={{ fontSize: "18px", fontWeight: "bold" }}
  >
    <i className="fa fa-book text-primary me-2 mr-2" aria-hidden="true"></i>
    <span>{discussion.threadTitle}</span>
  </h5>

  {/* Content row with icon */}
  <p className="text-muted d-flex align-items-start mb-0">
    <i
      className="fa fa-list-ol text-secondary me-2 mr-2"
      style={{ fontSize: "0.9rem", marginTop: "2px" }}
      aria-hidden="true"
    ></i>
    <span>{discussion.threadContent}</span>
  </p>

  {/* Date block (still commented out) */}
  {/*
  <div className="text-muted small mb-1 mt-3">
    <i className="fa fa-calendar text-primary me-2 mr-2"></i>
    Open: {new Date(discussion.openDate).toLocaleString()}

    <i className="fa fa-clock me-2 text-primary ml-5 mr-2"></i>
    Close: {new Date(discussion.closeDate).toLocaleString()}
  </div>
  */}
</div>

          ) : (
            <p>Loading discussion...</p>
          )}

          {/* Combined Reply Section */}
          <div className="card p-4 shadow-sm mb-4">
            <h6 className="fw-bold mb-3">🗨️ Discussion Replies</h6>
            <div
              className="reply-thread mb-4"
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                paddingRight: "12px",
                scrollbarColor: "#ccc transparent",
                scrollbarWidth: "thin",
              }}
            >
              {replies.length > 0 ? (
                replies.map((reply) => (
                  <div key={reply.dRId} className="mb-3">
                    <div
                      className="rounded p-3 shadow-sm"
                      style={getReplyBoxStyle(reply.userId)}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>{reply.userId}</strong>
                        <span className="text-muted small">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-dark">{reply.replyContent}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No replies yet.</p>
              )}
            </div>

            {/* Reply Box */}
            {discussion  ? (
              <>
                <h6 className="fw-bold mb-2">💬 Leave a Reply</h6>
                <textarea
                  className="form-control mb-3"
                  rows="4"
                  placeholder="Write your reply here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  className="btn btn-dark px-4 py-2 rounded"
                  onClick={handleSubmitReply}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Reply"}
                </button>
                {successMsg && (
                  <div className="alert alert-success mt-3 mb-0" role="alert">
                    {successMsg}
                  </div>
                )}
              </>
            ) : discussion ? (
              <div className="alert alert-danger text-center mt-3 mb-0 rounded-pill shadow-sm py-2 px-3" style={{ fontSize: "14px" }}>
  <i className="fa fa-lock me-2 text-danger"></i> <strong>Reply window closed:</strong> You can no longer post replies for this discussion.
</div>

            ) : null}
          </div>
        </div>
      </div>

       
    </div>
  );
}

export default ViewDiscussions;
