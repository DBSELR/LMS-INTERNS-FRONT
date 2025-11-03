import React from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import CentreList from "../components/centres/CentreList";
import API_BASE_URL from "../config";

function OurCentres() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper">
        <div className="loader"></div>
      </div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        {/* Page Header */}
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Our Centres</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Centres</li>
                </ol>
              </div>
              <button className="btn btn-primary">
                <i className="fa fa-plus mr-2"></i> Add New Centre
              </button>
            </div>
          </div>
        </div>

        {/* Centre List Content */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            <CentreList />
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default OurCentres;
