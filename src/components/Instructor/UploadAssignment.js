// File: src/components/Instructor/UploadAssignment.js
import React, { useState } from 'react';
import API_BASE_URL from "../../config";

const UploadAssignment = ({ courseId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const assignmentData = {
      title,
      description,
      dueDate,
      assignmentType,
      courseId,
    };

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${API_BASE_URL}/assignment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignmentData),
      });

      if (response.ok) {
        setMessage('Assignment uploaded successfully!');
      } else {
        setMessage('Error uploading assignment.');
      }
    } catch (error) {
      setMessage('Error uploading assignment.');
    }
  };

  return (
    <div>
      <h3>Upload Assignment</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)} required>
          <option value="Quiz">Quiz</option>
          <option value="Homework">Homework</option>
          <option value="Project">Project</option>
        </select>
        <button type="submit">Upload Assignment</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadAssignment;
