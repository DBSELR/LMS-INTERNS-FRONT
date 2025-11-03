import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import LeaveTable from "../components/leave/LeaveTable";

function Leave() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      {/* Loader */}
      <div className="page-loader-wrapper"><div className="loader" /></div>

      {/* Layout */}
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        {/* Header Section */}
        <div className="section-body mt-3">
          <div className="container-fluid">
            <div className="jumbotron bg-light p-4 rounded shadow-sm d-flex justify-content-between align-items-center flex-wrap mb-4">
              <div>
                <h2 className="text-primary mb-2">Leave Management</h2>
                <p className="text-muted mb-0">Track and manage all leave requests easily.</p>
              </div>
              <ol className="breadcrumb bg-transparent p-0 m-0 mt-3 mt-md-0">
                <li className="breadcrumb-item">
                  <a href="#" className="text-secondary">LMS</a>
                </li>
                <li className="breadcrumb-item active text-dark">Leave</li>
              </ol>
            </div>

            {/* Export Button */}
            <div className="mb-4 d-flex justify-content-end">
              <button className="btn btn-primary">
                <i className="fa fa-download mr-2"></i> Export Excel
              </button>
            </div>

            {/* Leave Table Card */}
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white d-flex align-items-center">
                <i className="fa fa-calendar mr-2"></i>
                <h6 className="mb-0">Leave Requests</h6>
              </div>
              <div className="card-body p-4">
                <LeaveTable />
              </div>
            </div>

          </div>
        </div>

         
      </div>
    </div>
  );
}

export default Leave;
