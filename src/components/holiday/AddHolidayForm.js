import React, { useState } from "react";

function AddHolidayForm() {
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
    console.log("Holiday Submitted:", form);
    alert("Holiday added successfully!");
  };

  return (
    <div className="row clearfix">
      <div className="col-lg-6 col-md-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add Holiday</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Holiday Title</label>
                <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" name="subject" className="form-control" value={form.subject} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="start" className="form-control" value={form.start} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="end" className="form-control" value={form.end} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-control" rows="3" value={form.description} onChange={handleChange}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Add Holiday</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddHolidayForm;
