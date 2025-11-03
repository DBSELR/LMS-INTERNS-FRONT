import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../config";

function QuestionSelector({ examId, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/Question`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("jwt");
    await fetch(`${API_BASE_URL}/Exam/${examId}/AddQuestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(selected),
    });
    alert("Questions linked to exam!");
    onClose();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Questions for Exam</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{ maxHeight: "500px", overflowY: "auto" }}>
            {questions.map((q) => (
              <div key={q.id} className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`q-${q.id}`}
                  checked={selected.includes(q.id)}
                  onChange={() => handleToggle(q.id)}
                />
                <label htmlFor={`q-${q.id}`} className="form-check-label">
                  <strong>{q.subject}</strong> - {q.questionText}
                </label>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Save Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionSelector;
