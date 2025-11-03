import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import API_BASE_URL from "../config";

function InstructorExamAttachQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const fetchQuestions = async () => {
      const allRes = await fetch(`${API_BASE_URL}/Question`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const examRes = await fetch(`${API_BASE_URL}/Exam/${id}/Questions`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const all = await allRes.json();
      const linked = await examRes.json();
      setQuestions(all);
      setSelectedIds(linked.map((q) => q.id));
    };

    fetchQuestions();
  }, [id]);

  const handleToggle = (qid) => {
    setSelectedIds((prev) =>
      prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid]
    );
  };

  const handleSave = async () => {
    const token = localStorage.getItem("jwt");
    const res = await fetch(`${API_BASE_URL}/InstructorExam/${id}/AddQuestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
     },
      body: JSON.stringify(selectedIds),
    });

    if (res.ok) {
      alert("✅ Questions updated!");
      navigate("/instructor/exams");
    } else {
      alert("❌ Failed to update questions");
    }
  };

  return (
    <div id="main_content" className="font-muli theme-blush">
      <div className="page-loader-wrapper"><div className="loader"></div></div>
      <HeaderTop />
      <RightSidebar />
      <LeftSidebar />

      <div className="page">
        <div className="section-body">
          <div className="container-fluid">
            <h3>Attach Questions to Exam #{id}</h3>
            {questions.length === 0 ? (
              <p>Loading questions...</p>
            ) : (
              <form>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Question</th>
                        <th>Topic</th>
                        <th>Subject</th>
                        <th>Difficulty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q) => (
                        <tr key={q.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(q.id)}
                              onChange={() => handleToggle(q.id)}
                            />
                          </td>
                          <td>{q.questionText}</td>
                          <td>{q.topic}</td>
                          <td>{q.subject}</td>
                          <td>{q.difficultyLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-success" type="button" onClick={handleSave}>
                  Save Selection
                </button>
              </form>
            )}
          </div>
        </div>
         
      </div>
    </div>
  );
}

export default InstructorExamAttachQuestions;
