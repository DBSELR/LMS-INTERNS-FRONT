import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../config";

function PracticeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const exam = location.state?.exam;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const decoded = jwtDecode(token);
      const uid = decoded["UserId"] || decoded.userId || decoded.nameid;
      setUserId(uid);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (id) {
      fetch(`${API_BASE_URL}/Question/GetStudentPracticeExamWithQuestions/${id}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setQuestions(shuffled);
          const duration = data[0]?.durationMinutes || 60;
          setDurationMinutes(duration);
          setTimeLeft(duration * 60);
        })
        .catch((err) => console.error("❌ Failed to load practice exam", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
  };

const handleSubmit = async (auto = false) => {
  if (!userId || !id || !exam) {
    console.error("❌ Missing required fields:", { userId, id, exam });
    alert("❌ Missing exam details. Cannot submit.");
    return;
  }

  const payload = {
    userId: parseInt(userId),
    examId: parseInt(id),
    answers: Object.entries(answers).map(([questionId, studentAnswer]) => ({
      questionId: parseInt(questionId),
      studentAnswer,
    })),
  };

  console.log("📤 Submitting practice exam with payload:", payload);

  try {
    const token = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/ExamSubmissions/PracticeExamSubmit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const resultText = await res.text();
    console.log("📥 Raw server response:", resultText);

    if (!res.ok) throw new Error(resultText);

    alert(auto ? "⏰ Time's up! Practice Exam auto-submitted." : "✅ Practice Exam submitted successfully!");

    // ✅ Navigate back using the actual examinationID from exam object
    navigate(`/my-courseware`);
  } catch (err) {
    console.error("❌ Submission failed:", err);
    alert("❌ Failed to submit practice exam.");
  }
};




  const current = questions[currentIndex];

  return (
    <div className="container my-4">
      <div className="exam-card p-4 rounded animate__animated animate__fadeIn">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <div>
            <h5 className="text-dark mb-1">📝 Practice: {exam?.title || "Exam"}</h5>
            <span className="text-muted small">
              Total Questions: <strong>{questions.length}</strong> &nbsp;&nbsp;
              Marks: <strong>{exam?.totmrk || "--"}</strong>
            </span>
          </div>
          <div className="text-end">
            <div className="badge bg-warning fs-6 px-3 py-2" style={{ fontSize: "15px" }}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Question Block */}
        {loading ? (
          <div className="text-muted">Loading practice questions...</div>
        ) : !current ? (
          <div className="text-danger">No questions available.</div>
        ) : (
          <>
            <div className="mb-4">
              <h6 className="text-primary mb-3">
                Question {currentIndex + 1} of {questions.length}
              </h6>
              <h5 style={{ fontWeight: "bold" }}>{current.questionText}</h5>
              <div>
                {["A", "B", "C", "D"].map((opt) => {
                  const value = current[`option${opt}`];
                  const checked = answers[current.qid] === opt;
                  return (
                    <div
                      key={opt}
                      className="form-check mb-3 p-2"
                      style={{ transition: "all 0.2s ease-in-out" }}
                    >
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`question-${current.qid}`}
                        id={`q${current.qid}-${opt}`}
                        value={opt}
                        checked={checked}
                        onChange={() => handleChange(current.qid, opt)}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor={`q${current.qid}-${opt}`}
                        style={{
                          fontWeight: "600",
                          color: checked ? "#5a67d8" : "#333",
                        }}
                      >
                        {value}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={currentIndex === 0}
              >
                ⬅ Previous
              </button>
              {currentIndex === questions.length - 1 ? (
                <button className="btn btn-success" onClick={() => handleSubmit(false)}>
                  ✅ Finish Practice
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentIndex((i) => i + 1)}
                >
                  Next ➡
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PracticeExam;
