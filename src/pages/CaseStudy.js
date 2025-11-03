import React, { useState, useEffect } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";


function CaseStudy() {
  const navigate = useNavigate();


  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />
      
      <div className="section-wrapper">
      <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">

     <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
            <div className="d-flex justify-content-between align-items-center mb-0">
              <div style={{ width: "100px" }}></div>
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">
                Case Study
              </h2>
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline-primary mt-3 mt-md-0"
              >
                <i className="fa fa-arrow-left mr-1"></i> Back
              </button>
            </div>
            <p className="text-muted mb-0 dashboard-hero-sub">
              Explore detailed case studies related to the course topics.
            </p>
          </div>
           </div>
        </div>
         
      </div>
      </div>
    </div>
  );
}

export default CaseStudy;
