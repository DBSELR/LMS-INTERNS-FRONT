import React from "react";

function DepartmentAddBootForm() {
  return (
    <div className="row clearfix">
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add Department (Bootstrap Style)</h3>
          </div>
          <div className="card-body">
            <form className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Department Name</label>
                <input type="text" className="form-control" placeholder="e.g. Mathematics" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Head of Department</label>
                <input type="text" className="form-control" placeholder="e.g. Dr. Alice Williams" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Established</label>
                <input type="date" className="form-control" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" placeholder="dept@example.com" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Phone</label>
                <input type="text" className="form-control" placeholder="(123) 456-7890" />
              </div>
              <div className="col-md-12">
                <label className="form-label">Capacity</label>
                <input type="number" className="form-control" placeholder="e.g. 100" />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" placeholder="Department description..."></textarea>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-success">Submit Department</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepartmentAddBootForm;
