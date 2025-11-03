import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import API_BASE_URL from "../../config";

function DiscussionForum() {
  const location = useLocation();
  const navigate = useNavigate();
  const examinationId = location.state?.examinationId;

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (examinationId) {
      fetch(`${API_BASE_URL}/Course/GetDiscussionForumList/${examinationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setDiscussions(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching discussion forum:", err);
          setLoading(false);
        });
    }
  }, [examinationId]);

  const handleViewClick = (dId) => {
    navigate("/viewdiscussions", { state: { dId } });
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
      
      <div className="section-wrapper">
      <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
        <div className="container-fluid">

          {/* Header */}
          <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
            <div className="d-flex justify-content-between align-items-center mb-0">
              <div style={{ width: "100px" }}></div>
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                Discussions
              </h2>
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline-primary mt-3 mt-md-0"
              >
                <i className="fa fa-arrow-left mr-1"></i> Back
              </button>
            </div>
            <p className="text-muted mb-0 dashboard-hero-sub">
              View discussion threads for this course.
            </p>
          </div>


          {/* Content */}
          {loading ? (
            <div className="text-center text-muted">Loading...</div>
          ) : discussions.length === 0 ? (
            <div className="text-center text-muted">No discussion threads found.</div>
          ) : (
            <div className="discussion-list">
              {discussions.map((thread) => (
                <div
                  key={thread.dId}
                  className="d-flex flex-row align-items-start justify-content-between p-4 mb-3 bg-white shadow-sm" style={{ borderRadius: "20px", border: "1px solid #ccc" }}
                >
                  <div className="d-flex align-items-start" style={{ flex: 1 }}>
                  {/* Icon bubble */}
                  
                    {/* <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        // backgroundColor: "#e6f4f9", 
                        color: "#5a67d8", // blue icon
                        fontSize: "18px"
                      }}
                    >
                    
                    </div> */}
                  


                    {/* Main content */}
                    <div style={{ flex: 1 }}>
                      <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "18px", fontWeight: "bold" }}>
                        {thread.threadTitle}
                        <span className="badge bg-light text-dark border ms-2 ml-2">Discussion</span>
                      </h6>
                      <p className="mb-2 text-muted">
                       <i className="fa fa-book me-2 text-primary mr-2"></i>
                        Unit-{thread.threadContent}
                      </p>
                      {/* <div className="text-muted small mb-1">
                        <i className="fa fa-calendar text-primary me-2 mr-2"></i>
                        {new Date(thread.openDate).toLocaleDateString()} | {new Date(thread.openDate).toLocaleTimeString()}
                      </div> */}
                      {/* <div className="text-muted small mb-1">
                        <i className="fa fa-clock text-primary me-2 mr-2"></i>
                        {new Date(thread.closeDate).toLocaleDateString()} | {new Date(thread.closeDate).toLocaleTimeString()}
                      </div> */}
                      <div className="text-muted small">
                        <i className="fa fa-comment text-primary me-2 mr-2"></i>
                        {thread.comments} comment{thread.comments !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="ms-3">
                    <button
                      className="btn"
                      style={{
                        backgroundColor: "#5a67d8",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "10px",
                        padding: "8px 20px"
                      }}
                      onClick={() => handleViewClick(thread.dId)}
                    >
                      VIEW
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
         
      </div>
      </div>

      
    </div>
  );
}

export default DiscussionForum;
