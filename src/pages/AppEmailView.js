import React from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

function AppEmailView() {
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
                <h1 className="page-title">Email View</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">App</a></li>
                  <li className="breadcrumb-item"><a href="/email">Inbox</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Email View</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="section-body mt-4">
          <div className="container-fluid">
            <div className="row row-deck">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <a href="/email"><i className="fa fa-arrow-left"></i></a> Back
                    </h3>
                    <div className="card-options">
                      <a href="#"><i className="fe fe-star"></i></a>
                      <a href="#"><i className="fe fe-inbox"></i></a>
                      <a href="#"><i className="fe fe-trash"></i></a>
                      <a href="#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fe fe-maximize"></i></a>
                      <div className="item-action dropdown ml-2">
                        <a href="#" data-toggle="dropdown"><i className="fe fe-more-vertical"></i></a>
                        <div className="dropdown-menu dropdown-menu-right">
                          <a className="dropdown-item" href="#"><i className="dropdown-icon fa fa-eye"></i> View Details</a>
                          <a className="dropdown-item" href="#"><i className="dropdown-icon fa fa-share-alt"></i> Share</a>
                          <a className="dropdown-item" href="#"><i className="dropdown-icon fa fa-cloud-download"></i> Download</a>
                          <div className="dropdown-divider"></div>
                          <a className="dropdown-item" href="#"><i className="dropdown-icon fa fa-copy"></i> Copy to</a>
                          <a className="dropdown-item" href="#"><i className="dropdown-icon fa fa-folder"></i> Move to</a>
                          <a className="dropdown-item" href="#"><i className="dropdown-icon fa fa-edit"></i> Rename</a>
                          <a className="dropdown-item" href="#"><i className="dropdown-icon fa fa-trash"></i> Delete</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-body detail">
                    <div className="detail-header">
                      <div className="media">
                        <div className="mr-3">
                          <img src="../assets/images/xs/avatar1.jpg" alt="avatar" />
                        </div>
                        <div className="media-body">
                          <p className="mb-0"><strong className="text-muted mr-1">From:</strong><a href="#">info@gmail.com</a><span className="text-muted text-sm float-right">12:48, 23.06.2023</span></p>
                          <p className="mb-0"><strong className="text-muted mr-1">To:</strong>Me <small className="float-right"><i className="fe fe-paperclip mr-1"></i>(2 files, 89.2 KB)</small></p>
                        </div>
                      </div>
                    </div>

                    <div className="mail-cnt mt-3">
                      <p>Hello <strong>Marshall Nichols</strong>,</p>
                      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
                      <ul>
                        <li>Standard dummy text since the 1500s</li>
                        <li>Used widely in publishing</li>
                      </ul>
                      <p>It has survived not only five centuries...</p>

                      <div className="file_folder d-flex mt-4">
                        {[
                          { icon: "fa-file-excel-o", color: "text-success", name: "Report2017.xls" },
                          { icon: "fa-file-word-o", color: "text-primary", name: "Report2017.doc" },
                          { icon: "fa-file-pdf-o", color: "text-danger", name: "Report2017.pdf" },
                        ].map((f, i) => (
                          <a key={i} href="#" className="mr-3">
                            <div className="icon"><i className={`fa ${f.icon} ${f.color}`}></i></div>
                            <div className="file-name">
                              <p className="mb-0 text-muted">{f.name}</p>
                              <small>Size: 68KB</small>
                            </div>
                          </a>
                        ))}
                      </div>

                      <p className="mt-4">Thank you,<br /><strong>Wendy Abbott</strong></p>
                      <hr />
                      <strong>Click here to</strong>{" "}
                      <a href="/compose">Reply</a> or <a href="/compose">Forward</a>
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

export default AppEmailView;
