import React from "react";

function CoursesAddBootForm() {
  return (
    <div className="row clearfix">
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add Course (Bootstrap Style)</h3>
          </div>
          <div className="card-body">
            <form className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Course Name</label>
                <input type="text" className="form-control" placeholder="Course Name" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Instructor</label>
                <input type="text" className="form-control" placeholder="Instructor Name" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Duration</label>
                <input type="text" className="form-control" placeholder="e.g. 4 Months" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Fee</label>
                <input type="text" className="form-control" placeholder="$400" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Seats Available</label>
                <input type="number" className="form-control" placeholder="e.g. 100" />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" placeholder="Course Description"></textarea>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-success">Submit Course</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursesAddBootForm;
