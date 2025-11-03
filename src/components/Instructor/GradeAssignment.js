// File: src/components/Instructor/GradeAssignment.js
import React, { useState } from 'react';
import API_BASE_URL from "../../config";

const GradeAssignment = ({ assignmentId, studentId }) => {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const handleGradeChange = (e) => setGrade(e.target.value);
  const handleFeedbackChange = (e) => setFeedback(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gradedSubmission = {
      assignmentId,
      studentId,
      grade,
      feedback,
    };

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/assignmentsubmission/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gradedSubmission),
      });

      if (response.ok) {
        setMessage('Grade and feedback submitted successfully');
      } else {
        setMessage('Error grading assignment.');
      }
    } catch (error) {
      setMessage('Error grading assignment.');
    }
  };

  return (
    <div>
      <h3>Grade Assignment</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Grade"
          value={grade}
          onChange={handleGradeChange}
        />
        <textarea
          placeholder="Feedback"
          value={feedback}
          onChange={handleFeedbackChange}
        />
        <button type="submit">Submit Grade</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default GradeAssignment;
