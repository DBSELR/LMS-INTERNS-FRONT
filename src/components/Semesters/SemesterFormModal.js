// src/components/semesters/SemesterFormModal.jsx

import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import API_BASE_URL from "../../config";

function SemesterFormModal({ show, onHide, onSave, semester }) {
  const [form, setForm] = useState({
    semesterName: "",
    startDate: "",
    endDate: "",
    status: "Upcoming",
    feeStatus: "Pending"
  });

  useEffect(() => {
    if (semester) {
      setForm({
        semesterName: semester.semesterName,
        startDate: semester.startDate?.slice(0, 10),
        endDate: semester.endDate?.slice(0, 10),
        status: semester.status,
        feeStatus: semester.feeStatus
      });
    } else {
      setForm({
        semesterName: "",
        startDate: "",
        endDate: "",
        status: "Upcoming",
        feeStatus: "Pending"
      });
    }
  }, [semester]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = semester
      ? `${API_BASE_URL}/Semester/Update/${semester.semesterId}`
      : `${API_BASE_URL}/Semester/Create`;

    const method = semester ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Request failed");

      onSave();
      onHide();
    } catch (err) {
      console.error("Error saving semester", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{semester ? "Edit Semester" : "Add Semester"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Semester Name</Form.Label>
            <Form.Control
              type="text"
              name="semesterName"
              value={form.semesterName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Upcoming</option>
              <option>Active</option>
              <option>Locked</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Fee Status</Form.Label>
            <Form.Control
              as="select"
              name="feeStatus"
              value={form.feeStatus}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>Paid</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" variant="primary">
            {semester ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default SemesterFormModal;
