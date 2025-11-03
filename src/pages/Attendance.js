import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import AttendanceTable from "../components/attendance/AttendanceTable";
import API_BASE_URL from "../config";

function Attendance() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        {/* Page Header */}
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Attendance</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Attendance</li>
                </ol>
              </div>
              <button className="btn btn-primary">
                <i className="fa fa-download mr-2"></i>Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            <AttendanceTable />
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default Attendance;
