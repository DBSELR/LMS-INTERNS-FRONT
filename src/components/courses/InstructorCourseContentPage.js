import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeaderTop from "../../components/HeaderTop";
import RightSidebar from "../../components/RightSidebar";
import LeftSidebar from "../../components/LeftSidebar";
import Footer from "../../components/Footer";
import API_BASE_URL from "../../config";

function InstructorCourseContentPage() {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [videos, setVideos] = useState([]);
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    contentType: "PDF"
  });
  const [file, setFile] = useState(null);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Content/Course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMaterials(data.filter(c => c.contentType === "PDF"));
      setVideos(data.filter(c => c.contentType === "Video"));
    } catch (err) {
      console.error("Failed to fetch content", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    formData.append("title", newContent.title);
    formData.append("description", newContent.description);
    formData.append("contentType", newContent.contentType);

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${API_BASE_URL}/Content/UploadFile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      setNewContent({ title: "", description: "", contentType: "PDF" });
      setFile(null);
      fetchContent();
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed");
    }
  };

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  return (
    <div id="main_content" className="font-muli theme-blush">
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Instructor" />

      <div className="page">
        <div className="section-body mt-3">
          <div className="container-fluid">

            <div className="jumbotron bg-light p-4 rounded shadow-sm d-flex justify-content-between align-items-center flex-wrap mb-4">
              <div>
                <h2 className="text-primary mb-2">📚 Course Content</h2>
                <p className="text-muted mb-0">Course ID: <strong>{courseId}</strong></p>
              </div>
              <a href="/instructor/courses" className="btn btn-outline-primary mt-3 mt-md-0">
                <i className="fa fa-arrow-left mr-1"></i> Back to Courses
              </a>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                <h6 className="mb-0">Upload New Content</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleUpload}>
                  <div className="form-group">
                    <label>Title</label>
                    <input className="form-control" value={newContent.title} onChange={e => setNewContent({ ...newContent, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" value={newContent.description} onChange={e => setNewContent({ ...newContent, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Select File</label>
                    <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required />
                  </div>
                  <div className="form-group">
                    <label>Content Type</label>
                    <select className="form-control" value={newContent.contentType} onChange={e => setNewContent({ ...newContent, contentType: e.target.value })}>
                      <option value="PDF">PDF / Material</option>
                      <option value="Video">Video</option>
                    </select>
                  </div>
                  <button className="btn btn-primary" type="submit">Upload</button>
                </form>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">Materials</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {materials.map((mat, idx) => (
                    <div className="col-md-4 mb-3" key={idx}>
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <h6 className="text-primary">{mat.title}</h6>
                          <p className="text-muted">{mat.description}</p>
                          <a href={mat.fileUrl} className="btn btn-sm btn-outline-primary mt-auto" target="_blank" rel="noreferrer">View</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">Videos</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {videos.map((vid, idx) => (
                    <div className="col-md-4 mb-3" key={idx}>
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <h6 className="text-primary">{vid.title}</h6>
                          <p className="text-muted">{vid.description}</p>
                          <a href={vid.fileUrl} className="btn btn-sm btn-outline-info mt-auto" target="_blank" rel="noreferrer">Watch</a>
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

export default InstructorCourseContentPage;
