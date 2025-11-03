import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import GalleryTabs from "../components/gallery/GalleryTabs";
import API_BASE_URL from "../config";

function Gallery() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        {/* Header */}
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Gallery</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Gallery</li>
                </ol>
              </div>
              <div className="d-flex align-items-center">
                <div className="input-group mr-2">
                  <input type="text" className="form-control" placeholder="Search photos..." />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary"><i className="fa fa-search"></i></button>
                  </div>
                </div>
                <select className="form-control mr-2">
                  <option>Newest</option>
                  <option>Oldest</option>
                </select>
                <button className="btn btn-primary">Upload</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Grid View */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            <GalleryTabs />
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default Gallery;
