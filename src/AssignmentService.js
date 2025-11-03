import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/assignmentsubmission/`;

const createAssignment = async (assignmentData) => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${API_URL}create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create assignment');
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

const submitAssignment = async (assignmentData) => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${API_URL}submit`, {
      method: 'POST',
      body: assignmentData, // FormData will be used here
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to submit assignment');
    }
    return await response.json();
  } catch (error) {
    console.error("Error submitting assignment:", error);
    throw error;
  }
};

const gradeAssignment = async (gradingData) => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${API_URL}grade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(gradingData),
    });

    if (!response.ok) {
      throw new Error('Failed to grade assignment');
    }
    return await response.json();
  } catch (error) {
    console.error("Error grading assignment:", error);
    throw error;
  }
};

const getAssignmentsForStudent = async (studentId) => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${API_URL}by-student/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
};

export default {
  createAssignment,
  submitAssignment,
  gradeAssignment,
  getAssignmentsForStudent,
};
