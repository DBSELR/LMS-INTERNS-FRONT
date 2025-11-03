import React from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import InvoiceList from "../components/invoices/InvoiceList";
import InvoiceDetail from "../components/invoices/InvoiceDetail";
import API_BASE_URL from "../config";

function Invoices() {
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
                <h1 className="page-title">Invoices</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Invoices</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Tabs */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            <ul className="nav nav-tabs page-header-tab">
              <li className="nav-item"><a className="nav-link active" data-toggle="tab" href="#invoice-list">Invoice List</a></li>
              <li className="nav-item"><a className="nav-link" data-toggle="tab" href="#invoice-detail">Invoice Detail</a></li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane fade show active" id="invoice-list">
                <InvoiceList />
              </div>
              <div className="tab-pane fade" id="invoice-detail">
                <InvoiceDetail />
              </div>
            </div>
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default Invoices;
