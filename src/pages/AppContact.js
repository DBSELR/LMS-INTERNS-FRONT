import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import ContactListTab from "../components/contact/ContactListTab";
import ContactGridTab from "../components/contact/ContactGridTab";
import ContactAddNewTab from "../components/contact/ContactAddNewTab";

function AppContact() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body" id="page_top">
          <div className="container-fluid">
            <div className="page-header">
              <div className="left">
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="What you want to find" />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button">Search</button>
                  </div>
                </div>
              </div>
              <div className="right">
                <ul className="nav nav-pills">
                  <li className="nav-item">
                    <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#">Pages</a>
                    <div className="dropdown-menu">
                      <a className="dropdown-item" href="#">Profile</a>
                      <a className="dropdown-item" href="#">Invoices</a>
                      <a className="dropdown-item" href="#">Timeline</a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Contact</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Contact</li>
                </ol>
              </div>
              <ul className="nav nav-tabs page-header-tab">
                <li className="nav-item"><a className="nav-link active" data-toggle="tab" href="#list"><i className="fa fa-list-ul"></i> List</a></li>
                <li className="nav-item"><a className="nav-link" data-toggle="tab" href="#grid"><i className="fa fa-th"></i> Grid</a></li>
                <li className="nav-item"><a className="nav-link" data-toggle="tab" href="#addnew"><i className="fa fa-plus"></i> Add New</a></li>
              </ul>
            </div>

            <div className="tab-content">
              <div className="tab-pane fade show active" id="list">
                <ContactListTab />
              </div>
              <div className="tab-pane fade" id="grid">
                <ContactGridTab />
              </div>
              <div className="tab-pane fade" id="addnew">
                <ContactAddNewTab />
              </div>
            </div>
          </div>
        </div>

         
      </div>
    </div>
  );
}

export default AppContact;
