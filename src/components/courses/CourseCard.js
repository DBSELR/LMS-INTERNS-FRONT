import React from "react";

function CourseCard({ course }) {
  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card shadow-sm border-0">
        <div className="card-body d-flex flex-column align-items-start">
          <div className="icon-box bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
            <i className="fa fa-book fa-2x text-primary"></i>
          </div>
          <h5 className="text-dark mb-1">{course.name}</h5>
          <p className="text-muted mb-2">{course.description}</p>
          <ul className="list-unstyled text-muted small mb-3">
            <li><i className="fa fa-user mr-1"></i> Instructor: {course.instructor}</li>
            <li><i className="fa fa-clock-o mr-1"></i> Duration: {course.duration}</li>
            <li><i className="fa fa-users mr-1"></i> Enrolled: {course.students}</li>
            <li><i className="fa fa-dollar mr-1"></i> Fees: {course.fees}</li>
          </ul>
          <a href="#" className="btn btn-sm btn-outline-primary mt-auto">View Details</a>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
