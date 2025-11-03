import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import HeaderTop from "../components/HeaderTop";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Footer from "../components/Footer";
import QuestionTable from "../components/questions/QuestionTable";
import QuestionFormModal from "../components/questions/QuestionFormModal";
import API_BASE_URL from "../../config";

function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const token = localStorage.getItem("jwt");
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
    } catch (err) {
      console.error("JWT decode error", err);
    }
  }

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/Question`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      console.error("Error fetching questions", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const token = localStorage.getItem("jwt");
        await fetch(`${API_BASE_URL}/Question/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchQuestions();
      } catch (err) {
        console.error("Error deleting question", err);
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setSelectedQuestion(null);
    fetchQuestions();
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
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-action">
                <h1 className="page-title">Question Bank</h1>
                <ol className="breadcrumb page-breadcrumb">
                  <li className="breadcrumb-item"><a href="#">LMS</a></li>
                  <li className="breadcrumb-item active" aria-current="page">Questions</li>
                </ol>
              </div>
              {role !== "Student" && (
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  Add New Question
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="section-body mt-4">
          <div className="container-fluid">
            <QuestionTable questions={questions} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>

         
      </div>

      {showModal && (
        <QuestionFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleSave}
          question={selectedQuestion}
        />
      )}
    </div>
  );
}

export default AdminQuestions;
