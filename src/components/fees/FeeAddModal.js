import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import API_BASE_URL from "../../config";

function FeeAddModal({ show, onHide, onSave }) {
  const [form, setForm] = useState({
    studentId: "",
    amountDue: "",
    amountPaid: "",
    feeStatus: "Pending",
    paymentDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.studentId || !form.amountDue) {
      alert("Student ID and Amount Due are required.");
      return;
    }

    try {
      const token = localStorage.getItem("jwt");
      await fetch(`${API_BASE_URL}/Fee/Add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      onSave();
    } catch (err) {
      console.error("Fee creation failed", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Fee Record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Student ID</Form.Label>
            <Form.Control
              type="number"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Amount Due</Form.Label>
            <Form.Control
              type="number"
              name="amountDue"
              value={form.amountDue}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Amount Paid</Form.Label>
            <Form.Control
              type="number"
              name="amountPaid"
              value={form.amountPaid}
              onChange={handleChange}
            />
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
              <option>Overdue</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Payment Date</Form.Label>
            <Form.Control
              type="date"
              name="paymentDate"
              value={form.paymentDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Add Fee</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default FeeAddModal;
