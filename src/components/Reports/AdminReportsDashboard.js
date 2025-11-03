import React, { useState } from "react";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import { FaFileAlt } from "react-icons/fa";
import API_BASE_URL from "../../config";

// Report modules
import ReportsAdmission from "./ReportsStudentAdmission";
import ReportsFeeDetails from "./ReportsFeeDetails";
import ReportsFacultyDetails from "./ReportsFacultyDetails";

function AdminReportsDashboard() {
  const [activeTab, setActiveTab] = useState("admission");

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="section-wrapper">
        <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <div>
                <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                  <i class="fa-solid fa-file"></i> Reports Dashboard
                </h2>
                <p className="text-muted mb-0 dashboard-hero-sub">
                  Analyze student, faculty, and fee information here.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-body mt-2">
          <div className="container-fluid">
            <div className="card shadow-sm ">
              <div className="card-header bg-primary text-white d-flex align-items-center">
                <FaFileAlt className="mr-2 mt-2" />
                <h6 className="mb-0">Reports</h6>
              </div>

              <div className="card-body">
                <ul className="nav nav-tabs px-3" style={{ borderBottom: "2px solid #ddd" }}>
                  <li className="nav-item">
                    <a
                      className={`nav-link fw-bold text-dark border-0 ${activeTab === "admission" ? "active" : ""}`}
                      onClick={() => setActiveTab("admission")}
                      style={activeTab === "admission" ? { borderBottom: "3px solid #5a67d8" } : {}}
                    >
                      Admission Details
                    </a>
                  </li>
                  {/* <li className="nav-item">
                    <a
                      className={`nav-link fw-bold text-dark border-0 ${activeTab === "fee" ? "active" : ""}`}
                      onClick={() => setActiveTab("fee")}
                      style={activeTab === "fee" ? { borderBottom: "3px solid #5a67d8" } : {}}
                    >
                      Fee Details
                    </a>
                  </li> */}
                  <li className="nav-item">
                    <a
                      className={`nav-link fw-bold text-dark border-0 ${activeTab === "faculty" ? "active" : ""}`}
                      onClick={() => setActiveTab("faculty")}
                      style={activeTab === "faculty" ? { borderBottom: "3px solid #5a67d8" } : {}}
                    >
                      Faculty Details
                    </a>
                  </li>
                </ul>

                <div className="reports-tabs-body">
                <div className="tab-content mt-0">
                  <div className={`tab-pane fade ${activeTab === "admission" ? "show active" : ""}`}>
                    <ReportsAdmission />
                  </div>
                  <div className={`tab-pane fade ${activeTab === "fee" ? "show active" : ""}`}>
                    <ReportsFeeDetails />
                  </div>
                  <div className={`tab-pane fade ${activeTab === "faculty" ? "show active" : ""}`}>
                    <ReportsFacultyDetails />
                  </div>
                </div>
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

export default AdminReportsDashboard;
