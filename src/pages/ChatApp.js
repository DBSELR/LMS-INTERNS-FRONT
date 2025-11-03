import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

function ChatApp() {
  return (
    <div id="main_content" className="font-muli theme-blush">
      {/* Page Loader */}
      <div className="page-loader-wrapper">
        <div className="loader"></div>
      </div>

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Student" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">

            {/* Jumbotron Header */}
            <div className="jumbotron bg-light p-4 rounded shadow-sm mb-4 d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h2 className="mb-2 text-primary">💬 Chat Application</h2>
                <p className="text-muted mb-0">Stay connected with your friends and classmates here.</p>
              </div>
              <ol className="breadcrumb bg-transparent p-0 m-0 mt-3 mt-md-0">
                <li className="breadcrumb-item">
                  <a href="#" className="text-secondary">LMS</a>
                </li>
                <li className="breadcrumb-item active text-dark">Chat</li>
              </ol>
            </div>

            {/* Chat Layout */}
            <div className="row">
              <div className="col-lg-12">
                <div className="card shadow-sm">
                  <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      Friends Group <small className="text-light d-block mt-1">Last seen: 2 hours ago</small>
                    </h6>
                    <div className="card-options">
                      <a href="#" className="p-1 chat_list_btn text-white"><i className="fa fa-align-right"></i></a>
                      <a href="#" className="p-1 text-white"><i className="fa fa-plus"></i></a>
                      <a href="#" className="p-1 text-white"><i className="fa fa-cog"></i></a>
                      <a href="#" className="p-1 text-white"><i className="fa fa-refresh"></i></a>
                    </div>
                  </div>

                  <div className="card-body chat_windows">
                    <ul className="chat-messages mb-0 list-unstyled">
                      <li className="other-message d-flex mb-3">
                        <img className="avatar mr-3 rounded-circle" src="../assets/images/xs/avatar2.jpg" alt="avatar" />
                        <div className="message bg-light-blue p-3 rounded">
                          <p className="mb-1">Are we meeting today?</p>
                          <small className="text-muted">10:10 AM, Today</small>
                        </div>
                      </li>

                      <li className="my-message d-flex justify-content-end mb-3">
                        <div className="message bg-light-gray p-3 rounded text-right">
                          <p className="mb-1">Yes, I’ll share details soon.</p>
                          <small className="text-muted">10:12 AM, Today</small>
                        </div>
                      </li>
                    </ul>

                    {/* Chat Input */}
                    <div className="chat-message d-flex align-items-center mt-4">
                      <div className="input-group">
                        <input type="text" className="form-control" placeholder="Enter text here..." />
                        <div className="input-group-append">
                          <button className="btn btn-primary" type="button">
                            <i className="icon-paper-plane"></i>
                          </button>
                        </div>
                      </div>

                      <div className="ml-3 d-flex">
                        <a href="#" className="p-2 text-secondary"><i className="icon-camera"></i></a>
                        <a href="#" className="p-2 text-secondary"><i className="icon-camcorder"></i></a>
                      </div>
                    </div>

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

export default ChatApp;
