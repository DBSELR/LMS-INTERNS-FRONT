import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import API_BASE_URL from "../../config";

function CourseDashboard() {
  const { courseId } = useParams();
  const [stats, setStats] = useState(null);
  const [liveClass, setLiveClass] = useState(null);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchLiveClass();
    fetchAssessment();
  }, [courseId]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Course/${courseId}/Stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchLiveClass = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/LiveClass/Upcoming/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setLiveClass(data);
    } catch (err) {
      console.error("Failed to fetch live class info", err);
    }
  };

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Assessment/Latest/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAssessment(data);
    } catch (err) {
      console.error("Failed to fetch assessment info", err);
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">
            <h4 className="text-primary font-weight-bold mb-4">Courseware</h4>
            <h5 className="mb-4">Web Technologies</h5>

            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-dark font-weight-bold mb-3">Courseware</h6>
                    <ul className="list-unstyled">
                      <li>📘 {stats?.learningActivityCount || 0} Learning Activity</li>
                      <li>📝 {stats?.assignmentCount || 0} Assignment</li>
                      <li>💬 {stats?.discussionCount || 0} Discussion</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-dark font-weight-bold mb-3">Live Class</h6>
                    <p className="text-muted">
                      {liveClass?.hasUpcoming
                        ? liveClass.message
                        : "No Live Class Scheduled For Upcoming Week"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="text-dark font-weight-bold mb-3">Continuous Assessment</h6>
                    <p className="text-muted">
                      {assessment?.hasNewAssessment
                        ? assessment.message
                        : "No New Assessment Updated"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
         
      </div>
    </div>
  );
}

export default CourseDashboard;
