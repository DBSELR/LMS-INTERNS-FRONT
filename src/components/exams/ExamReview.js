import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../config";

function ExamReview({ submissionId, onClose }) {
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/ExamSubmissions/${submissionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setSubmission(data);
        setAnswers(data.answers);
      });
  }, [submissionId]);

  const handleScoreChange = (id, score) => {
    setAnswers(prev =>
      prev.map(a => (a.id === id ? { ...a, scoreAwarded: score } : a))
    );
  };

  const handleFeedbackChange = (id, feedback) => {
    setAnswers(prev =>
      prev.map(a => (a.id === id ? { ...a, instructorFeedback: feedback } : a))
    );
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("jwt");
    for (let ans of answers) {
      await fetch(`${API_BASE_URL}/ExamGrading/ManualGrade/${ans.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(ans.scoreAwarded),
      });
    }
    alert("Manual grading submitted.");
    onClose();
  };

  if (!submission) return <div>Loading...</div>;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-xl" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Review Submission</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {answers.map((a, i) => (
              <div key={a.id} className="mb-4 border p-3 rounded bg-light">
                <p><strong>Q{i + 1}:</strong> {a.questionText}</p>
                <p><strong>Answer:</strong> {a.studentAnswer}</p>
                <div className="row">
                  <div className="col-md-3">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      className="form-control"
                      value={a.scoreAwarded}
                      onChange={(e) => handleScoreChange(a.id, parseFloat(e.target.value))}
                      placeholder="Score"
                    />
                  </div>
                  <div className="col-md-9">
                    <input
                      type="text"
                      className="form-control"
                      value={a.instructorFeedback || ""}
                      onChange={(e) => handleFeedbackChange(a.id, e.target.value)}
                      placeholder="Instructor Feedback (optional)"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit Grades</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamReview;
