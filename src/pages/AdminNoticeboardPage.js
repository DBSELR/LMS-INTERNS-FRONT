import React, { useEffect, useState } from "react";
import HeaderTop from "../components/HeaderTop";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function AdminNoticeboardPage() {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    image: null,
    file: null
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/Notice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setNotices(data);
    } catch (err) {
      console.error("Failed to fetch notices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("date", form.date);
    if (form.image) formData.append("image", form.image);
    if (form.file) formData.append("file", form.file);

    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const url = editingId
        ? `${API_BASE_URL}/Notice/Update/${editingId}`
        : `${API_BASE_URL}/Notice/create-with-file`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData });
      if (!res.ok) throw new Error("Upload failed");
      fetchNotices();
      setForm({ title: "", description: "", date: "", image: null, file: null });
      setEditingId(null);
      setActiveTab("list");
    } catch (err) {
      console.error("Failed to submit notice", err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await fetch(`${API_BASE_URL}/Notice/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotices((prev) => prev.filter((n) => n.noticeId !== id));
    } catch (err) {
      console.error("Failed to delete notice", err);
    }
  };

  const handleEdit = (notice) => {
    setForm({
      title: notice.title,
      description: notice.description,
      date: notice.date.split("T")[0],
      image: null,
      file: null
    });
    setEditingId(notice.noticeId);
    setActiveTab("create");
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      {loading && (
        <div className="page-loader-wrapper">
          <div className="loader"></div>
        </div>
      )}

      <HeaderTop />
      <RightSidebar />
      <LeftSidebar role="Admin" />
      
      <div className="section-wrapper">
      <div className="page admin-dashboard pt-0">
        <div className="section-body mt-3 pt-0">
          <div className="container-fluid">
            <div className="jumbotron bg-light rounded shadow-sm mb-3 welcome-card dashboard-hero">
              <h2 className="page-title text-primary pt-0 dashboard-hero-title">Manage Noticeboard</h2>
              <p className="text-muted mb-0 dashboard-hero-sub">Create and publish notices visible to students.</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-header border-bottom-0 pb-0">
                <ul className="nav nav-tabs px-3" style={{ borderBottom: "2px solid #ddd" }}>
                  <li className="nav-item">
                    <button
                      className={`nav-link text-dark fw-bold border-0 ${activeTab === "list" ? "active" : ""}`}
                      style={{ borderBottom: activeTab === "list" ? "3px solid #5a67d8" : "", backgroundColor: "transparent" }}
                      onClick={() => setActiveTab("list")}
                    >
                      <i className="fa fa-bullhorn mr-1 text-primary"></i> All Notices
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link text-dark fw-bold border-0 ${activeTab === "create" ? "active" : ""}`}
                      style={{ borderBottom: activeTab === "create" ? "3px solid #5a67d8" : "", backgroundColor: "transparent" }}
                      onClick={() => setActiveTab("create")}
                    >
                      <i className="fa fa-plus mr-1 text-primary"></i> {editingId ? "Update Notice" : "Create Notice"}
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body" style={{ padding: "1rem" }}>
                {activeTab === "list" && (
                  <div id="notice-list">
                    {notices.length === 0 ? (
                      <div className="text-center text-muted py-4">No notices published yet.</div>
                    ) : (
                      <div className="row">
                        {notices.map((n) => (
                          <div className="col-md-6 mb-3" key={n.noticeId}>
                            <div className="card h-100">
                              <div className="card-body" >
                                <h5 className="card-title">{n.title}</h5>
                                <p className="text-muted small mb-2">{new Date(n.date).toLocaleDateString()}</p>
                                <p className="card-text">{n.description}</p>
                                {n.imageUrl && <img src={n.imageUrl} alt="notice" className="img-fluid mb-2" />}
                                {n.fileUrl && (
                                  <a
                                    href={n.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-secondary mr-2"
                                  >
                                    Download File
                                  </a>
                                )}
                                <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => handleEdit(n)}>
                                  <i className="fa fa-pencil"></i> Edit
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(n.noticeId)}>
                                  <i className="fa fa-trash"></i> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "create" && (
                  <div id="notice-create">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" className="form-control" required value={form.title} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Date</label>
                        <input type="date" name="date" className="form-control" required value={form.date} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" className="form-control" required rows="3" value={form.description} onChange={handleChange}></textarea>
                      </div>
                      <div className="form-group">
                        <label>Optional Image</label>
                        <input type="file" name="image" className="form-control-file" accept="image/*" onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Optional File</label>
                        <input type="file" name="file" className="form-control-file" onChange={handleChange} />
                      </div>
                      <button type="submit" className="btn btn-primary">
                        {editingId ? "Update Notice" : "Publish Notice"}
                      </button>
                    </form>
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

export default AdminNoticeboardPage;
