import React from "react";

function QuestionTable({ questions, onEdit, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Topic</th>
            <th>Question</th>
            <th>Difficulty</th>
            <th>Correct Option</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id}>
              <td>{q.subject}</td>
              <td>{q.topic}</td>
              <td>{q.questionText}</td>
              <td>{q.difficultyLevel}</td>
              <td>{q.correctOption}</td>
              <td>
                {/* Uncomment for editing support */}
                <button className="btn btn-primary me-2" onClick={() => onEdit(q)}>Edit</button>
                <button className="btn btn-danger" onClick={() => onDelete(q.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuestionTable;
