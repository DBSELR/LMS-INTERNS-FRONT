import React, { useState } from 'react';
import AssignmentService from '../services/AssignmentService';
import API_BASE_URL from "../config";

const StudentSubmitAssignment = ({ assignmentId, studentId }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', assignmentId);
    formData.append('studentId', studentId);

    try {
      const response = await AssignmentService.submitAssignment(formData);
      setMessage('Assignment submitted successfully!');
    } catch (error) {
      setMessage('Error submitting assignment.');
    }
  };

  return (
    <div>
      <h3>Submit Assignment</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit">Submit Assignment</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default StudentSubmitAssignment;
