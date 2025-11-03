// src/components/courses/CourseTable.jsx
import React from "react";

function CourseTable({ courses, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">All Courses</h3>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="thead-light">
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Semester</th>
                <th>Credits</th>
                <th>Description</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.courseId}>
                  <td>{course.name}</td>
                  <td>{course.courseCode}</td>
                  <td>{course.semester}</td>
                  <td>{course.credits}</td>
                  <td>{course.courseDescription}</td>
                  <td className="text-right">
                    <button className="btn btn-sm btn-outline-info mr-1" onClick={() => onEdit(course)}>
                      <i className="fa fa-edit" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(course.courseId)}>
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CourseTable;
