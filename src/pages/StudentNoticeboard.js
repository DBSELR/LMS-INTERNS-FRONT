// File: pages/StudentNoticeboard.jsx
import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function StudentNoticeboard() {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Notice`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error("Failed to fetch notices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

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
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">Noticeboard</h2>
              <p className="text-muted mb-0 dashboard-hero-sub">Browse the latest announcements and exam/event notices.</p>
            </div>

            {notices.length === 0 ? (
              <div className="text-center text-muted py-4">No notices available at this moment.</div>
            ) : (
              <div className="row">
                {notices.map((n) => (
                  <div className="col-md-6 mb-3" key={n.noticeId}>
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">{n.title}</h5>
                        <p className="text-muted small mb-2">{new Date(n.date).toLocaleDateString()}</p>
                        <p className="card-text">{n.description}</p>
                        {n.imageUrl && <img src={n.imageUrl} alt="notice" className="img-fluid mb-2" />}
                        {n.fileUrl && (
                          <a href={n.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                            Download Attachment
                          </a>
                        )}
                      </div>
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

export default StudentNoticeboard;
