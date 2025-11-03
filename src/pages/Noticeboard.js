import React from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import NoticeList from "../components/noticeboard/NoticeList";
import AddNoticeForm from "../components/noticeboard/AddNoticeForm";
import API_BASE_URL from "../config";

function Noticeboard() {
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
                <h1 className="page-title">Noticeboard</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Noticeboard</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Notices and Add Form */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="row clearfix">
              <div className="col-lg-8 col-md-12">
                <NoticeList />
              </div>
              <div className="col-lg-4 col-md-12">
                <AddNoticeForm />
              </div>
            </div>
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default Noticeboard;
