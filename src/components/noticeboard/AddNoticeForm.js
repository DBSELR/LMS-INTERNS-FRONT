import React, { useState } from "react";
import API_BASE_URL from "../../config";

function AddNoticeForm() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    date: "",
    content: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Notice Submitted:", form);
    alert("Notice added successfully!");
    setForm({ title: "", author: "", date: "", content: "" });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Add New Notice</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Notice Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Author</label>
            <input
              type="text"
              name="author"
              className="form-control"
              value={form.author}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              className="form-control"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Notice Content</label>
            <textarea
              name="content"
              className="form-control"
              rows="4"
              value={form.content}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Add Notice</button>
        </form>
      </div>
    </div>
  );
}

export default AddNoticeForm;
