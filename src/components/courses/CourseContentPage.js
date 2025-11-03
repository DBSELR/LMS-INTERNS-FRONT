// src/pages/course/CourseContentPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import API_BASE_URL from "../../config";

function CourseContentPage() {
  const { courseId } = useParams();

  // Dummy course content
  const materials = [
    { title: "Introduction to React", type: "PDF", link: "#" },
    { title: "Advanced React Hooks", type: "PDF", link: "#" },
    { title: "React Cheat Sheet", type: "PDF", link: "#" }
  ];

  const videos = [
    { title: "Getting Started with React", duration: "15 mins", link: "#" },
    { title: "React Hooks Deep Dive", duration: "30 mins", link: "#" },
    { title: "Optimizing React Performance", duration: "25 mins", link: "#" }
  ];

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">

            {/* Jumbotron Header */}
            <div className="jumbotron bg-light p-4 rounded shadow-sm d-flex justify-content-between align-items-center flex-wrap mb-4">
              <div>
                <h2 className="text-primary mb-2">📚 Course Content</h2>
                <p className="text-muted mb-0">Course ID: <strong>{courseId}</strong></p>
              </div>
              <a href="/admin/courses" className="btn btn-outline-primary mt-3 mt-md-0">
                <i className="fa fa-arrow-left mr-1"></i> Back to Courses
              </a>
            </div>

            {/* Course Material Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex align-items-center">
                <i className="fa fa-file-pdf-o mr-2"></i>
                <h6 className="mb-0">Materials (PDFs / Docs)</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {materials.map((material, idx) => (
                    <div className="col-md-4 mb-3" key={idx}>
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <h6 className="text-primary">{material.title}</h6>
                          <p className="text-muted mb-2">{material.type}</p>
                          <a href={material.link} className="btn btn-sm btn-outline-primary mt-auto">View Material</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Video Section */}
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white d-flex align-items-center">
                <i className="fa fa-video-camera mr-2"></i>
                <h6 className="mb-0">Videos</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {videos.map((video, idx) => (
                    <div className="col-md-4 mb-3" key={idx}>
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <h6 className="text-primary">{video.title}</h6>
                          <p className="text-muted mb-2">{video.duration}</p>
                          <a href={video.link} className="btn btn-sm btn-outline-info mt-auto">Watch Video</a>
                        </div>
                      </div>
                    </div>
                  ))}
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
