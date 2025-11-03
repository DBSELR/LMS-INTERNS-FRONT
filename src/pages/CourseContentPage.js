import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";

function CourseContentPage() {
  const [loading, setLoading] = useState(false);

  // Dummy Course Content
  const courseDetails = {
    title: "Introduction to ReactJS",
    description: "Learn the fundamentals of building modern web applications using React.",
    instructor: "John Doe",
    duration: "6 Weeks",
  };

  const materials = [
    { id: 1, title: "React Basics.pdf", type: "PDF", link: "#" },
    { id: 2, title: "State Management.pptx", type: "Presentation", link: "#" },
    { id: 3, title: "React Router Guide.docx", type: "Document", link: "#" },
  ];

  const videos = [
    { id: 1, title: "Introduction to React", duration: "15 min", link: "#" },
    { id: 2, title: "Components and Props", duration: "20 min", link: "#" },
    { id: 3, title: "State and Lifecycle", duration: "18 min", link: "#" },
  ];

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">

            {/* Jumbotron Header */}
            <div className="jumbotron bg-light p-4 rounded shadow-sm d-flex justify-content-between align-items-center flex-wrap mb-4">
              <div>
                <h2 className="text-primary mb-2">{courseDetails.title}</h2>
                <p className="text-muted mb-0">{courseDetails.description}</p>
                <small className="text-muted">Instructor: {courseDetails.instructor} | Duration: {courseDetails.duration}</small>
              </div>
            </div>

            {/* Materials Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex align-items-center">
                <i className="fa fa-book mr-2"></i>
                <h6 className="mb-0">Course Materials</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {materials.map((material) => (
                    <div key={material.id} className="col-lg-4 col-md-6 mb-4">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <h6 className="text-primary">{material.title}</h6>
                          <p className="text-muted mb-2">{material.type}</p>
                          <a href={material.link} className="btn btn-sm btn-outline-primary mt-auto">
                            View / Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  {materials.length === 0 && (
                    <div className="col-12 text-center text-muted py-4">
                      <p>No course materials available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Videos Section */}
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white d-flex align-items-center">
                <i className="fa fa-video-camera mr-2"></i>
                <h6 className="mb-0">Course Videos</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {videos.map((video) => (
                    <div key={video.id} className="col-lg-4 col-md-6 mb-4">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <h6 className="text-success">{video.title}</h6>
                          <p className="text-muted mb-2">Duration: {video.duration}</p>
                          <a href={video.link} className="btn btn-sm btn-outline-success mt-auto">
                            Watch Video
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  {videos.length === 0 && (
                    <div className="col-12 text-center text-muted py-4">
                      <p>No videos uploaded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

         
      </div>
    </div>
  );
}

export default CourseContentPage;
