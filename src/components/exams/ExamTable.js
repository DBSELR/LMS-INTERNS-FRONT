import React from "react";

function ExamTable({ exams, onEdit, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Title</th>
            <th>Subject</th>
            <th>Date</th>
            <th>Duration (min)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id}>
              <td>{exam.title}</td>
              <td>{exam.subject}</td>
              <td>{new Date(exam.examDate).toLocaleString()}</td>
              <td>{exam.durationMinutes}</td>
              <td>
                <button className="btn btn-primary me-2" onClick={() => onEdit(exam)}>Edit</button>
                <button className="btn btn-danger" onClick={() => onDelete(exam.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExamTable;
