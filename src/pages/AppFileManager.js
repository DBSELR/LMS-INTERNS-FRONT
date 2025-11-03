import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import FileCard from "../components/filemanager/FileCard";
import FileTable from "../components/filemanager/FileTable";

function AppFileManager() {
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
                <h1 className="page-title">App Filemanager</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Filemanager</li>
                </ol>
              </div>
              <div className="d-flex align-items-center">
                <button className="btn btn-primary">Upload Files</button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent File/Folders */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            <h5 className="mb-3">Recently Accessed Files</h5>
            <div className="row clearfix">
              <FileCard />
            </div>
          </div>
        </div>

        {/* File Table List */}
        <div className="section-body">
          <div className="container-fluid">
            <div className="row clearfix">
              <div className="col-12">
                <div className="card">
                  <div className="table-responsive">
                    <FileTable />
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

export default AppFileManager;
