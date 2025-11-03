import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import EmailList from "../components/email/EmailList";

function AppEmail() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="row clearfix">
              <div className="col-lg-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="page-title">Inbox</h4>
                  <ul className="nav nav-tabs page-header-tab">
                    <li className="nav-item"><a className="nav-link active" data-toggle="tab" href="#primary">Primary</a></li>
                    <li className="nav-item"><a className="nav-link" data-toggle="tab" href="#social">Social</a></li>
                    <li className="nav-item"><a className="nav-link" data-toggle="tab" href="#updates">Updates</a></li>
                  </ul>
                </div>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="primary">
                    <EmailList />
                  </div>
                  <div className="tab-pane fade" id="social">
                    <div className="alert alert-info">No social messages yet.</div>
                  </div>
                  <div className="tab-pane fade" id="updates">
                    <div className="alert alert-info">No updates to show.</div>
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

export default AppEmail;
