import React from "react";
import StaffTable from "../components/staff/StaffTable";
import AddStaff from "../components/staff/AddStaff"; // Import AddStaff component
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import API_BASE_URL from "../config";

function StaffPage() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="page-title">Staff</h1>
              <ol className="breadcrumb page-breadcrumb">
                <li className="breadcrumb-item">
                  <a href="#">LMS</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Staff
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="section-body mt-4">
          <div className="container-fluid">
            <ul className="nav nav-tabs page-header-tab">
              <li className="nav-item">
                <a className="nav-link active" data-toggle="tab" href="#staff-all">
                  List View
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-toggle="tab" href="#staff-add">
                  Add Staff
                </a>
              </li>
            </ul>

            <div className="tab-content">
              <div className="tab-pane active" id="staff-all">
                <StaffTable />
              </div>
              <div className="tab-pane" id="staff-add">
                <AddStaff />  {/* Add the Add Staff form here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffPage;
