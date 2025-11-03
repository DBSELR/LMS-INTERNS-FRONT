import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function InstructorGradeView() {
  const { id } = useParams(); // submissionId
  const [submission, setSubmission] = useState(null);
  const [grading, setGrading] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/InstructorExam/SubmissionDetails/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setSubmission(data);
        setGrading(data.answers.map(a => ({
          answerId: a.answerId,
          score: a.scoreAwarded || 0,
          feedback: a.instructorFeedback || ""
        })));
      })
      .catch(err => console.error("Failed to fetch submission", err));
  }, [id]);

  const handleGradeChange = (index, field, value) => {
    const updated = [...grading];
    updated[index][field] = field === "score" ? parseFloat(value) : value;
    setGrading(updated);
  };

  const handleSubmit = () => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/InstructorExam/GradeSubmission`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
       },
      body: JSON.stringify({
        submissionId: parseInt(id),
        answers: grading
      })
    })
      .then(res => res.json())
      .then(() => {
        alert("Submission graded successfully!");
      
        window.location.href = "/instructor/grade-list";
      })
      .catch(err => {
        console.error("Grade submission failed", err);
        alert("Failed to submit grades.");
      });
  };

  return (
    <div className="container mt-4">
      <h3>Grading: {submission?.examTitle}</h3>
      <p>Submitted at: {new Date(submission?.submittedAt).toLocaleString()}</p>

      <form>
        {submission?.answers.map((a, index) => (
          <div key={index} className="mb-4 p-3 border rounded">
            <p><strong>Question:</strong> {a.questionText}</p>
            <p><strong>Student Answer:</strong> {a.studentAnswer}</p>
            <p><strong>Correct Option:</strong> {a.correctOption}</p>
            <div className="form-group">
              <label>Score</label>
              <input
                type="number"
                className="form-control"
                value={grading[index]?.score}
                onChange={(e) => handleGradeChange(index, "score", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Feedback</label>
              <textarea
                className="form-control"
                value={grading[index]?.feedback}
                onChange={(e) => handleGradeChange(index, "feedback", e.target.value)}
              />
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-success" onClick={handleSubmit}>
          Submit Grades
        </button>
      </form>
    </div>
  );
}

export default InstructorGradeView;
