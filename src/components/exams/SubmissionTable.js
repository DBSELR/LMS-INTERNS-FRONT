import React from "react";

function SubmissionTable({ submissions, onReview }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Student</th>
            <th>Exam</th>
            <th>Score</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.submissionId}>
              <td>{s.studentName}</td>
              <td>{s.examTitle}</td>
              <td>{s.totalScore}</td>
              <td>{new Date(s.submittedAt).toLocaleString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => onReview(s.submissionId)}
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubmissionTable;
