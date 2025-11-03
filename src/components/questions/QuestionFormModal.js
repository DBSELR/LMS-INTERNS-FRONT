import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../../config";

function QuestionFormModal({ show, onHide, onSave, question }) {
  const [form, setForm] = useState({
    type: "MCQ",
    subject: "",
    topic: "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "",
    difficultyLevel: "Easy",
    programmeName: "",
    courseName: "",
    semesterId: "",
    createdBy: "",
  });

  const [programmeData, setProgrammeData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const decoded = jwtDecode(token);
      const userId = decoded?.UserId || decoded?.userId || decoded?.nameid;
      setForm(prev => ({ ...prev, createdBy: userId }));
    }
  }, []);

  useEffect(() => {
    if (question) {
      const inferredType =
        !question.optionA &&
        !question.optionB &&
        !question.optionC &&
        !question.optionD
          ? "Theory"
          : question.type || "MCQ";

      setForm(prev => ({
        ...prev,
        type: inferredType,
        subject: question.subject || "",
        topic: question.topic || "",
        questionText: question.questionText || "",
        optionA: question.optionA || "",
        optionB: question.optionB || "",
        optionC: question.optionC || "",
        optionD: question.optionD || "",
        correctOption: question.correctOption || "",
        difficultyLevel: question.difficultyLevel || "Easy",
        programmeName: question.programmeName || "",
        courseName: question.courseName || "",
        semesterId: question.semesterId || "",
      }));
    }
  }, [question]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${API_BASE_URL}/Programme/ProgrammesWithSemesters`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProgrammeData(data))
      .catch((err) => console.error("Failed to load programme data", err));
  }, []);

  useEffect(() => {
    const filtered = programmeData.filter(p => p.programmeName === form.programmeName);
    setCourses(filtered);
    setSemesters([...new Set(filtered.map(c => c.semester))]);
  }, [form.programmeName, programmeData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const isEdit = !!question;
    const id = question?.questionId || question?.id || question?.Id;
    const url = isEdit
      ? `${API_BASE_URL}/Question/${id}`
      : `${API_BASE_URL}/Question`;
    const method = isEdit ? "PUT" : "POST";

    const requiredFields = [
      "type", "subject", "topic", "questionText",
      ...(form.type === "MCQ"
        ? ["optionA", "optionB", "optionC", "optionD", "correctOption"]
        : []),
      "programmeName", "courseName", "semesterId", "createdBy"
    ];

    for (let field of requiredFields) {
      if (!form[field]) {
        alert(`Please fill out: ${field}`);
        return;
      }
    }

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to save question.");
      }

      onSave();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{ display: show ? "block" : "none", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{question ? "Edit" : "Add"} Question</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                <option value="MCQ">MCQ</option>
                <option value="Theory">Theory</option>
              </select>
            </div>

            {/* <div className="form-group">
                              <label>Subject</label>
                              <select
              className="form-control"
              name="examinationId"
              value={programmeData.examinationId}
              onChange={handleAssignmentChange}
              required
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.ExaminationId} value={course.ExaminationId}>
                  {course.PaperCode}-{course.PaperName} ({course.Semester}/{course.BatchName || "N/A"})
                </option>
              ))}
            </select>

                            </div> */}


            <div className="mb-2">
              <select name="programmeName" className="form-control" value={form.programmeName} onChange={handleChange}>
                <option value="">-- Select Programme --</option>
                {[...new Set(programmeData.map(p => p.programmeName))].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <select name="courseName" className="form-control" value={form.courseName} onChange={handleChange}>
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.courseId} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <select name="semesterId" className="form-control" value={form.semesterId} onChange={handleChange}>
                <option value="">-- Select Semester --</option>
                {semesters.map((s, i) => (
                  <option key={i} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            {["subject", "topic", "questionText"].map((key) => (
              <div className="mb-2" key={key}>
                <input
                  type="text"
                  name={key}
                  className="form-control"
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={form[key]}
                  onChange={handleChange}
                />
              </div>
            ))}

            {form.type === "MCQ" && ["optionA", "optionB", "optionC", "optionD", "correctOption"].map((key) => (
              <div className="mb-2" key={key}>
                <input
                  type="text"
                  name={key}
                  className="form-control"
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={form[key]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="mb-2">
              <select
                name="difficultyLevel"
                className="form-control"
                value={form.difficultyLevel}
                onChange={handleChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
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

export default QuestionFormModal;
