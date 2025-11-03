import React from "react";

function CourseInfoCard() {
  return (
    <div className="card">
      {/* Course Image */}
      <img
        className="card-img-top"
        src="../assets/images/course/course1.jpg"
        alt="Course"
      />
      <div className="card-body">
        {/* Course Info Table */}
        <h6 className="text-uppercase font-14">Course Information</h6>
        <table className="table table-bordered mb-0">
          <tbody>
            <tr>
              <td><strong>Date:</strong></td>
              <td>August 1, 2024</td>
            </tr>
            <tr>
              <td><strong>Duration:</strong></td>
              <td>3 Months</td>
            </tr>
            <tr>
              <td><strong>Fee:</strong></td>
              <td>$450</td>
            </tr>
            <tr>
              <td><strong>Students:</strong></td>
              <td>85 Enrolled</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Instructor Box */}
      <div className="card-footer">
        <div className="media align-items-center">
          <img
            className="avatar avatar-md mr-3"
            src="../assets/images/xs/avatar2.jpg"
            alt="Instructor"
          />
          <div className="media-body">
            <h6 className="mb-0">Emily Brown</h6>
            <span className="text-muted">Lead Instructor</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseInfoCard;
