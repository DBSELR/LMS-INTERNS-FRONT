import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import SocialMediaCard from "../components/social/SocialMediaCard";
import EngagedUserCharts from "../components/social/EngagedUserCharts";
import EmailCampaignTable from "../components/social/EmailCampaignTable";

function AppSocial() {
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
              <div className="header-action">
                <h1 className="page-title">Social Media</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Social</li>
                </ol>
              </div>
              <ul className="nav nav-tabs page-header-tab">
                <li className="nav-item"><a className="nav-link active" data-toggle="tab" href="#social">Social</a></li>
                <li className="nav-item"><a className="nav-link" data-toggle="tab" href="#campaign">Campaign</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="tab-content">
              {/* Social Tab */}
              <div className="tab-pane fade show active" id="social">
                <SocialMediaCard />
                <EngagedUserCharts />
              </div>

              {/* Campaign Tab */}
              <div className="tab-pane fade" id="campaign">
                <EmailCampaignTable />
              </div>
            </div>
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default AppSocial;
