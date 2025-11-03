import API_BASE_URL from "../../config";
// File: src/services/apiService.js

// Example of uploading assignment (Instructor)
export const uploadAssignment = (assignmentData) => {
  const token = localStorage.getItem("jwt");
  return fetch(`${API_BASE_URL}/assignment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(assignmentData),
  });
};

// Example of submitting assignment (Student)
export const submitAssignment = (assignmentId, studentId, fileData) => {
  const token = localStorage.getItem("jwt");
  const formData = new FormData();
  formData.append('file', fileData);
  return fetch(`${API_BASE_URL}/assignmentsubmission/submit?assignmentId=${assignmentId}&studentId=${studentId}`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Example of grading assignment (Instructor)
export const gradeAssignment = (gradedSubmission) => {
  const token = localStorage.getItem("jwt");
  return fetch(`${API_BASE_URL}/assignmentsubmission/grade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(gradedSubmission),
  });
};
