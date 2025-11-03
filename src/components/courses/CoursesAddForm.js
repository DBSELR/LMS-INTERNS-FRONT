import React from "react";

function CoursesAddForm() {
  return (
    <div className="row clearfix">
      <div className="col-lg-6 col-md-12 col-sm-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add New Course</h3>
          </div>
          <div className="card-body">
            <form>
              <div className="form-group">
                <label>Course Name</label>
                <input type="text" className="form-control" placeholder="Course Name" />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input type="text" className="form-control" placeholder="3 Months" />
              </div>
              <div className="form-group">
                <label>Fee</label>
                <input type="text" className="form-control" placeholder="$500" />
              </div>
              <div className="form-group">
                <label>Instructor</label>
                <input type="text" className="form-control" placeholder="Instructor Name" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" className="form-control no-resize" placeholder="Course Description"></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Add Course</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursesAddForm;
