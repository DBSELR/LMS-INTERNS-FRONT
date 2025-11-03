import React from "react";

const EducationTab = ({ student }) => {
  if (!student) return null;

  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead className="thead-light">
          <tr>
            <th>Programme</th>
            <th>Semester</th>
            <th>Course ID</th>
            <th>City</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{student.programme}</td>
            <td>{student.semester}</td>
            <td>{student.courseId}</td>
            <td>{student.city}</td>
            <td>{student.country}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EducationTab;