import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../config";

function ExamFormModal({ show, onHide, onSave, exam }) {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    examDate: "",
    durationMinutes: 60
  });

  useEffect(() => {
    if (exam) {
      setForm(exam);
    } else {
      setForm({
        title: "",
        subject: "",
        examDate: "",
        durationMinutes: 60
      });
    }
  }, [exam]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("jwt");
    const url = exam
      ? `${API_BASE_URL}/Exam/${exam.id}`
      : `${API_BASE_URL}/Exam`;
    const method = exam ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });

    onSave();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{exam ? "Edit" : "Add"} Exam</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="Exam Title"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <input
                type="text"
                name="subject"
                className="form-control"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <input
                type="datetime-local"
                name="examDate"
                className="form-control"
                value={form.examDate}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <input
                type="number"
                name="durationMinutes"
                className="form-control"
                placeholder="Duration in Minutes"
                value={form.durationMinutes}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onHide}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamFormModal;
