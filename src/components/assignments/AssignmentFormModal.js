import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import API_BASE_URL from "../../config";

function AssignmentFormModal({ show, onHide, onSave, assignment }) {
  const [form, setForm] = useState({
    courseId: 1, // Assuming course ID is 1, update based on the actual course selection
    title: "",
    description: "",
    dueDate: "",
    maxGrade: "",
    assignmentType: "Homework", // Default to Homework
  });

  useEffect(() => {
    if (assignment) {
      setForm({
        courseId: assignment.courseId || 1,
        title: assignment.title || "",
        description: assignment.description || "",
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : "",
        maxGrade: assignment.maxGrade || "",
        assignmentType: assignment.assignmentType || "Homework",
      });
    }
  }, [assignment]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const url = assignment
       ? `${API_BASE_URL}/Assignment/edit/${assignment.assignmentId}`
      : `${API_BASE_URL}/Assignment/create`;

    const method = assignment ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const result = await response.json();
        onSave(result); // Use onSave callback to update parent component state
        onHide();
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        alert("Error: " + errorData.errors);
      }
    } catch (err) {
      console.error("Failed to submit form", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{assignment ? "Edit Assignment" : "Add Assignment"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="dueDate">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="datetime-local"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="maxGrade">
            <Form.Label>Max Grade</Form.Label>
            <Form.Control
              type="number"
              name="maxGrade"
              value={form.maxGrade}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="assignmentType">
            <Form.Label>Assignment Type</Form.Label>
            <Form.Control
              type="text"
              name="assignmentType"
              value={form.assignmentType}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AssignmentFormModal;
