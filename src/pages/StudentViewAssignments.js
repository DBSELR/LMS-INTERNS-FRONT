import React, { useState, useEffect } from 'react';
import AssignmentService from '../services/AssignmentService';
import API_BASE_URL from "../config";

const StudentViewAssignments = ({ studentId }) => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        
        const data = await AssignmentService.getAssignmentsForStudent(studentId);
        setAssignments(data);
      } catch (error) {
        console.error("Error fetching assignments", error);
      }
    };
    fetchAssignments();
  }, [studentId]);

  return (
    <div>
      <h2>Your Assignments</h2>
      <ul>
        {assignments.map((assignment) => (
          <li key={assignment.assignmentId}>
            <h3>{assignment.title}</h3>
            <p>{assignment.description}</p>
            <p>Due Date: {new Date(assignment.dueDate).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentViewAssignments;
