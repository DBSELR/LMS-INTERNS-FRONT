import React from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";

function PageEmpty() {
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
                <h1 className="page-title">Page Empty</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Empty</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="text-center">
              <h4>Stater Page</h4>
              <p>This is a blank page layout. Customize it as per your requirements.</p>
            </div>
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default PageEmpty;
