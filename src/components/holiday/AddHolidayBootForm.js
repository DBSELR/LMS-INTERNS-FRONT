import React, { useState } from "react";

function AddHolidayBootForm() {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    start: "",
    end: "",
    description: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Holiday (Bootstrap Style):", form);
    alert("Holiday submitted successfully!");
  };

  return (
    <div className="row clearfix">
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add Holiday (Bootstrap Style)</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Holiday Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="start"
                  value={form.start}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="end"
                  value={form.end}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-success">Submit Holiday</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddHolidayBootForm;
