// File: src/components/Student/SubmitAssignment.js
import React, { useState } from 'react';
import API_BASE_URL from "../../config";

const SubmitAssignment = ({ assignmentId, studentId }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Send a POST request to create the submission
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/assignmentsubmission/submit?assignmentId=${assignmentId}&studentId=${studentId}`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error creating submission.');
      }

      const result = await response.json();
      setMessage(`Assignment submitted successfully: ${result.filePath}`);
    } catch (error) {
      setMessage('Error submitting assignment.');
    }
  };

  return (
    <div>
      <h3>Submit Assignment</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Submit Assignment</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SubmitAssignment;
