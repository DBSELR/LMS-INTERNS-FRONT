import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

function AppCompose() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      {/* Loader */}
      <div className="page-loader-wrapper"><div className="loader"></div></div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      {/* Page Content */}
      <div className="page">
        {/* Top Search & Dropdowns */}
        <div className="section-body" id="page_top">
          <div className="container-fluid">
            <div className="page-header">
              <div className="left">
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="What you want to find" />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary">Search</button>
                  </div>
                </div>
              </div>
              <div className="right">
                <ul className="nav nav-pills">
                  <li className="nav-item dropdown">
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

        {/* Compose Header & Form */}
        <div className="section-body">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Compose</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">App</a></li>
                  <li className="breadcrumb-item"><a href="#">Inbox</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Compose</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Compose Form */}
        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="row row-deck">
              <div className="col-12">
                <div className="card">
                  <div className="card-body mail_compose">
                    <form>
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="To" />
                      </div>
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="Subject" />
                      </div>
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="CC" />
                      </div>
                    </form>
                    <div className="summernote">
                      <p>Hello there,</p>
                      <p>The toolbar can be customized and it also supports various callbacks such as <code>oninit</code>, <code>onfocus</code>, <code>onpaste</code>.</p>
                      <p>Please try <b>paste some texts</b> here</p>
                    </div>
                    <div className="mt-4 text-right">
                      <button type="button" className="btn btn-success">Send Message</button>
                      <button type="button" className="btn btn-outline-secondary">Draft</button>
                      <a href="/chat" className="btn btn-outline-secondary">Cancel</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
         
      </div>
    </div>
  );
}

export default AppCompose;
