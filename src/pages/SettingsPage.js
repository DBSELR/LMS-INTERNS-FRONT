import React from "react";
import ThemeSettings from "../components/settings/ThemeSettings";
import ActivityTimeline from "../components/settings/ActivityTimeline";
import StorageProgress from "../components/settings/StorageProgress";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

function SettingsPage() {
  return (
    <div id="main_content" className="font-muli theme-blush">
    <div className="page-loader-wrapper"><div className="loader"></div></div>

    <HeaderTop />
    <RightSidebar />
    <LeftSidebar />

    <div className="page">
      <div className="section-body">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="page-title">Settings</h1>
            <ol className="breadcrumb page-breadcrumb">
              <li className="breadcrumb-item">
                <a href="#">LMS</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Settings
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="section-body mt-4">
        <div className="container-fluid">
          <div className="tab-content">
            <div className="tab-pane active show" id="Settings">
              <ThemeSettings />
              <ActivityTimeline />
              <StorageProgress />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default SettingsPage;
