import React from "react";
import TransportTable from "../components/transport/TransportTable";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

function TransportPage() {
  return (
    <div id="main_content" className="font-muli theme-blush">
    {/* <div className="page-loader-wrapper"><div className="loader"></div></div> */}

    <HeaderTop />
    <RightSidebar />
    <LeftSidebar />

    <div className="page">
      <div className="section-body">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="page-title">Transport</h1>
            <ol className="breadcrumb page-breadcrumb">
              <li className="breadcrumb-item">
                <a href="#">LMS</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Transport
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="section-body mt-4">
        <div className="container-fluid">
          <ul className="nav nav-tabs page-header-tab">
            <li className="nav-item">
              <a className="nav-link active" data-toggle="tab" href="#Transport-all">
                Transport List
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href="#Transport-add">
                Add Transport
              </a>
            </li>
          </ul>

          <div className="tab-content">
            <div className="tab-pane active" id="Transport-all">
              <TransportTable />
            </div>
            {/* Add other tab contents */}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default TransportPage;
